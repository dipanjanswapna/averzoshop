// This service worker is essential for receiving push notifications when the app is in the background.

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Get Firebase config from the URL query parameters
const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Get an instance of Firebase Messaging
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage(function(payload) {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/logo.png' // Make sure you have a logo.png in your public folder
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('Firebase config not found in service worker URL.');
}
