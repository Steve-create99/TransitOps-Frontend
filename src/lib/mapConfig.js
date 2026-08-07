// ============================================================
// mapConfig.js — KNUST campus map defaults & tile styles
// ============================================================

/** KNUST Main Campus, Kumasi, Ghana */
export const KNUST_CENTER = {
  latitude: 6.6745,
  longitude: -1.5716,
  zoom: 15.2,
};

export const KNUST_BOUNDS = [
  [-1.585, 6.665], // SW [lng, lat]
  [-1.555, 6.685], // NE
];

const mapTilerKey = (import.meta.env.VITE_MAPTILER_KEY || '').trim();

/**
 * MapLibre style URL or inline style.
 * Prefers MapTiler when keyed; falls back to OpenFreeMap (no card / no key).
 */
export function getMapStyle() {
  if (mapTilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
  }
  // OpenFreeMap — OSM-based, free, no API key
  return 'https://tiles.openfreemap.org/styles/liberty';
}

export function isMapTilerConfigured() {
  return Boolean(mapTilerKey);
}

export function isOrsConfigured() {
  return Boolean((import.meta.env.VITE_ORS_API_KEY || '').trim());
}

/** Palette for simultaneous route overlays */
export const ROUTE_PALETTE = [
  '#1D9E75',
  '#3B82F6',
  '#EF9F27',
  '#A78BFA',
  '#D85A30',
  '#22D3EE',
  '#F472B6',
  '#84CC16',
];
