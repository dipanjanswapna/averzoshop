
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// the messagingSenderId.
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(firebaseConfigParam);

    if (firebaseConfig) {
        firebase.initializeApp(firebaseConfig);

        // Retrieve an instance of Firebase Messaging so that it can handle background
        // messages.
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage(function(payload) {
          console.log('[firebase-messaging-sw.js] Received background message ', payload);
          // Customize notification here
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.image
          };

          self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
}
