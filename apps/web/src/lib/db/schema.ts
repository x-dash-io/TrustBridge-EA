import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "draft",
  "pending_funds",
  "funded",
  "in_progress",
  "in_inspection",
  "completed",
  "disputed",
  "cancelled",
  "requires_review",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "delivered",
  "accepted",
  "released",
  "disputed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
  "reversed",
]);

export const disbursementStatusEnum = pgEnum("disbursement_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
  "reversed",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "pending",
  "verified",
  "rejected",
  "requires_review",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "mediation",
  "evidence_required",
  "resolved",
  "closed",
]);

export const partyStatusEnum = pgEnum("party_status", [
  "invited",
  "signed",
  "declined",
  "removed",
]);

export const ledgerAccountTypeEnum = pgEnum("ledger_account_type", [
  "user",
  "escrow",
  "platform_fee",
  "provider_clearing",
  "seller_payable",
  "refund_payable",
]);

export const ledgerEntryStatusEnum = pgEnum("ledger_entry_status", [
  "posted",
  "reversed",
]);

export const ledgerPostingDirectionEnum = pgEnum("ledger_posting_direction", [
  "debit",
  "credit",
]);

export const notificationDeliveryStatusEnum = pgEnum("notification_delivery_status", [
  "pending",
  "sent",
  "failed",
]);

// ─── USERS ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  fullName: text("full_name").notNull(),
  kycTier: integer("kyc_tier").default(0),
  kycStatus: kycStatusEnum("kyc_status").default("pending"),
  role: text("role").default("individual"),
  preferredCurrency: text("preferred_currency").default("KES"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ─── ROLES ───────────────────────────────────────────────────────────────────

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isSystem: boolean("is_system").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;

// ─── USER ROLES (junction) ───────────────────────────────────────────────────

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  roleId: uuid("role_id")
    .references(() => roles.id)
    .notNull(),
  assignedById: uuid("assigned_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type UserRole = InferSelectModel<typeof userRoles>;
export type NewUserRole = InferInsertModel<typeof userRoles>;

// ─── BUSINESSES ─────────────────────────────────────────────────────────────

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id),
  legalName: text("legal_name").notNull(),
  registrationNumber: text("registration_number"),
  kraPin: text("kra_pin"),
  country: text("country").notNull().default("KE"),
  kycStatus: kycStatusEnum("kyc_status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Business = InferSelectModel<typeof businesses>;
export type NewBusiness = InferInsertModel<typeof businesses>;

// ─── TRANSACTIONS ───────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").unique().notNull(),
  title: text("title").notNull(),
  assetClass: text("asset_class").notNull(),
  assetSubclass: text("asset_subclass"),
  status: transactionStatusEnum("status").notNull().default("draft"),
  currency: text("currency").notNull().default("KES"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  feeAmount: numeric("fee_amount", { precision: 18, scale: 2 }),
  feePercentage: numeric("fee_percentage", { precision: 5, scale: 4 }),
  fxRateAtCreation: numeric("fx_rate_at_creation", { precision: 18, scale: 6 }),
  fxBaseCurrency: text("fx_base_currency").default("KES"),
  description: text("description"),
  terms: text("terms"),
  inspectionPeriodDays: integer("inspection_period_days").default(5),
  milestoneCount: integer("milestone_count").default(1),
  hasDataRoom: boolean("has_data_room").default(false),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

// ─── TRANSACTION PARTIES ────────────────────────────────────────────────────

export const transactionParties = pgTable("transaction_parties", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  userId: uuid("user_id").references(() => users.id),
  role: text("role").notNull(),
  inviteName: text("invite_name"),
  inviteEmail: text("invite_email"),
  invitePhone: text("invite_phone"),
  status: partyStatusEnum("status").default("invited"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type TransactionParty = InferSelectModel<typeof transactionParties>;
export type NewTransactionParty = InferInsertModel<typeof transactionParties>;

// ─── MILESTONES ─────────────────────────────────────────────────────────────

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  status: milestoneStatusEnum("status").default("pending"),
  dueDate: date("due_date"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  inspectionStartedAt: timestamp("inspection_started_at", { withTimezone: true }),
  inspectionExpiresAt: timestamp("inspection_expires_at", { withTimezone: true }),
  autoReleaseEligibleAt: timestamp("auto_release_eligible_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Milestone = InferSelectModel<typeof milestones>;
export type NewMilestone = InferInsertModel<typeof milestones>;

// ─── PAYMENTS ───────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  milestoneId: uuid("milestone_id").references(() => milestones.id),
  payerId: uuid("payer_id").references(() => users.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  method: text("method").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  providerReference: text("provider_reference"),
  mpesaPhone: text("mpesa_phone"),
  checkoutRequestId: text("checkout_request_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

// ─── DISBURSEMENTS ──────────────────────────────────────────────────────────

export const disbursements = pgTable("disbursements", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  milestoneId: uuid("milestone_id").references(() => milestones.id),
  recipientId: uuid("recipient_id").references(() => users.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  method: text("method").notNull(),
  status: disbursementStatusEnum("status").default("pending"),
  providerReference: text("provider_reference"),
  mpesaPhone: text("mpesa_phone"),
  bankAccount: jsonb("bank_account"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Disbursement = InferSelectModel<typeof disbursements>;
export type NewDisbursement = InferInsertModel<typeof disbursements>;

// ─── KYC SUBMISSIONS ────────────────────────────────────────────────────────

export const kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  tier: integer("tier").notNull(),
  smileJobId: text("smile_job_id"),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  documentNumberCiphertext: text("document_number_ciphertext"),
  documentNumberIv: text("document_number_iv"),
  documentNumberAuthTag: text("document_number_auth_tag"),
  documentNumberKeyVersion: text("document_number_key_version"),
  documentNumberBlindIndex: text("document_number_blind_index"),
  country: text("country"),
  status: kycStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export type KycSubmission = InferSelectModel<typeof kycSubmissions>;
export type NewKycSubmission = InferInsertModel<typeof kycSubmissions>;

// ─── DISPUTES ───────────────────────────────────────────────────────────────

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").unique().notNull(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  milestoneId: uuid("milestone_id").references(() => milestones.id),
  openedBy: uuid("opened_by").references(() => users.id),
  status: disputeStatusEnum("status").default("open"),
  resolutionTier: integer("resolution_tier").default(1),
  assignedMediatorId: uuid("assigned_mediator_id").references(() => users.id),
  resolution: text("resolution"),
  resolutionSplitPercentage: numeric("resolution_split_percentage", { precision: 5, scale: 2 }),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export type Dispute = InferSelectModel<typeof disputes>;
export type NewDispute = InferInsertModel<typeof disputes>;

// ─── DISPUTE MESSAGES ───────────────────────────────────────────────────────

export const disputeMessages = pgTable("dispute_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").references(() => disputes.id),
  senderId: uuid("sender_id").references(() => users.id),
  senderRole: text("sender_role"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type DisputeMessage = InferSelectModel<typeof disputeMessages>;
export type NewDisputeMessage = InferInsertModel<typeof disputeMessages>;

// ─── DISPUTE EVIDENCE ───────────────────────────────────────────────────────

export const disputeEvidence = pgTable("dispute_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").references(() => disputes.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type DisputeEvidence = InferSelectModel<typeof disputeEvidence>;
export type NewDisputeEvidence = InferInsertModel<typeof disputeEvidence>;

// ─── TRANSACTION MESSAGES ───────────────────────────────────────────────────

export const transactionMessages = pgTable("transaction_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  senderId: uuid("sender_id").references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type TransactionMessage = InferSelectModel<typeof transactionMessages>;
export type NewTransactionMessage = InferInsertModel<typeof transactionMessages>;

// ─── DATA ROOMS ─────────────────────────────────────────────────────────────

export const dataRooms = pgTable("data_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .unique(),
  ndaTemplateId: text("nda_template_id"),
  status: text("status").default("locked"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type DataRoom = InferSelectModel<typeof dataRooms>;
export type NewDataRoom = InferInsertModel<typeof dataRooms>;

// ─── DATA ROOM FILES ────────────────────────────────────────────────────────

export const dataRoomFiles = pgTable("data_room_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataRoomId: uuid("data_room_id").references(() => dataRooms.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileHash: text("file_hash").notNull(),
  fileSize: integer("file_size"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  accessedAt: timestamp("accessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type DataRoomFile = InferSelectModel<typeof dataRoomFiles>;
export type NewDataRoomFile = InferInsertModel<typeof dataRoomFiles>;

// ─── DATA ROOM NDAs ─────────────────────────────────────────────────────────

export const dataRoomNdas = pgTable("data_room_ndas", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataRoomId: uuid("data_room_id").references(() => dataRooms.id),
  userId: uuid("user_id").references(() => users.id),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  signatureData: text("signature_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export type DataRoomNda = InferSelectModel<typeof dataRoomNdas>;
export type NewDataRoomNda = InferInsertModel<typeof dataRoomNdas>;

// ─── AUDIT LOG (append-only) ────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  actorId: uuid("actor_id").references(() => users.id),
  actorRole: text("actor_role"),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type AuditLogEntry = InferSelectModel<typeof auditLog>;
export type NewAuditLogEntry = InferInsertModel<typeof auditLog>;

// ─── AGENTS ─────────────────────────────────────────────────────────────────

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  counties: text("counties").array(),
  countries: text("countries").array(),
  assetClasses: text("asset_classes").array(),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  lat: numeric("lat", { precision: 10, scale: 8 }),
  lng: numeric("lng", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Agent = InferSelectModel<typeof agents>;
export type NewAgent = InferInsertModel<typeof agents>;

// ─── AGENT ASSIGNMENTS ──────────────────────────────────────────────────────

export const agentAssignments = pgTable("agent_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  agentId: uuid("agent_id").references(() => agents.id),
  status: text("status").default("assigned"),
  inspectionNotes: text("inspection_notes"),
  inspectionPhotos: text("inspection_photos").array(),
  gpsLat: numeric("gps_lat", { precision: 10, scale: 8 }),
  gpsLng: numeric("gps_lng", { precision: 11, scale: 8 }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type AgentAssignment = InferSelectModel<typeof agentAssignments>;
export type NewAgentAssignment = InferInsertModel<typeof agentAssignments>;

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  channels: text("channels").array(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id").references(() => notifications.id),
    userId: uuid("user_id").references(() => users.id).notNull(),
    channel: text("channel").notNull(),
    recipient: text("recipient"),
    status: notificationDeliveryStatusEnum("status").notNull().default("pending"),
    providerReference: text("provider_reference"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("notification_deliveries_user_idx").on(table.userId),
    index("notification_deliveries_notification_idx").on(table.notificationId),
  ]
);

export type NotificationDelivery = InferSelectModel<typeof notificationDeliveries>;
export type NewNotificationDelivery = InferInsertModel<typeof notificationDeliveries>;

export const ledgerAccounts = pgTable(
  "ledger_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").references(() => users.id),
    transactionId: uuid("transaction_id").references(() => transactions.id),
    type: ledgerAccountTypeEnum("type").notNull(),
    currency: text("currency").notNull().default("KES"),
    name: text("name").notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("ledger_accounts_owner_idx").on(table.ownerId),
    index("ledger_accounts_transaction_idx").on(table.transactionId),
    index("ledger_accounts_type_currency_idx").on(table.type, table.currency),
  ]
);

export type LedgerAccount = InferSelectModel<typeof ledgerAccounts>;
export type NewLedgerAccount = InferInsertModel<typeof ledgerAccounts>;

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    status: ledgerEntryStatusEnum("status").notNull().default("posted"),
    description: text("description"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("ledger_entries_idempotency_key_idx").on(table.idempotencyKey),
    index("ledger_entries_source_idx").on(table.sourceType, table.sourceId),
  ]
);

export type LedgerEntry = InferSelectModel<typeof ledgerEntries>;
export type NewLedgerEntry = InferInsertModel<typeof ledgerEntries>;

export const ledgerPostings = pgTable(
  "ledger_postings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id").references(() => ledgerEntries.id).notNull(),
    accountId: uuid("account_id").references(() => ledgerAccounts.id).notNull(),
    direction: ledgerPostingDirectionEnum("direction").notNull(),
    amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
    currency: text("currency").notNull().default("KES"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("ledger_postings_entry_idx").on(table.entryId),
    index("ledger_postings_account_idx").on(table.accountId),
  ]
);

export type LedgerPosting = InferSelectModel<typeof ledgerPostings>;
export type NewLedgerPosting = InferInsertModel<typeof ledgerPostings>;

// ─── FX RATES ───────────────────────────────────────────────────────────────

export const fxRates = pgTable(
  "fx_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    baseCurrency: text("base_currency").notNull(),
    quoteCurrency: text("quote_currency").notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    source: text("source"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("fx_rates_pair_idx").on(table.baseCurrency, table.quoteCurrency)]
);

export type FxRate = InferSelectModel<typeof fxRates>;
export type NewFxRate = InferInsertModel<typeof fxRates>;
