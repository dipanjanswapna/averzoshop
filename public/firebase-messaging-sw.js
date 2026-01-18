// Scripts for Firebase v9+
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Get Firebase config from URL query parameters
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigParam);

        // Initialize the Firebase app in the service worker
        firebase.initializeApp(firebaseConfig);

        // Retrieve an instance of Firebase Messaging
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage(function(payload) {
          console.log('[firebase-messaging-sw.js] Received background message ', payload);
          
          // Customize the notification here
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || '/logo.png' // Default icon
          };

          self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (e) {
        console.error('Error parsing Firebase config in service worker:', e);
    }
} else {
    console.error('Firebase config not found in service worker URL.');
}
