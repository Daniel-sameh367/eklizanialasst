"use client"

import useSWR from "swr"
import { useState } from "react"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import type { Station, StationStatus } from "@/lib/stations-data"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdminDashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const { data, mutate } = useSWR<{ stations: Station[] }>("/api/stations", fetcher, {
    refreshInterval: 5000,
  })
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const stations = data?.stations ?? []

  async function toggleStation(station: Station) {
    const nextStatus: StationStatus = station.status === "Available" ? "Occupied" : "Available"
    setPendingId(station.id)

    // Optimistic update.
    mutate(
      (current) => ({
        stations: (current?.stations ?? []).map((s) =>
          s.id === station.id ? { ...s, status: nextStatus } : s
        ),
      }),
      { revalidate: false }
    )

    try {
      const res = await fetch(`/api/admin/stations/${station.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        mutate()
      }
    } catch {
      mutate()
    } finally {
      setPendingId(null)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      onLoggedOut()
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-base font-semibold text-foreground">Eklizania Admin</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? <Spinner data-icon="inline-start" /> : <LogOutIcon data-icon="inline-start" />}
          Logout
        </Button>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-3 px-4 py-4">
        {stations.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading stations…</p>
        )}
        {stations.map((station) => (
          <div
            key={station.id}
            className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {station.id}
              </span>
              <div className="flex min-w-0 flex-col">
                <span dir="rtl" className="truncate text-base font-medium text-foreground">
                  {station.name}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    station.status === "Available" ? "text-available" : "text-occupied"
                  )}
                >
                  {station.status}
                </span>
              </div>
            </div>
            <Switch
              checked={station.status === "Occupied"}
              onCheckedChange={() => toggleStation(station)}
              disabled={pendingId === station.id}
              aria-label={`Toggle station ${station.id} status`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
