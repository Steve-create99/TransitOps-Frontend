// ============================================================
// CampusMap.jsx — Reusable KNUST MapLibre map shell
// ============================================================

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyle, KNUST_CENTER } from "../../lib/mapConfig";
import { MapIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
  const [failed, setFailed] = useState(false);
  const errorTimeoutRef = useRef(null);
  const style = useMemo(() => getMapStyle(mapStyleKey), [mapStyleKey]);
  const view = useMemo(
    () => ({
      ...KNUST_CENTER,
      ...initialViewState,
    }),
    [initialViewState],
  );

  const handleError = useCallback((e) => {
    console.warn("[CampusMap] tile load warning/error", e?.error || e);
    // Only flag failed if error persists continuously for 4 seconds
    if (!errorTimeoutRef.current) {
      errorTimeoutRef.current = setTimeout(() => {
        setFailed(true);
        errorTimeoutRef.current = null;
      }, 4000);
    }
  }, []);

  const handleLoad = useCallback((evt) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setFailed(false);
    onLoad?.(evt);
  }, [onLoad]);

  useEffect(() => {
    setFailed(false);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, [mapStyleKey]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-[#08131F] text-slate-300 ${className}`}
        role="status"
      >
        <MapIcon className="w-10 h-10 text-slate-500" aria-hidden />
        <p className="text-sm font-semibold text-slate-200">Map tile load issue</p>
        <p className="text-xs text-slate-500 text-center max-w-xs px-4">
          Some map tiles could not be fetched. Check your internet connection or switch to an alternate map style.
        </p>
        <button
          type="button"
          className="btn-ghost py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
          onClick={() => setFailed(false)}
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Retry loading map
        </button>
      </div>
    );
  }

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
          onLoad={handleLoad}
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

