// DO NOT USE import/export
// This file is a service worker and runs in a different context.

// These importScripts are required for the Firebase SDK to work in the service worker.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

self.addEventListener('install', function(e) {
  console.log('[FCM SW] Service Worker installing.');
});

self.addEventListener('activate', function(e) {
  console.log('[FCM SW] Service Worker activating.');
});

// The firebaseConfig is passed from the client-provider as a URL query parameter.
const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get("firebaseConfig");

if (!firebaseConfigParam) {
    console.error("[FCM SW] Firebase config not found in URL. This is required for initialization.");
} else {
    try {
        const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
        firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[FCM SW] Received background message: ', payload);

            const notificationTitle = payload.notification?.title || 'New Message';
            const notificationOptions = {
                body: payload.notification?.body || 'You have a new notification.',
                icon: payload.notification?.icon || '/logo.png'
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (error) {
        console.error("[FCM SW] Error parsing Firebase config or initializing app:", error);
    }
}
