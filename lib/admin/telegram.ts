import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8338089012:AAHf4Rd1Cb_qBdKV3W___kyyswIdhWWHz2w";
const DEFAULT_CHANNEL_ID = "@mason81631";

export async function sendPhotoToTelegram(
  photoBuffer: Buffer,
  caption?: string,
  chatId?: string
): Promise<boolean> {
  // Determine target channel ID:
  // 1. Explicit chatId parameter from the dispatch console
  // 2. Database Setting "telegram_channel_username"
  // 3. Environment Variable "TELEGRAM_CHANNEL_ID"
  // 4. Default fallback channel ID
  let targetChatId = chatId;

  if (!targetChatId) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "telegram_channel_username" },
      });
      if (setting && setting.value) {
        targetChatId = setting.value;
      }
    } catch (e) {
      console.warn("Failed to retrieve telegram_channel_username setting:", e);
    }
  }

  if (!targetChatId) {
    targetChatId = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  }

  const formData = new FormData();
  formData.append("chat_id", targetChatId);

  // Convert Buffer to Blob for standard Fetch multipart/form-data
  const blob = new Blob([new Uint8Array(photoBuffer)], { type: "image/png" });
  formData.append("photo", blob, "prediction_chart.png");

  if (caption) {
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
  }

  const token = TELEGRAM_BOT_TOKEN;
  console.log(`Sending photo to Telegram chat ID: ${targetChatId} using bot token: ${token.slice(0, 10)}...`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send photo to Telegram:", errorText);
    throw new Error(`Telegram SendPhoto error: ${errorText}`);
  }

  console.log("Photo successfully sent to Telegram!");
  return true;
}

export async function sendTextToTelegram(
  text: string,
  chatId?: string
): Promise<boolean> {
  let targetChatId = chatId;

  if (!targetChatId) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "telegram_channel_username" },
      });
      if (setting && setting.value) {
        targetChatId = setting.value;
      }
    } catch (e) {
      console.warn("Failed to retrieve telegram_channel_username setting for text:", e);
    }
  }

  if (!targetChatId) {
    targetChatId = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  }

  const token = TELEGRAM_BOT_TOKEN;
  console.log(`Sending text to Telegram chat ID: ${targetChatId}...`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: targetChatId,
      text: text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send text to Telegram:", errorText);
    throw new Error(`Telegram SendMessage error: ${errorText}`);
  }

  console.log("Text message successfully sent to Telegram!");
  return true;
}

export async function sendAnimationToTelegram(
  animationUrl: string,
  caption?: string,
  chatId?: string
): Promise<boolean> {
  let targetChatId = chatId;

  if (!targetChatId) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "telegram_channel_username" },
      });
      if (setting && setting.value) {
        targetChatId = setting.value;
      }
    } catch (e) {
      console.warn("Failed to retrieve telegram_channel_username setting for animation:", e);
    }
  }

  if (!targetChatId) {
    targetChatId = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  }

  const token = TELEGRAM_BOT_TOKEN;
  console.log(`Sending animation/GIF to Telegram chat ID: ${targetChatId}...`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendAnimation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: targetChatId,
      animation: animationUrl,
      caption: caption || undefined,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send animation/GIF to Telegram:", errorText);
    throw new Error(`Telegram SendAnimation error: ${errorText}`);
  }

  console.log("Animation successfully sent to Telegram!");
  return true;
}

export async function uploadMediaToTelegram(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  chatId?: string
): Promise<string> {
  let targetChatId = chatId;

  if (!targetChatId) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "telegram_channel_username" },
      });
      if (setting && setting.value) {
        targetChatId = setting.value;
      }
    } catch (e) {
      console.warn("Failed to retrieve telegram_channel_username setting for upload:", e);
    }
  }

  if (!targetChatId) {
    targetChatId = process.env.TELEGRAM_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  }

  const formData = new FormData();
  formData.append("chat_id", targetChatId);

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  formData.append("animation", blob, filename);

  const token = TELEGRAM_BOT_TOKEN;
  console.log(`[Upload] Uploading media file to Telegram chat ID: ${targetChatId}...`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendAnimation`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data.ok) {
    console.error("Failed to upload media to Telegram:", data);
    throw new Error(`Telegram sendAnimation failed during upload: ${JSON.stringify(data)}`);
  }

  const messageId = data.result.message_id;
  const fileId = data.result.animation?.file_id || data.result.video?.file_id;

  if (!fileId) {
    throw new Error("No file_id found in Telegram upload response");
  }

  // Delete the uploaded message immediately so users don't see it
  try {
    console.log(`[Upload] Deleting temporary upload message ${messageId} from ${targetChatId}...`);
    await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        message_id: messageId,
      }),
    });
  } catch (deleteErr) {
    console.warn("Failed to delete temporary Telegram message:", deleteErr);
  }

  return fileId;
}

