// ============================================================
// CampusMap.jsx — Reusable KNUST MapLibre map shell
// ============================================================

import { useCallback, useMemo, useState } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyle, KNUST_CENTER } from "../../lib/mapConfig";
import { MapIcon } from "@heroicons/react/24/outline";

/**
 * @param {{
 *   children?: React.ReactNode,
 *   initialViewState?: object,
 *   className?: string,
 *   onLoad?: (evt) => void,
 *   interactive?: boolean,
 * }} props
 */
export default function CampusMap({
  children,
  initialViewState,
  className = "",
  onLoad,
  interactive = true,
}) {
  const [failed, setFailed] = useState(false);
  const style = useMemo(() => getMapStyle(), []);
  const view = useMemo(
    () => ({
      ...KNUST_CENTER,
      ...initialViewState,
    }),
    [initialViewState],
  );

  const handleError = useCallback((e) => {
    console.error("[CampusMap] tile load error", e?.error || e);
    setFailed(true);
  }, []);

  const handleLoad = useCallback((evt) => {
    setFailed(false);
    onLoad?.(evt);
  }, [onLoad]);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-surface text-slate-300 ${className}`}
        role="status"
      >
        <MapIcon className="w-10 h-10 text-slate-500" aria-hidden />
        <p className="text-sm font-semibold text-slate-200">Map unavailable</p>
        <p className="text-xs text-slate-500 text-center max-w-xs px-4">
          Could not load map tiles. Check your network connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[280px] overflow-hidden ${className}`}>
      <div className="w-full h-full dark-map-tiles">
        <Map
          mapStyle={style}
          initialViewState={view}
          style={{ width: "100%", height: "100%" }}
          attributionControl
          interactive={interactive}
          onError={handleError}
          onLoad={handleLoad}
        >
          {interactive ? (
            <NavigationControl position="top-right" showCompass={false} />
          ) : null}
          {children}
        </Map>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-slate-900/85 px-2 py-1 text-[10px] text-slate-400 border border-surface-border uninvert-overlay">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
