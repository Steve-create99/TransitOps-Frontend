/* TransitOps admin web push service worker */
const BRAND_ICON = '/logo.png';

self.addEventListener('push', (event) => {
  let data = { title: 'TransitOps', body: 'New update', url: '/notifications' };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    try {
      data.body = event.data ? event.data.text() : data.body;
    } catch {
      /* ignore */
    }
  }

  const icon = data.icon && !String(data.icon).includes('vite') ? data.icon : BRAND_ICON;

  event.waitUntil(
    self.registration.showNotification(data.title || 'TransitOps', {
      body: data.body || '',
      icon,
      badge: BRAND_ICON,
      image: undefined,
      data: { url: data.url || '/notifications' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
      return undefined;
    })
  );
});
