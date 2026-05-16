import type { NotificationChannel } from "@/types";
import { getUserById } from "@/lib/db/queries/users";
import {
  createNotification,
  createNotificationDelivery,
  updateNotificationDelivery,
} from "@/lib/db/queries/notifications";

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
  const user = await getUserById(payload.userId);
  if (!user) {
    throw new Error("Notification recipient user not found");
  }

  const notification = payload.channels.includes("in_app")
    ? await createNotification({
        userId: payload.userId,
        transactionId: payload.transactionId || null,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        channels: payload.channels,
      })
    : null;

  const failures: unknown[] = [];

  for (const channel of payload.channels) {
    const recipient = resolveRecipient(channel, user);
    const delivery = await createNotificationDelivery({
      notificationId: notification?.id || null,
      userId: payload.userId,
      channel,
      recipient,
      status: channel === "in_app" ? "sent" : "pending",
    });

    if (channel !== "in_app" && !recipient) {
      await updateNotificationDelivery(delivery.id, {
        status: "failed",
        error: `No ${channel} recipient configured for user`,
      });
      failures.push(new Error(`No ${channel} recipient configured for user`));
      continue;
    }

    try {
    switch (channel) {
      case "sms":
        await sendSms(recipient!, payload);
        break;
      case "whatsapp":
        await sendWhatsApp(recipient!, payload);
        break;
      case "email":
        await sendEmail(recipient!, payload);
        break;
      case "in_app":
        break;
    }
      await updateNotificationDelivery(delivery.id, { status: "sent" });
    } catch (error) {
      failures.push(error);
      await updateNotificationDelivery(delivery.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown notification failure",
      });
    }
  }

  if (failures.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(`${failures.length} notification channel(s) failed`);
  }
}

function resolveRecipient(channel: NotificationChannel, user: { email: string | null; phone: string | null }) {
  if (channel === "email") return user.email;
  if (channel === "sms" || channel === "whatsapp") return user.phone;
  return null;
}

async function sendSms(to: string, payload: NotificationPayload): Promise<void> {
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
      to,
      message: `${payload.title}: ${payload.body}`.slice(0, 160),
      from: process.env.AT_SENDER_ID || "TrustBridg",
    }),
  });
}

async function sendWhatsApp(to: string, payload: NotificationPayload): Promise<void> {
  const { sendWhatsApp: wa } = await import("./whatsapp");
  await wa({ to, body: `${payload.title}\n\n${payload.body}` });
}

async function sendEmail(to: string, payload: NotificationPayload): Promise<void> {
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
      to,
      subject: payload.title,
      text: payload.body,
    }),
  });
}
