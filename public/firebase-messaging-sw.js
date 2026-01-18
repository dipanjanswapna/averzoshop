// This service worker handles background notifications.

// Import the Firebase app and messaging scripts.
// Using -compat versions for easier integration with the v8 messaging API syntax.
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

try {
  // The service worker is registered with the config in the URL search params.
  // This line parses them into a config object.
  const firebaseConfig = Object.fromEntries(new URLSearchParams(location.search));

  // Initialize Firebase if the config is present.
  if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    // Add a listener for background messages.
    messaging.onBackgroundMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title;
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/logo.png' // Optional: Make sure you have a logo.png in your /public folder
      };

      // Show the notification to the user.
      if (notificationTitle) {
        self.registration.showNotification(notificationTitle, notificationOptions);
      }
    });
  }
} catch(e) {
    console.error('Error in service worker', e);
}
