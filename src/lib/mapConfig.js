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

/** CARTO Dark Matter Raster Tiles (Native Dark Theme, 100% Free, No Key Required) */
export const CARTO_DARK_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-raster",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/** CARTO Voyager Raster Tiles (100% Free, No Key Required) */
export const CARTO_VOYAGER_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "carto-voyager-raster",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

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
 * MapLibre style URL or object for free basemaps (or MapTiler if key provided).
 */
export function getMapStyle(preferredProvider) {
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;
  }

  const provider =
    preferredProvider || import.meta.env.VITE_MAP_PROVIDER || "carto-dark";

  switch (provider.toLowerCase()) {
    case "osm":
    case "openstreetmap":
      return OPEN_STREET_MAP_STYLE;
    case "carto-voyager":
    case "voyager":
      return CARTO_VOYAGER_STYLE;
    case "openfreemap":
    case "openfreemap-positron":
    case "positron":
      return OPEN_FREE_MAP_POSITRON;
    case "liberty":
    case "openfreemap-liberty":
      return OPEN_FREE_MAP_LIBERTY;
    case "bright":
    case "openfreemap-bright":
      return OPEN_FREE_MAP_BRIGHT;
    case "carto":
    case "carto-dark":
    default:
      return CARTO_DARK_STYLE;
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
