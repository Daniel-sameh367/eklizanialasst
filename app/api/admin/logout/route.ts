import { NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, destroyAdminSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  destroyAdminSession(token)

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
