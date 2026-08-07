import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import type { LedgerType } from "@/generated/prisma/client";

// Maps the internal ledger enum onto the transaction types the wallet/history
// UI understands (see lib/transactionUtils.js). `credit` decides the +/- sign
// the UI shows, so debits (bets, withdrawals) must map to non-credit types.
const LEDGER_MAP: Record<LedgerType, { type: string; description: string }> = {
  WELCOME_BONUS: { type: "bonus_credit", description: "Sign In Reward" },
  DEPOSIT_APPROVED: { type: "deposit", description: "Deposit Approved" },
  DEPOSIT_BONUS: { type: "bonus_credit", description: "Deposit Bonus" },
  WITHDRAW_APPROVED: { type: "withdrawal", description: "Withdrawal" },
  WITHDRAW_REJECTED_REFUND: { type: "locked_release", description: "Withdrawal failure" },
  WITHDRAW_REQUESTED: { type: "withdrawal", description: "Withdrawal" },
  BET_PLACED: { type: "bet_deduction", description: "Place Order" },
  BET_WON: { type: "winning_credit", description: "Win A Prize" },
  BET_LOST: { type: "bet_deduction", description: "Bet Lost" },
  ADMIN_ADJUST: { type: "admin_adjustment", description: "Balance Adjustment" },
  REWARD_CLAIMED: { type: "referral_bonus", description: "Reward Claimed" },
  GIFT_CODE_REDEEMED: { type: "bonus_credit", description: "Gift Code Redeemed" },
  WATER_REWARD: { type: "bonus_credit", description: "Water Reward" },
  RED_ENVELOPE_CLAIMED: { type: "bonus_credit", description: "Red Envelope" },
};

function periodFromMeta(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  const raw = m.periodId ?? m.roundNumber ?? m.round;
  return raw != null ? String(raw) : null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "Not authorized, token invalid or expired" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 25)));
    const skip = (page - 1) * limit;

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet) {
      return NextResponse.json({
        success: true,
        data: { transactions: [], pagination: { total: 0, page, limit } },
      });
    }

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ledgerEntry.count({ where: { walletId: wallet.id } }),
    ]);

    const transactions = entries.map((entry) => {
      const mapped = LEDGER_MAP[entry.type] ?? {
        type: "credit",
        description: entry.type.replace(/_/g, " ").toLowerCase(),
      };
      return {
        id: entry.id,
        type: mapped.type,
        status: "completed",
        amount: Math.abs(entry.amount),
        balanceAfter: entry.balanceAfter,
        description: (entry.meta as Record<string, unknown> | null)?.description as string || mapped.description,
        periodId: periodFromMeta(entry.meta),
        createdAt: entry.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: { transactions, pagination: { total, page, limit } },
    });
  } catch (error) {
    console.error("GET transactions API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
