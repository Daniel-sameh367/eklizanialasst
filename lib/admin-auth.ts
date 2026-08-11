import { randomUUID } from "crypto"

export const ADMIN_SESSION_COOKIE = "eklizania_admin_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

// In-memory session store (single administrator, no accounts system).
// Persisted on globalThis so it survives dev hot-module-reloads.
declare global {
  // eslint-disable-next-line no-var
  var __eklizaniaAdminSessions: Map<string, number> | undefined
}

function getSessions(): Map<string, number> {
  if (!globalThis.__eklizaniaAdminSessions) {
    globalThis.__eklizaniaAdminSessions = new Map()
  }
  return globalThis.__eklizaniaAdminSessions
}

function getAdminPassword(): string {
  // Falls back to the spec-provided default when ADMIN_PASSWORD is not set
  // as a Vercel environment variable.
  return process.env.ADMIN_PASSWORD || "eklizania123"
}

export function verifyAdminPassword(password: string): boolean {
  return typeof password === "string" && password.length > 0 && password === getAdminPassword()
}

export function createAdminSession(): { token: string; maxAge: number } {
  const token = randomUUID()
  const sessions = getSessions()
  sessions.set(token, Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  return { token, maxAge: SESSION_MAX_AGE_SECONDS }
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token) return false
  const sessions = getSessions()
  const expiresAt = sessions.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    sessions.delete(token)
    return false
  }
  return true
}

export function destroyAdminSession(token: string | undefined | null): void {
  if (!token) return
  getSessions().delete(token)
}
