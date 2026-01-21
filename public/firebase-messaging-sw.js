// This file must be in the public directory
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigParam);
        if (firebaseConfig) {
            firebase.initializeApp(firebaseConfig);

            const messaging = firebase.messaging();

            messaging.onBackgroundMessage(function(payload) {
                console.log('Received background message ', payload);

                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: '/icons/icon-192x192.png'
                };

                self.registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    } catch (e) {
        console.error('Error parsing Firebase config in service worker:', e);
    }
}
