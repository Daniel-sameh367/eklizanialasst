import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE = "eklizania_admin_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

function getAdminPassword(): string {
  // Falls back to the spec-provided default when ADMIN_PASSWORD is not set
  // as a Vercel environment variable.
  return process.env.ADMIN_PASSWORD || "eklizania123"
}

// Secret used to sign session tokens. Prefer a dedicated secret, but fall back
// to the admin password so sessions stay valid without extra configuration.
function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `eklizania::${getAdminPassword()}`
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex")
}

export function verifyAdminPassword(password: string): boolean {
  return typeof password === "string" && password.length > 0 && password === getAdminPassword()
}

// Stateless signed token: "<expiryMs>.<hmac>". No server-side storage, so it
// survives dev hot-reloads and works across serverless instances in production.
export function createAdminSession(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = String(expiresAt)
  const token = `${payload}.${sign(payload)}`
  return { token, maxAge: SESSION_MAX_AGE_SECONDS }
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token) return false
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return false

  const expected = sign(payload)
  const expectedBuf = Buffer.from(expected, "hex")
  const actualBuf = Buffer.from(signature, "hex")
  if (expectedBuf.length !== actualBuf.length) return false
  if (!timingSafeEqual(expectedBuf, actualBuf)) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  return true
}

// Stateless tokens can't be revoked server-side; the logout route clears the
// cookie. Kept for API compatibility.
export function destroyAdminSession(_token: string | undefined | null): void {
  // no-op
}
