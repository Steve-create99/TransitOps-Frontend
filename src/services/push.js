// ============================================================
// services/push.js — Web Push subscription helpers
// ============================================================

import { get, post, del, getAccessToken } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export async function getVapidPublicKey() {
  const data = await get('/push/vapid-public-key', { skipAuthHeader: !getAccessToken() });
  return data?.publicKey || null;
}

export async function enableWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('This browser does not support web push notifications');
  }
  if (!window.isSecureContext) {
    throw new Error('Notifications require HTTPS (or localhost)');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const publicKey = await getVapidPublicKey();
  if (!publicKey) throw new Error('VAPID public key unavailable from API');

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  await post('/push/subscribe', {
    endpoint: json.endpoint,
    keys: json.keys,
  });
  return true;
}

export async function disableWebPush() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  try {
    await del('/push/subscribe', {
      body: JSON.stringify({ endpoint: subscription.endpoint }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    /* ignore server errors on unsubscribe */
  }
  await subscription.unsubscribe();
}

export async function getPushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, subscribed: false, permission: 'unsupported' };
  }
  const permission = Notification.permission;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null;
  return {
    supported: true,
    subscribed: !!subscription,
    permission,
  };
}
