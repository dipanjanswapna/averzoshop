// This file must be in the public directory
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

try {
  const urlParams = new URLSearchParams(self.location.search);
  const firebaseConfigParam = urlParams.get('firebaseConfig');
  if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(firebaseConfigParam);
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        icon: '/icon-192x192.png' // A default icon
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (e) {
  console.error('Error initializing Firebase messaging service worker:', e);
}
