
// This service worker can be customized to your needs.
// For more information, see: https://firebase.google.com/docs/cloud-messaging/js/client

// Scripts for Firebase products are imported on-demand
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

self.addEventListener('install', function(event) {
    console.log('[FCM SW] Service Worker installing.');
});

self.addEventListener('activate', function(event) {
    console.log('[FCM SW] Service Worker activating.');
});


// 1. Get Firebase config from URL
const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');
if (!firebaseConfigParam) {
    console.error("[FCM SW] Firebase config not found in URL. Background notifications will not work.");
} else {
    try {
        const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
        
        // 2. Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log("[FCM SW] Firebase initialized successfully.");

        // 3. Get a Messaging instance
        const messaging = firebase.messaging();
        
        // 4. Handle background messages
        messaging.onBackgroundMessage((payload) => {
            console.log('[FCM SW] Received background message: ', payload);
            
            const notificationTitle = payload.notification?.title || 'New Message';
            const notificationOptions = {
                body: payload.notification?.body || 'You have a new message.',
                icon: payload.notification?.icon || '/logo.png',
                data: {
                    url: payload.fcmOptions?.link || '/'
                }
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });

        // 5. Handle notification click
        self.addEventListener('notificationclick', (event) => {
            event.notification.close();
            const urlToOpen = event.notification.data.url;
            event.waitUntil(clients.openWindow(urlToOpen));
        });

    } catch (error) {
        console.error("[FCM SW] Error parsing Firebase config or initializing:", error);
    }
}
