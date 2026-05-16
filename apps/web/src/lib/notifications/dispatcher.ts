import type { NotificationChannel } from "@/types";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  transactionId?: string;
  channels: NotificationChannel[];
  metadata?: Record<string, unknown>;
}

export async function dispatch(payload: NotificationPayload): Promise<void> {
  const promises: Promise<unknown>[] = [];

  for (const channel of payload.channels) {
    switch (channel) {
      case "sms":
        promises.push(sendSms(payload));
        break;
      case "whatsapp":
        promises.push(sendWhatsApp(payload));
        break;
      case "email":
        promises.push(sendEmail(payload));
        break;
      case "in_app":
        promises.push(saveInApp(payload));
        break;
    }
  }

  await Promise.allSettled(promises);
}

async function sendSms(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) return;

  await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "ApiKey": apiKey,
      "Accept": "application/json",
    },
    body: new URLSearchParams({
      username,
      to: payload.userId,
      message: `${payload.title}: ${payload.body}`.slice(0, 160),
      from: process.env.AT_SENDER_ID || "TrustBridg",
    }),
  });
}

async function sendWhatsApp(payload: NotificationPayload): Promise<void> {
  const { sendWhatsApp: wa } = await import("./whatsapp");
  await wa({ to: payload.userId, body: `${payload.title}\n\n${payload.body}` });
}

async function sendEmail(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  // Resend API integration
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TrustBridge <notifications@trustbridge.co.ke>",
      to: payload.userId,
      subject: payload.title,
      text: payload.body,
    }),
  });
}

async function saveInApp(payload: NotificationPayload): Promise<void> {
  const { db } = await import("@/lib/db");
  const { notifications } = await import("@/lib/db/schema");

  await db.insert(notifications).values({
    userId: payload.userId,
    transactionId: payload.transactionId || null,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    channels: payload.channels,
  });
}
