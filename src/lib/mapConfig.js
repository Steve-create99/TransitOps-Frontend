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

/**
 * Free, resilient map styles requiring NO API key or billing:
 * 1. CARTO Dark Matter (Default) — dark theme matching TransitOps UI
 * 2. OpenFreeMap Dark — vector tile style
 * 3. CARTO Voyager — light basemap for bright environments
 * 4. Esri Satellite — satellite aerial imagery
 */
export const MAP_STYLES = {
  dark: {
    id: "dark",
    name: "Dark Transit (CARTO)",
    style: {
      version: 8,
      sources: {
        carto_dark: {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [{ id: "carto-dark-layer", type: "raster", source: "carto_dark", minzoom: 0, maxzoom: 20 }],
    },
  },
  openfreemap: {
    id: "openfreemap",
    name: "OpenFreeMap Vector",
    style: "https://tiles.openfreemap.org/styles/dark",
  },
  light: {
    id: "light",
    name: "Light Voyager (CARTO)",
    style: {
      version: 8,
      sources: {
        carto_voyager: {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [{ id: "carto-voyager-layer", type: "raster", source: "carto_voyager", minzoom: 0, maxzoom: 20 }],
    },
  },
  satellite: {
    id: "satellite",
    name: "Satellite (Esri)",
    style: {
      version: 8,
      sources: {
        esri_satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      },
      layers: [{ id: "esri-satellite-layer", type: "raster", source: "esri_satellite", minzoom: 0, maxzoom: 19 }],
    },
  },
};

const orsApiKey = (import.meta.env.VITE_ORS_API_KEY || "").trim();

/**
 * Returns the MapLibre style object or URL based on key.
 * Defaults to CARTO Dark Matter.
 */
export function getMapStyle(styleKey = "dark") {
  const item = MAP_STYLES[styleKey] || MAP_STYLES.dark;
  return item.style;
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

