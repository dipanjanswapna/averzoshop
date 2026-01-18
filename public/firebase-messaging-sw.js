// public/firebase-messaging-sw.js
// This service worker handles background push notifications.

// Import the Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating.');
});


// We can't use process.env here, so we get the config from the query string
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigParam);
        
        // Initialize the Firebase app in the service worker
        firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging();
        console.log('[SW] Firebase Messaging initialized in Service Worker.');
        
        messaging.onBackgroundMessage((payload) => {
            console.log('[SW] Received background message ', payload);

            const notificationTitle = payload.notification?.title || "New Notification";
            const notificationOptions = {
                body: payload.notification?.body || "You have a new message.",
                icon: payload.notification?.icon || '/logo.png', // Use icon from payload or default
                data: {
                    url: payload.fcmOptions?.link || '/' // URL to open on click
                }
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });

        self.addEventListener('notificationclick', (event) => {
            event.notification.close();
            const urlToOpen = event.notification.data.url || '/';
            event.waitUntil(
                self.clients.openWindow(urlToOpen)
            );
        });

    } catch (error) {
        console.error("[SW] Error parsing Firebase config or initializing app:", error);
    }
} else {
    console.error("[SW] Firebase config not found in service worker URL.");
}
