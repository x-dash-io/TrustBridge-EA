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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ─── USERS ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  fullName: text("full_name").notNull(),
  kycTier: integer("kyc_tier").default(0),
  kycStatus: text("kyc_status").default("pending"),
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
  kycStatus: text("kyc_status").default("pending"),
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
  status: text("status").notNull().default("draft"),
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
  status: text("status").default("invited"),
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
  status: text("status").default("pending"),
  dueDate: date("due_date"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  releasedAt: timestamp("released_at", { withTimezone: true }),
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
  status: text("status").default("pending"),
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
  status: text("status").default("pending"),
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
  country: text("country"),
  status: text("status").default("pending"),
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
  status: text("status").default("open"),
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
