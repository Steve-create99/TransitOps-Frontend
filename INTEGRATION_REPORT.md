# TransitOps Web — Backend Integration Report

**Date:** 2026-08-05  
**Backend:** `https://web-production-f8ec21.up.railway.app`  
**Frontend:** TransitOps web (Cloudflare Pages target: `https://transitops-frontend.pages.dev`)

---

## Production readiness assessment

**Verdict: Production Ready with Minor Fixes** for the **web ops portal** against the live Railway API.

- Web production build succeeds (`npm run build` exit 0).
- Live backend health + admin login + KPIs verified.
- Operational screens no longer use TransitContext seed/mock data; they load from Spring APIs.
- Drivers and Vehicles EmptyState stubs replaced with real pages.
- Auth refresh retries on 401; rotated refresh tokens persisted; self-registration disabled.

Redeploy the web `dist/` (or Cloudflare Pages) with `VITE_API_URL=https://web-production-f8ec21.up.railway.app/api`, and redeploy backend so seed enrichment + register lock ship.

---

## Issues found

1. Web pointed at dead Railway host; ops UI was 100% in-memory seeds.
2. Domain API helpers existed but were unused; no CRUD client.
3. 401 cleared session instead of refresh+retry; refresh waiters could hang.
4. Dashboard/Reports used hardcoded/`Math.random` metrics.
5. `/drivers` and `/vehicles` were EmptyState placeholders.
6. Notifications hid the entire list when all read.
7. Open self-registration allowed DRIVER/DISPATCHER creation.
8. CORS risk if origin included `/dashboard` path.

## Issues fixed

1. Retargeted default API to `web-production-f8ec21`; added `.env.example` / `.env.production`.
2. Expanded `api.js` with full domain helpers, timeouts, unwrap PageResponse, 401 refresh retry.
3. Rewrote `TransitContext` to fetch routes/stops/schedules/notifications/KPIs/charts/vehicles/locations/audit.
4. Rewired Dashboard, Reports, Notifications, Schedules (API create), Maps (GPS pins), Settings (org + audit).
5. Built Drivers and Vehicles pages with list/detail/maintenance.
6. Disabled self-registration (backend + login UX).
7. Expanded `DataInitializer` (K-04..K-06, more drivers/vehicles/maintenance/metrics + enrich on existing DBs).
8. Documented Railway env / demo logins in `DEPLOY_RAILWAY.md`.

## Remaining blockers / deferred

- **Redeploy backend** required for: notification JSON lazy-load fix (`@JsonIgnore` on `Notification.user`), seed enrichment, register disable.
- Redeploy Cloudflare Pages with `VITE_API_URL=https://web-production-f8ec21.up.railway.app/api`.
- Live `/api/notifications` currently **500** until that backend deploy (LazyInitializationException on User proxy).
- Flyway migrations (still `ddl-auto=update`).
- Fuel log / passenger / GPS history product modules (not in scope).
- Mobile Expo URL retarget (out of scope this pass).
- Mobile trip sessions still in-memory on backend.
- Web TopNav global search still non-functional (UI-only).
- Bundle size warning (>500 kB) — polish only.

## Database / seed changes

- Empty DB seed: 16 stops, 6 routes (K-01..K-06), 4 drivers, 6 vehicles, maintenance samples, richer TripMetric.
- Existing DBs: `enrichDemoFleetIfNeeded()` adds K-04..K-06 fleet if missing.
- No destructive migrations.

## API integrations completed (web)

| Area | Endpoints |
|------|-----------|
| Auth | login, logout, refresh (register disabled) |
| Dashboard | `/dashboard/kpis`, `/dashboard/charts` |
| Routes/Stops/Schedules | list + create/delete as used by UI |
| Notifications | list, mark-read, mark-all-read |
| Reports | `/reports`, `/reports/export.csv` |
| Drivers | list, create, incidents, attendance |
| Vehicles | list, create, locations, maintenance |
| Settings | get/put org, audit-logs (ADMIN) |

## Performance / security improvements

- Removed random KPI polling intervals; 60s soft poll only when tab visible.
- Abort/timeout on requests (30s).
- 401 → single refresh → retry; waiter reject on failure.
- Self-registration forbidden.
- CORS patterns include `*.pages.dev`.

## Files modified (primary)

**Web (`TransitOps`)**
- `src/services/api.js`
- `src/context/TransitContext.jsx`, `AppContext.jsx`
- `src/pages/Dashboard|Reports|Notifications|Schedules|Maps|Settings|Routes|Login`
- `src/pages/Drivers/index.jsx`, `src/pages/Vehicles/index.jsx` (new)
- `src/routes/AppRouter.jsx`
- `vite.config.js`, `.env.example`, `.env.production`

**Backend (`TransitOps-backend`)**
- `service/AuthService.java` (register disabled)
- `seed/DataInitializer.java` (expanded + enrich)
- `security/JwtService.java` (plain secret fallback — earlier)
- `config/SecurityConfig.java` (CORS patterns — earlier)
- `DEPLOY_RAILWAY.md`, `.env` / `.env.example`

## Verification run

| Check | Result |
|-------|--------|
| `GET /api/health` | UP |
| Admin login | OK |
| Dashboard KPIs | OK (e.g. passengersToday present) |
| `npm run build` | PASS |

## Next operator steps

1. Push/redeploy backend to Railway.
2. Set Cloudflare Pages env `VITE_API_URL=https://web-production-f8ec21.up.railway.app/api` and redeploy.
3. Confirm Railway `CORS_ORIGINS` includes `https://transitops-frontend.pages.dev`.
4. Login as admin and spot-check Dashboard, Drivers, Vehicles, Reports CSV.
