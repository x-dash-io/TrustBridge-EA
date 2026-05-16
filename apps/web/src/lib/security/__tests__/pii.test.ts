import { describe, expect, it } from "vitest";
import { decryptDocumentNumber, documentNumberBlindIndex, encryptDocumentNumber } from "@/lib/security/pii";

describe("PII encryption", () => {
  it("encrypts document numbers and can decrypt them", () => {
    const encrypted = encryptDocumentNumber("12345678");
    expect(encrypted.ciphertext).not.toBe("12345678");
    expect(decryptDocumentNumber(encrypted)).toBe("12345678");
  });

  it("creates stable blind indexes for normalized values", () => {
    expect(documentNumberBlindIndex("abc123")).toBe(documentNumberBlindIndex(" ABC123 "));
  });
});
