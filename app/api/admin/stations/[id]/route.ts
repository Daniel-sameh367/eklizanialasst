import { NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth"
import { setStationStatus } from "@/lib/stations-data"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!isValidAdminSession(token)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const stationId = Number(id)
    if (!Number.isInteger(stationId) || stationId < 1 || stationId > 23) {
      return NextResponse.json({ error: "Invalid station id" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const status = body?.status

    if (status !== "Available" && status !== "Occupied") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updated = await setStationStatus(stationId, status)
    if (!updated) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 })
    }

    return NextResponse.json({ station: updated })
  } catch {
    return NextResponse.json({ error: "Unable to update station" }, { status: 500 })
  }
}
