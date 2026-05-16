import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_VERSION = "v1";

function encryptionKey() {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PII_ENCRYPTION_KEY is required in production");
    }
    return createHash("sha256").update("development-only-pii-key").digest();
  }

  const decoded = Buffer.from(raw, "base64");
  if (decoded.length === 32) return decoded;
  if (raw.length === 64) return Buffer.from(raw, "hex");
  throw new Error("PII_ENCRYPTION_KEY must be a 32-byte base64 key or 64-char hex key");
}

function blindIndexKey() {
  return process.env.PII_BLIND_INDEX_KEY || process.env.PII_ENCRYPTION_KEY || "development-only-blind-index-key";
}

export interface EncryptedPii {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
  blindIndex: string;
}

export function encryptDocumentNumber(documentNumber: string): EncryptedPii {
  const normalized = documentNumber.trim().toUpperCase();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyVersion: KEY_VERSION,
    blindIndex: documentNumberBlindIndex(normalized),
  };
}

export function decryptDocumentNumber(input: Pick<EncryptedPii, "ciphertext" | "iv" | "authTag">): string {
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function documentNumberBlindIndex(documentNumber: string): string {
  return createHmac("sha256", blindIndexKey())
    .update(documentNumber.trim().toUpperCase())
    .digest("hex");
}
