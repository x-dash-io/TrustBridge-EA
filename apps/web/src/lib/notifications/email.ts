export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("Email: Resend API key not configured");
    return { success: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TrustBridge <notifications@trustbridge.co.ke>",
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      }),
    });

    if (!res.ok) {
      throw new Error(`Email API error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false };
  }
}
