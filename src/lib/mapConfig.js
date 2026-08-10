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

/** OpenFreeMap Vector Basemaps (100% Free, Open Source, No API Key Required) */
export const OPEN_FREE_MAP_POSITRON = "https://tiles.openfreemap.org/styles/positron";
export const OPEN_FREE_MAP_LIBERTY = "https://tiles.openfreemap.org/styles/liberty";
export const OPEN_FREE_MAP_BRIGHT = "https://tiles.openfreemap.org/styles/bright";

/** OpenStreetMap Standard Raster Tiles (Fallback) */
export const OPEN_STREET_MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
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

const maptilerKey = (
  import.meta.env.VITE_MAPTILER_KEY ||
  import.meta.env.VITE_MAPTILER_API_KEY ||
  ""
).trim();
const orsApiKey = (import.meta.env.VITE_ORS_API_KEY || "").trim();

/**
 * MapLibre style URL or object for OpenFreeMap (or MapTiler if key provided).
 */
export function getMapStyle(preferredProvider) {
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;
  }

  const provider =
    preferredProvider || import.meta.env.VITE_MAP_PROVIDER || "openfreemap";

  switch (provider.toLowerCase()) {
    case "osm":
    case "openstreetmap":
      return OPEN_STREET_MAP_STYLE;
    case "liberty":
    case "openfreemap-liberty":
      return OPEN_FREE_MAP_LIBERTY;
    case "bright":
    case "openfreemap-bright":
      return OPEN_FREE_MAP_BRIGHT;
    case "positron":
    case "openfreemap":
    case "openfreemap-positron":
    default:
      return OPEN_FREE_MAP_POSITRON;
  }
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
