import { NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const password = typeof body?.password === "string" ? body.password : ""

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    const { token, maxAge } = createAdminSession()
    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    })
    return response
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
