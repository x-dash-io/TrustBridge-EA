import { createHmac } from "crypto";

interface EnhancedKycRequest {
  partner_id: string;
  transaction_id: string;
  user_id: string;
  id_number: string;
  id_type: string;
  country: string;
  first_name: string;
  last_name: string;
  dob?: string;
  callback_url: string;
}

export class SmileIdentityClient {
  private partnerId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.partnerId = process.env.SMILE_ID_PARTNER_ID || "";
    this.apiKey = process.env.SMILE_ID_API_KEY || "";
    this.baseUrl = process.env.SMILE_ID_BASE_URL || "https://api.smileidentity.com/v1";
  }

  private generateSignature(timestamp: string): string {
    const message = `${timestamp}${this.partnerId}sid_request`;
    return createHmac("sha256", this.apiKey).update(message).digest("base64");
  }

  async submitEnhancedKyc(params: Omit<EnhancedKycRequest, "partner_id" | "callback_url">) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);

    const body = {
      ...params,
      partner_id: this.partnerId,
      callback_url: process.env.SMILE_ID_CALLBACK_URL,
      timestamp,
      signature,
    };

    const res = await fetch(`${this.baseUrl}/enhanced_kyc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Smile ID Enhanced KYC failed: ${res.status} ${errorText}`);
    }

    return res.json();
  }

  async getJobStatus(jobId: string) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);

    const res = await fetch(`${this.baseUrl}/job_status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partner_id: this.partnerId,
        job_id: jobId,
        timestamp,
        signature,
      }),
    });

    if (!res.ok) {
      throw new Error(`Smile ID job status failed: ${res.status}`);
    }

    return res.json();
  }
}

export const smileId = new SmileIdentityClient();
