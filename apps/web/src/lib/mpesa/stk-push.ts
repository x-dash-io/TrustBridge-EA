import { getDarajaToken, getBaseUrl, type StkPushResponse } from "./daraja";

function formatTimestamp(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}${M}${d}${h}${m}${s}`;
}

interface InitiateStkPushParams {
  phone: string;
  amount: number;
  transactionRef: string;
}

export async function initiateSTKPush({
  phone,
  amount,
  transactionRef,
}: InitiateStkPushParams): Promise<StkPushResponse> {
  const token = await getDarajaToken();

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_STK_CALLBACK_URL;

  if (!shortCode || !passkey || !callbackUrl) {
    throw new Error(
      "MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_STK_CALLBACK_URL must be set"
    );
  }

  const timestamp = formatTimestamp(new Date());
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  const sanitizedPhone = phone.replace(/^\+/, "");

  const body = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount),
    PartyA: sanitizedPhone,
    PartyB: shortCode,
    PhoneNumber: sanitizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: transactionRef,
    TransactionDesc: `TrustBridge Escrow: ${transactionRef}`,
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`STK push failed: ${res.status} ${errorText}`);
  }

  return res.json();
}
