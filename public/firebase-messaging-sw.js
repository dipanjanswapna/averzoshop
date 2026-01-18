// This file needs to be in the public directory and named exactly this.
// These scripts give the service worker access to Firebase.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// The config will be passed as URL search parameters from the client
// when the service worker is registered.
const searchParams = new URL(self.location).searchParams;

const firebaseConfig = {
    apiKey: searchParams.get('apiKey'),
    authDomain: searchParams.get('authDomain'),
    projectId: searchParams.get('projectId'),
    storageBucket: searchParams.get('storageBucket'),
    messagingSenderId: searchParams.get('messagingSenderId'),
    appId: searchParams.get('appId'),
};

// Initialize Firebase if the config is present and the app is not already initialized
if (firebaseConfig.apiKey && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handler for background messages
    messaging.onBackgroundMessage(function(payload) {
        console.log('Received background message ', payload);

        const notificationTitle = payload.notification.title || 'New Message';
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon
        };

        // The service worker shows the notification
        return self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error("Firebase config not found in service worker or app already initialized. Push notifications in background might not work.");
}
