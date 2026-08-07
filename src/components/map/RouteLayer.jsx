// ============================================================
// RouteLayer.jsx — MapLibre GeoJSON line overlay(s)
// ============================================================

import { Source, Layer } from 'react-map-gl/maplibre';

/**
 * @param {{
 *   id: string,
 *   data: GeoJSON.FeatureCollection | GeoJSON.Feature | null,
 *   color?: string,
 *   width?: number,
 *   opacity?: number,
 * }} props
 */
export default function RouteLayer({
  id,
  data,
  color = '#1D9E75',
  width = 4.5,
  opacity = 0.9,
}) {
  if (!data) return null;

  const sourceId = `route-src-${id}`;
  const layerId = `route-line-${id}`;

  return (
    <Source id={sourceId} type="geojson" data={data}>
      <Layer
        id={`${layerId}-casing`}
        type="line"
        paint={{
          'line-color': '#0A1628',
          'line-width': width + 2,
          'line-opacity': opacity * 0.55,
          'line-join': 'round',
          'line-cap': 'round',
        }}
      />
      <Layer
        id={layerId}
        type="line"
        paint={{
          'line-color': color,
          'line-width': width,
          'line-opacity': opacity,
          'line-join': 'round',
          'line-cap': 'round',
        }}
      />
    </Source>
  );
}
