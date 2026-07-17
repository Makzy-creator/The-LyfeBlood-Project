import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

const DEFAULT_OTP_TTL_MINUTES = 15;

function getOtpSecret() {
  const secret = process.env.OTP_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET or AUTH_SECRET is required for OTP hashing");
  }
  return secret;
}

export function getOtpTtlMinutes() {
  const value = Number.parseInt(process.env.OTP_TTL_MINUTES ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_OTP_TTL_MINUTES;
}

export function getOtpTtlSeconds() {
  return getOtpTtlMinutes() * 60;
}

export function generateOtp() {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(otp) {
  const salt = randomBytes(16).toString("hex");
  const digest = createHmac("sha256", getOtpSecret())
    .update(`${salt}:${otp}`)
    .digest("hex");

  return `hmac-sha256$${salt}$${digest}`;
}

export function verifyOtpHash(otp, storedHash) {
  const [scheme, salt, expected] = String(storedHash ?? "").split("$");
  if (scheme !== "hmac-sha256" || !salt || !expected) return false;

  const actual = createHmac("sha256", getOtpSecret())
    .update(`${salt}:${otp}`)
    .digest("hex");
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
