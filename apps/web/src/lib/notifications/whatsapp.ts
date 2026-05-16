export interface WhatsAppMessage {
  to: string;
  body: string;
  templateId?: string;
  mediaUrl?: string;
}

export async function sendWhatsApp(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn("WhatsApp: Africa's Talking credentials not configured");
    return { success: false };
  }

  // Africa's Talking WhatsApp Business API integration
  // Endpoint: POST https://api.africastalking.com/version1/messaging
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
        message: message.body,
        from: process.env.AT_WHATSAPP_PHONE || "",
      }),
    });

    if (!res.ok) {
      throw new Error(`WhatsApp API error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.SMSMessageData?.Recipients?.[0]?.messageId };
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return { success: false };
  }
}
