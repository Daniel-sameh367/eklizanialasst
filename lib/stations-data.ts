import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { stations as stationsTable } from "@/lib/db/schema"

export type StationStatus = "Available" | "Occupied"

export interface Station {
  id: number
  name: string
  status: StationStatus
  updatedAt: string
}

function toStation(row: typeof stationsTable.$inferSelect): Station {
  return {
    id: row.id,
    name: row.name,
    status: row.status === "Occupied" ? "Occupied" : "Available",
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getAllStations(): Promise<Station[]> {
  const rows = await db.select().from(stationsTable).orderBy(stationsTable.id)
  return rows.map(toStation)
}

export async function getStation(id: number): Promise<Station | undefined> {
  const [row] = await db.select().from(stationsTable).where(eq(stationsTable.id, id)).limit(1)
  return row ? toStation(row) : undefined
}

export async function setStationStatus(
  id: number,
  status: StationStatus
): Promise<Station | undefined> {
  const [row] = await db
    .update(stationsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(stationsTable.id, id))
    .returning()
  return row ? toStation(row) : undefined
}
