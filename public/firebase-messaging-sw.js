// This file must be in the public folder.

// Initialize the Firebase app in the service worker by passing in
// the messagingSenderId.
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// This is required to make the service worker work.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('push', (event) => {
  try {
    const notificationData = event.data.json();
    const { title, body, icon, ...options } = notificationData.notification;
    
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        ...options,
      })
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const openUrl = event.notification.data?.FCM_MSG?.notification?.fcmOptions?.link || '/';

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      // If a window for the app is already open, focus it.
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === openUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(openUrl);
      }
    })
  );
});


// We need to initialize the app in the service worker
const urlParams = new URL(location).searchParams;
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    onBackgroundMessage(messaging, (payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'New Message';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/logo.png',
        data: {
            FCM_MSG: {
                notification: {
                    fcmOptions: {
                        link: payload.fcmOptions?.link
                    }
                }
            }
        }
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('[firebase-messaging-sw.js] Firebase config not found in URL. Background messaging will not work.');
}
