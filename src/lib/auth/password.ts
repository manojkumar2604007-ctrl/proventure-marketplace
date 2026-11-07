import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hashedPassword?: string | null
): Promise<boolean> {
  if (!password || !hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a cryptographically secure random token (64 hex characters).
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a 6-digit numeric OTP code.
 */
export function generateNumericOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}
