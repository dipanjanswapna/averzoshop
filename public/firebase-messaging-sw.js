/* eslint-disable no-undef */

/* Firebase compat libraries (Service Worker compatible) */
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

/* 🔥 Firebase config (PUBLIC – safe) */
firebase.initializeApp({
  apiKey: "AIzaSyBkcdN4P3xLedgQ2qU2ENtFuQIAYJ8ExuM",
  authDomain: "averzo-home.firebaseapp.com",
  databaseURL: "https://averzo-home-default-rtdb.firebaseio.com",
  projectId: "averzo-home",
  storageBucket: "averzo-home.firebasestorage.app",
  messagingSenderId: "186569132518",
  appId: "1:186569132518:web:e9109729290e7ee2326e27",
});

/* Initialize messaging */
const messaging = firebase.messaging();

/* 🔔 Background notification handler */
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle =
    payload.notification?.title || 'Averzo Notification';

  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/logo.png',
    data: {
      url: payload.fcmOptions?.link || payload.notification?.click_action || '/',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/* 🔗 Notification click handler */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
