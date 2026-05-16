export type TransactionStatus =
  | "draft"
  | "pending_funds"
  | "funded"
  | "in_progress"
  | "in_inspection"
  | "completed"
  | "disputed"
  | "cancelled";

export type PaymentMethod =
  | "mpesa_stk"
  | "mpesa_paybill"
  | "pesalink"
  | "flutterwave"
  | "wire"
  | "usdc";

export type AssetClass =
  | "digital"
  | "physical"
  | "property"
  | "legal_data"
  | "business"
  | "services";

export type Currency = "KES" | "UGX" | "TZS" | "RWF" | "USD" | "EUR" | "GBP";

export type PartyRole =
  | "buyer"
  | "seller"
  | "agent"
  | "lawyer"
  | "observer";

export type NotificationChannel = "sms" | "whatsapp" | "email" | "in_app";
