export interface SmsMessage {
  to: string;
  message: string;
}

export async function sendSms(message: SmsMessage): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn("SMS: Africa's Talking credentials not configured");
    return { success: false };
  }

  try {
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "ApiKey": apiKey,
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        username,
        to: message.to,
        message: message.message.slice(0, 160),
        from: process.env.AT_SENDER_ID || "TrustBridg",
      }),
    });

    if (!res.ok) {
      throw new Error(`SMS API error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.SMSMessageData?.Recipients?.[0]?.messageId };
  } catch (error) {
    console.error("SMS send failed:", error);
    return { success: false };
  }
}
