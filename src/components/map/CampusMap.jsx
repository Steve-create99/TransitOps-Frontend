// ============================================================
// CampusMap.jsx — Reusable KNUST MapLibre map shell
// ============================================================

import { useCallback, useMemo } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyle, KNUST_CENTER } from "../../lib/mapConfig";

/**
 * @param {{
 *   children?: React.ReactNode,
 *   initialViewState?: object,
 *   className?: string,
 *   mapStyleKey?: string,
 *   onLoad?: (evt) => void,
 *   interactive?: boolean,
 * }} props
 */
export default function CampusMap({
  children,
  initialViewState,
  className = "",
  mapStyleKey = "dark",
  onLoad,
  interactive = true,
}) {
  const style = useMemo(() => getMapStyle(mapStyleKey), [mapStyleKey]);
  const view = useMemo(
    () => ({
      ...KNUST_CENTER,
      ...initialViewState,
    }),
    [initialViewState],
  );

  const handleError = useCallback((e) => {
    // Non-fatal tile warning (e.g. single 404 at max zoom or missing glyph)
    // Log silently without unmounting the active map canvas
    console.warn("[CampusMap] MapLibre tile notice:", e?.error?.message || e);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[280px] overflow-hidden ${className}`}>
      <div className="w-full h-full">
        <Map
          mapStyle={style}
          initialViewState={view}
          style={{ width: "100%", height: "100%" }}
          attributionControl
          interactive={interactive}
          onError={handleError}
          onLoad={onLoad}
        >
          {interactive ? (
            <NavigationControl position="top-right" showCompass={false} />
          ) : null}
          {children}
        </Map>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-slate-900/85 px-2 py-1 text-[10px] text-slate-400 border border-surface-border">
        © OpenStreetMap contributors · CARTO · Esri
      </div>
    </div>
  );
}


