// Click/tap target center points for each of the 23 characters on the
// official map image, expressed as percentages of the image's width and
// height (image is 1600x900). These were measured directly from the
// provided map image and must line up with the existing character
// artwork without redrawing or modifying the image itself.
export const STATION_COORDINATES: Record<number, { x: number; y: number }> = {
  1: { x: 49.6, y: 63.1 },
  2: { x: 46.8, y: 63.1 },
  3: { x: 42.6, y: 62.6 },
  4: { x: 46.6, y: 56.2 },
  5: { x: 43.1, y: 55.0 },
  6: { x: 41.9, y: 68.2 },
  7: { x: 46.0, y: 72.6 },
  8: { x: 42.6, y: 44.4 },
  9: { x: 50.8, y: 50.0 },
  10: { x: 56.3, y: 39.6 },
  11: { x: 61.3, y: 40.4 },
  12: { x: 59.2, y: 34.3 },
  13: { x: 51.9, y: 42.2 },
  14: { x: 49.0, y: 45.1 },
  15: { x: 45.9, y: 37.9 },
  16: { x: 42.1, y: 29.9 },
  17: { x: 46.8, y: 24.9 },
  18: { x: 31.6, y: 28.1 },
  19: { x: 28.9, y: 32.8 },
  20: { x: 25.5, y: 33.3 },
  21: { x: 22.0, y: 33.3 },
  22: { x: 18.6, y: 28.7 },
  23: { x: 14.9, y: 25.9 },
}
