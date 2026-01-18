
// Use the 'firebase-app-compat.js' and 'firebase-messaging-compat.js' scripts
// to simplify service worker setup. These are designed to work in this context.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || '/logo.png'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('Service Worker: Firebase config not found in query params.');
}
