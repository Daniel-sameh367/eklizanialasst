import { NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, destroyAdminSession, getSessionCookieOptions } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  destroyAdminSession(token)

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getSessionCookieOptions(0))
  return response
}
