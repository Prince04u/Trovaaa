import { prisma } from "@/lib/prisma";
import { getTemplateById } from "@/lib/admin/templates";
import { generatePredictionImage } from "@/lib/admin/imageGenerator";
import { sendPhotoToTelegram, sendTextToTelegram, sendAnimationToTelegram } from "@/lib/admin/telegram";
import { getRoundNumber, getRoundWindow } from "@/lib/wingo/rounds";
import type { WingoMode } from "@/generated/prisma/client";

interface TableRow {
  period: string;
  project: string; // emerd, sapre, parity, bcone, etc.
  colour: "Red" | "Green" | "Violet";
  amount: string;
  result: "WON" | "LOSS" | "PENDING" | "NULL";
  profit: string;
}

const DURATION_MAP: Record<string, WingoMode> = {
  "30s": "S30",
  "1m": "M1",
  "3m": "M3",
  "5m": "M5",
  "parity": "PARITY",
  "bcone": "BCONE",
  "sapre": "M3",
  "emerd": "M5",
};

// Maps color and predicted outcome (WON vs LOSS) to a Wingo digit outcome (0-9)
function getOverrideNumber(color: string, result: string): number {
  const normColor = String(color || "").trim().toLowerCase();
  const normResult = String(result || "").trim().toUpperCase();
  const wantWin = normResult !== "LOSS"; // WON, PENDING or NULL defaults to winning

  if (wantWin) {
    if (normColor === "green") return 3; // Green numbers: 1, 3, 7, 9
    if (normColor === "violet") return 5; // Violet/Green
    return 2; // Default to Red: 2, 4, 6, 8
  } else {
    // Force a loss: give opposite color
    if (normColor === "green") return 2; // Force Red
    if (normColor === "violet") return 1; // Force Green/non-violet
    return 3; // Force Green
  }
}

export async function processPredictionQueue(originUrl?: string) {
  const now = new Date();
  
  // Find all pending scheduled predictions due to be sent
  const pending = await prisma.scheduledPrediction.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
    },
    orderBy: [
      { priority: "desc" },
      { scheduledAt: "asc" },
      { createdAt: "asc" },
    ],
  });

  if (pending.length === 0) return;

  const origin = originUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  for (const pred of pending) {
    try {
      // Acquire lock atomically by transitioning status from PENDING to PROCESSING
      const lock = await prisma.scheduledPrediction.updateMany({
        where: { id: pred.id, status: "PENDING" },
        data: { status: "PROCESSING" },
      });

      if (lock.count === 0) {
        console.log(`[Queue] Prediction ${pred.id} already locked/processed. Skipping.`);
        continue;
      }

      console.log(`[Queue] Processing scheduled prediction ${pred.id}...`);

      if (pred.gifUrl) {
        // Handle animated GIF message broadcast
        if (pred.gifUrl.startsWith("data:")) {
          const matches = pred.gifUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");
            const ext = mimeType.split("/")[1] || "gif";
            const filename = `animation.${ext}`;
            await sendAnimationToTelegram(
              buffer,
              pred.messageText || undefined,
              pred.chatId || undefined,
              filename,
              mimeType
            );
          } else {
            throw new Error("Invalid base64 Data URL format for GIF");
          }
        } else {
          await sendAnimationToTelegram(pred.gifUrl, pred.messageText || undefined, pred.chatId || undefined);
        }
      } else if (pred.messageText) {
        // Handle plain text message broadcast
        await sendTextToTelegram(pred.messageText, pred.chatId || undefined);
      } else {
        // Handle standard prediction chart image broadcast
        const template = await getTemplateById(pred.templateId || "");
        if (!template) {
          throw new Error(`Template not found: ${pred.templateId}`);
        }

        const headerValues = JSON.parse(pred.headerValues || "{}");
        const rows = JSON.parse(pred.rows || "[]") as TableRow[];

        // Dynamically resolve row period numbers based on the scheduled execution time if placeholder used
        const baseRoundNumbers: Record<string, bigint> = {};
        rows.forEach((row) => {
          const cleanPeriod = String(row.period || "").trim();
          const isNumeric = /^\d+$/.test(cleanPeriod);
          if (!isNumeric) {
            const modeStr = String(row.project || "").toLowerCase();
            const mode = DURATION_MAP[modeStr];
            if (mode) {
              if (baseRoundNumbers[mode] === undefined) {
                baseRoundNumbers[mode] = getRoundNumber(mode, pred.scheduledAt.getTime());
              } else {
                baseRoundNumbers[mode] = baseRoundNumbers[mode] + BigInt(1);
              }
              row.period = String(baseRoundNumbers[mode]);
            }
          }
        });

        // Generate the prediction chart image
        const imageBuffer = await generatePredictionImage(
          template,
          headerValues,
          rows,
          pred.isLast,
          origin
        );

        // Broadcast image directly to Telegram with no text caption
        await sendPhotoToTelegram(imageBuffer, undefined, pred.chatId || undefined);

        // Handle Wingo Pre-Result Overrides if enabled
        if (pred.autoOverrideWingo && rows.length > 0) {
          for (const row of rows) {
            const modeStr = String(row.project || "").toLowerCase();
            const mode = DURATION_MAP[modeStr];
            const periodIdStr = String(row.period || "").replace(/\D/g, "");

            if (mode && periodIdStr) {
              let roundNumber = BigInt(periodIdStr);
              // Expand 11-digit round numbers to 16-digits for auto override matching
              if (periodIdStr.length === 11) {
                const datePart = periodIdStr.substring(0, 8);
                const countPart = periodIdStr.substring(8);
                let middle = "00000";
                if (mode === "PARITY") middle = "00300";
                else if (mode === "BCONE") middle = "00390";
                else if (mode === "S30") middle = "03000";
                else if (mode === "M1") middle = "00100";
                else if (mode === "M3") middle = "00300";
                else if (mode === "M5") middle = "00500";
                roundNumber = BigInt(datePart + middle + countPart);
              }
              const { endsAt } = getRoundWindow(mode, roundNumber);

              // Only override if the round has not ended/settled yet
              if (Date.now() < endsAt) {
                const winningNumber = getOverrideNumber(row.colour, row.result);
                
                // Check if override already exists for this mode & round
                const existingOverride = await prisma.resultOverride.findFirst({
                  where: { mode, roundNumber },
                });

                if (!existingOverride) {
                  await prisma.resultOverride.create({
                    data: {
                      mode,
                      roundNumber,
                      number: winningNumber,
                      createdById: pred.createdById,
                    },
                  });
                  console.log(`[Queue] Auto-set override: ${mode} round #${roundNumber} → ${winningNumber}`);
                }
              }
            }
          }
        }
      }

      // Mark prediction as successfully sent
      await prisma.scheduledPrediction.update({
        where: { id: pred.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      console.log(`[Queue] Scheduled prediction ${pred.id} sent successfully.`);
    } catch (err: any) {
      console.error(`[Queue] Failed to process scheduled prediction ${pred.id}:`, err);
      
      await prisma.scheduledPrediction.update({
        where: { id: pred.id },
        data: {
          status: "FAILED",
          error: err.message || String(err),
        },
      });
    }
  }
}
