// Give the service worker a name
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Import the Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Get Firebase config from URL
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    try {
        const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
        
        // Initialize the Firebase app in the service worker
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
          console.log('[firebase-messaging-sw.js] Received background message ', payload);
          
          // Customize the notification here
          const notificationTitle = payload.notification?.title || 'New Notification';
          const notificationOptions = {
            body: payload.notification?.body || 'You have a new message.',
            icon: '/logo.png' // Make sure you have a logo at public/logo.png
          };

          self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (error) {
        console.error("Error parsing Firebase config in Service Worker:", error);
    }
} else {
    console.error("Service Worker: Firebase config not found in URL parameters.");
}
