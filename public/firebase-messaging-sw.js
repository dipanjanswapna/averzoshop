// Scripts for firebase and firebase messaging
self.importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
self.importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    try {
        const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);

            const messaging = firebase.messaging();

            messaging.onBackgroundMessage(function(payload) {
                console.log('Received background message ', payload);

                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: payload.notification.image
                };

                self.registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    } catch(e) {
        console.error('Error parsing firebase config in SW', e);
    }
}
