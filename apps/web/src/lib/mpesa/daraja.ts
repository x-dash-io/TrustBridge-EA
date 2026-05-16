const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || "sandbox";

const BASE_URLS = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
} as const;

let cachedToken: { token: string; expiresAt: number } | null = null;

export function getBaseUrl(): string {
  return BASE_URLS[MPESA_ENVIRONMENT as keyof typeof BASE_URLS] ?? BASE_URLS.sandbox;
}

export async function getDarajaToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Daraja auth failed: ${res.status} ${errorText}`);
  }

  const data: { access_token: string; expires_in: number } = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export interface StkPushRequest {
  phone: string;
  amount: number;
  transactionRef: string;
  callbackUrl: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkCallbackItem {
  Name: string;
  Value: string | number;
}

export interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: StkCallbackItem[];
  };
}

export interface DarajaCallbackBody {
  Body: {
    stkCallback: StkCallback;
  };
}
