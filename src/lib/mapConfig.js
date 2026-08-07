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

const FREE_TILE_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-raster",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const orsApiKey = (import.meta.env.VITE_ORS_API_KEY || "").trim();

/**
 * MapLibre style object for a free, no-key basemap.
 */
export function getMapStyle() {
  return FREE_TILE_STYLE;
}

export function isOrsConfigured() {
  return Boolean(orsApiKey);
}

export function getOrsApiKey() {
  return orsApiKey;
}

/** Palette for simultaneous route overlays */
export const ROUTE_PALETTE = [
  "#1D9E75",
  "#3B82F6",
  "#EF9F27",
  "#A78BFA",
  "#D85A30",
  "#22D3EE",
  "#F472B6",
  "#84CC16",
];
