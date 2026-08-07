// ============================================================
// routing.js — OpenRouteService directions + client cache
// ============================================================

// HeiGIT host (api.openrouteservice.org is deprecated)
const ORS_BASE = 'https://api.heigit.org/openrouteservice/v2/directions';
const cache = new Map();
const CACHE_LIMIT = 40;

function cacheKey(start, end, profile) {
  const fmt = ([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`;
  return `${profile}|${fmt(start)}|${fmt(end)}`;
}

function remember(key, value) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, value);
  return value;
}

/**
 * @param {[number, number]} startCoords [lng, lat]
 * @param {[number, number]} endCoords [lng, lat]
 * @param {'driving-car'|'foot-walking'|'cycling-regular'} [profile]
 * @returns {Promise<{ geojson: object, distanceM: number, durationS: number }>}
 */
export async function getRoute(startCoords, endCoords, profile = 'driving-car') {
  const apiKey = (import.meta.env.VITE_ORS_API_KEY || '').trim();
  if (!apiKey) {
    const err = new Error('Routing unavailable — set VITE_ORS_API_KEY');
    err.code = 'ORS_UNCONFIGURED';
    throw err;
  }

  if (
    !Array.isArray(startCoords) ||
    !Array.isArray(endCoords) ||
    startCoords.length < 2 ||
    endCoords.length < 2 ||
    startCoords.some((n) => !Number.isFinite(n)) ||
    endCoords.some((n) => !Number.isFinite(n))
  ) {
    const err = new Error('Invalid coordinates for routing');
    err.code = 'INVALID_COORDS';
    throw err;
  }

  const key = cacheKey(startCoords, endCoords, profile);
  if (cache.has(key)) return cache.get(key);

  const url = `${ORS_BASE}/${profile}/geojson`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json, application/geo+json',
      },
      body: JSON.stringify({
        coordinates: [startCoords, endCoords],
      }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach OpenRouteService');
    err.code = 'NETWORK';
    err.cause = networkErr;
    throw err;
  }

  if (response.status === 429) {
    console.warn('[TransitOps] ORS daily rate limit hit (429)');
    const err = new Error('Routing temporarily unavailable — daily request limit reached');
    err.code = 'RATE_LIMIT';
    throw err;
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.message || body?.message || '';
    } catch {
      /* ignore */
    }
    const err = new Error(detail || `Routing failed (${response.status})`);
    err.code = response.status === 404 ? 'NO_ROUTE' : 'ORS_ERROR';
    throw err;
  }

  const geojson = await response.json();
  const feature = geojson?.features?.[0];
  if (!feature?.geometry?.coordinates?.length) {
    const err = new Error('No route found between these campus points');
    err.code = 'NO_ROUTE';
    throw err;
  }

  const summary = feature.properties?.summary || {};
  return remember(key, {
    geojson,
    distanceM: summary.distance ?? 0,
    durationS: summary.duration ?? 0,
  });
}

/** Build a simple LineString FeatureCollection from ordered [lng,lat] points (no ORS). */
export function lineStringFromCoords(coords, properties = {}) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties,
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      },
    ],
  };
}

export function clearRouteCache() {
  cache.clear();
}
