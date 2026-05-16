import { getDarajaToken, getBaseUrl } from "./daraja";

interface B2CRequestParams {
  phone: string;
  amount: number;
  remarks: string;
  occasion: string;
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export async function initiateB2CRequest({
  phone,
  amount,
  remarks,
  occasion,
}: B2CRequestParams): Promise<B2CResponse> {
  const token = await getDarajaToken();

  const initiatorName = process.env.MPESA_B2C_INITIATOR_NAME;
  const securityCredential = process.env.MPESA_B2C_SECURITY_CREDENTIAL; // Encrypted with B2C cert
  const shortCode = process.env.MPESA_B2C_SHORTCODE;
  const callbackUrl = process.env.MPESA_B2C_CALLBACK_URL;

  if (!initiatorName || !securityCredential || !shortCode || !callbackUrl) {
    throw new Error(
      "MPESA_B2C_INITIATOR_NAME, MPESA_B2C_SECURITY_CREDENTIAL, MPESA_B2C_SHORTCODE, and MPESA_B2C_CALLBACK_URL must be set"
    );
  }

  const sanitizedPhone = phone.replace(/^\+/, "");

  const body = {
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: "BusinessPayment",
    Amount: Math.floor(amount),
    PartyA: shortCode,
    PartyB: sanitizedPhone,
    Remarks: remarks,
    QueueTimeOutURL: callbackUrl,
    ResultURL: callbackUrl,
    Occasion: occasion,
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`B2C request failed: ${res.status} ${errorText}`);
  }

  return res.json();
}
