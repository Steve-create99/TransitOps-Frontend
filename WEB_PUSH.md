# Enabling browser notifications (web push)

1. Deploy the backend with `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` set (see backend `.env.example`).
2. Sign in to the admin web app as **ADMIN** or **DISPATCHER**.
3. Open **Settings → Browser notifications → Enable notifications**.
4. Allow notifications when the browser prompts you.
5. Keep the tab/site permission granted. You will receive pushes for:
   - Driver invite sent / accepted
   - New incidents
   - In-app notification creates (delays, system alerts)

Public VAPID key endpoint: `GET /api/push/vapid-public-key`  
Service worker: `/sw.js` (registered by the Settings toggle).

**Notes**
- Requires HTTPS (Cloudflare Pages) or `localhost`.
- Subscriptions are stored per user in Postgres (`push_subscriptions`).
- To disable, use the same Settings control or revoke site notifications in the browser.
