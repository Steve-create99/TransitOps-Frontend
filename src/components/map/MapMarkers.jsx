// ============================================================
// MapMarkers.jsx — Stop & vehicle MapLibre markers (vector icons)
// ============================================================

import { Marker, Popup } from 'react-map-gl/maplibre';
import { useState } from 'react';
import { MapPinIcon, TruckIcon } from '@heroicons/react/24/solid';

export function StopMarker({ stop, color = '#1D9E75', opacity = 1, showLabel = true }) {
  const [open, setOpen] = useState(false);
  if (stop?.lat == null || stop?.lng == null) return null;

  const lng = Number(stop.lng);
  const lat = Number(stop.lat);

  return (
    <>
      <Marker
        longitude={lng}
        latitude={lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setOpen(true);
        }}
      >
        <button
          type="button"
          className="flex flex-col items-center focus:outline-none"
          style={{ opacity }}
          title={stop.name}
          aria-label={stop.name}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: color }}
          >
            <MapPinIcon className="h-4 w-4 text-white" aria-hidden />
          </span>
          {showLabel ? (
            <span className="mt-0.5 max-w-[96px] truncate rounded bg-slate-900/85 px-1 text-[9px] font-semibold text-slate-100">
              {stop.name}
            </span>
          ) : null}
        </button>
      </Marker>
      {open ? (
        <Popup
          longitude={lng}
          latitude={lat}
          anchor="top"
          onClose={() => setOpen(false)}
          closeOnClick={false}
          offset={12}
        >
          <div className="min-w-[140px] text-slate-800 text-xs">
            <p className="font-bold text-sm mb-1">{stop.name}</p>
            <p className="text-slate-600">
              Riders/day: <strong>{stop.riders ?? '—'}</strong>
            </p>
            <p className="text-slate-600">
              Status:{' '}
              <strong className={stop.active ? 'text-emerald-600' : 'text-red-600'}>
                {stop.active ? 'Active' : 'Inactive'}
              </strong>
            </p>
          </div>
        </Popup>
      ) : null}
    </>
  );
}

export function VehicleMarker({ vehicle }) {
  const [open, setOpen] = useState(false);
  const lat = vehicle?.latitude ?? vehicle?.lat;
  const lng = vehicle?.longitude ?? vehicle?.lng;
  if (lat == null || lng == null) return null;

  const longitude = Number(lng);
  const latitude = Number(lat);

  return (
    <>
      <Marker
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setOpen(true);
        }}
      >
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-white bg-status-delayed shadow-md"
          title={vehicle.registrationNumber || 'Shuttle'}
          aria-label={vehicle.registrationNumber || 'Shuttle'}
        >
          <TruckIcon className="h-4 w-4 text-secondary" aria-hidden />
        </button>
      </Marker>
      {open ? (
        <Popup
          longitude={longitude}
          latitude={latitude}
          anchor="top"
          onClose={() => setOpen(false)}
          closeOnClick={false}
          offset={10}
        >
          <div className="min-w-[140px] text-slate-800 text-xs">
            <p className="font-bold text-sm mb-1">{vehicle.registrationNumber || 'Bus'}</p>
            <p className="text-slate-600">
              {vehicle.status || '—'} · Fuel {vehicle.fuelLevel ?? '—'}% · GPS {vehicle.gpsStatus || '—'}
            </p>
          </div>
        </Popup>
      ) : null}
    </>
  );
}
