"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import useSWR from "swr"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { STATION_COORDINATES } from "@/lib/station-coordinates"
import type { Station } from "@/lib/stations-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const MAP_WIDTH = 1600
const MAP_HEIGHT = 900
// Maximum distance (in the map's native 1600x900 pixel space) a tap can be
// from a station's marked point and still select that station. Using
// nearest-neighbor matching instead of overlapping hit-area buttons, since
// several characters on the source artwork sit closer together than any
// reasonably tappable hit area would allow.
const MAX_TAP_DISTANCE = 70

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function EklizaniaMap() {
  const { data } = useSWR<{ stations: Station[] }>("/api/stations", fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  })

  const [selectedId, setSelectedId] = useState<number | null>(null)

  const stationsById = useMemo(() => {
    const map = new Map<number, Station>()
    for (const station of data?.stations ?? []) {
      map.set(station.id, station)
    }
    return map
  }, [data])

  const selectedStation = selectedId ? stationsById.get(selectedId) : undefined

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedId(null)
  }, [])

  const imageContainerRef = useRef<HTMLDivElement>(null)
  // Records where a press started so we can tell a tap from a pan/drag. The
  // zoom/pan wrapper swallows synthetic "click" events whenever the pointer
  // moves even slightly, so we detect the tap ourselves on pointerup.
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const selectNearest = useCallback((clientX: number, clientY: number) => {
    const container = imageContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const xPct = ((clientX - rect.left) / rect.width) * 100
    const yPct = ((clientY - rect.top) / rect.height) * 100

    let nearestId: number | null = null
    let nearestDistance = Infinity

    for (const [idStr, coords] of Object.entries(STATION_COORDINATES)) {
      const dx = ((xPct - coords.x) / 100) * MAP_WIDTH
      const dy = ((yPct - coords.y) / 100) * MAP_HEIGHT
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestId = Number(idStr)
      }
    }

    if (nearestId !== null && nearestDistance <= MAX_TAP_DISTANCE) {
      setSelectedId(nearestId)
    }
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
  }, [])

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = pointerStart.current
      pointerStart.current = null
      if (!start) return
      // If the pointer moved more than a few pixels, treat it as a pan (not a tap).
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
      if (moved > 8) return
      selectNearest(event.clientX, event.clientY)
    },
    [selectNearest]
  )

  return (
    <div className="relative w-full select-none">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        doubleClick={{ mode: "zoomIn", step: 0.7 }}
        wheel={{ step: 0.3 }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: true }}
        limitToBounds={true}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%" }}
          contentStyle={{ width: "100%" }}
        >
          <div
            ref={imageContainerRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative w-full cursor-pointer"
            style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
          >
            <img
              src="/images/eklizania-map.jpg"
              alt="Eklizania event map"
              className="pointer-events-none block h-full w-full object-contain select-none"
              draggable={false}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>

      <Dialog open={selectedId !== null} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xs text-center" dir="rtl">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {selectedStation ? selectedStation.name : "تفاصيل المحطة"}
            </DialogTitle>
          </DialogHeader>
          {selectedStation && (
            <div className="flex flex-col items-center gap-4 pb-1">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-accent-foreground">
                {selectedStation.id}
              </span>
              <p className="text-balance font-heading text-2xl font-bold text-foreground">
                {selectedStation.name}
              </p>
              <span
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-semibold",
                  selectedStation.status === "Available"
                    ? "bg-available/15 text-available"
                    : "bg-occupied/15 text-occupied"
                )}
              >
                {selectedStation.status === "Available" ? "متاحة" : "مشغولة"}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
