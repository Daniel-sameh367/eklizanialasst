import { NextResponse } from "next/server"
import { getAllStations } from "@/lib/stations-data"

// Public, read-only endpoint. Both the visitor map and the admin
// dashboard read from this same source of truth.
export async function GET() {
  try {
    const stations = await getAllStations()
    return NextResponse.json({ stations })
  } catch {
    return NextResponse.json({ error: "Unable to load stations" }, { status: 500 })
  }
}
