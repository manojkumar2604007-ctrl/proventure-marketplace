import { describe, it, expect } from "./test-utils";
import { hashPassword, verifyPassword, generateSecureToken, generateNumericOTP } from "@/lib/auth/password";
import { sanitizeRegistrationRole } from "@/lib/auth/server-guard";

describe("1. Authentication & Credential Security Tests", () => {
  it("should securely hash passwords and verify bcrypt matches", async () => {
    const plaintext = "ProVentureSec#2026";
    const hashed = await hashPassword(plaintext);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(plaintext);
    expect(hashed.startsWith("$2a$") || hashed.startsWith("$2b$")).toBe(true);

    const isMatch = await verifyPassword(plaintext, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("should reject verification when password or hash is null/empty", async () => {
    expect(await verifyPassword("", "some_hash")).toBe(false);
    expect(await verifyPassword("password", null)).toBe(false);
    expect(await verifyPassword("password", undefined)).toBe(false);
  });

  it("should generate cryptographically random 64-hex tokens", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]{64}$/.test(token1)).toBe(true);
  });

  it("should generate 6-digit numeric OTPs", () => {
    const otp = generateNumericOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
    const num = parseInt(otp, 10);
    expect(num).toBeGreaterThanOrEqual(100000);
    expect(num).toBeLessThanOrEqual(999999);
  });

  it("should prevent privilege escalation during public registration", () => {
    expect(sanitizeRegistrationRole("ADMIN")).toBe("CUSTOMER");
    expect(sanitizeRegistrationRole("admin")).toBe("CUSTOMER");
    expect(sanitizeRegistrationRole("SUPERADMIN")).toBe("CUSTOMER");
    expect(sanitizeRegistrationRole("SELLER")).toBe("SELLER");
    expect(sanitizeRegistrationRole("CUSTOMER")).toBe("CUSTOMER");
    expect(sanitizeRegistrationRole(undefined)).toBe("CUSTOMER");
  });
});
