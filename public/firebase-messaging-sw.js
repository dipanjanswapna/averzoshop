// This service worker is essential for PWA functionality and Firebase Cloud Messaging.

// We use importScripts to load the Firebase SDK into the service worker.
// The version should ideally match the one in your package.json.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// An empty fetch event listener makes the app installable (a PWA requirement).
// You can add caching strategies here later for offline functionality.
self.addEventListener('fetch', (event) => {
  // Placeholder for caching logic
});

try {
  // Firebase configuration is passed as a URL parameter from the client.
  const urlParams = new URLSearchParams(location.search);
  const firebaseConfigStr = urlParams.get("firebaseConfig");
  
  if (firebaseConfigStr) {
    const firebaseConfig = JSON.parse(firebaseConfigStr);
    firebase.initializeApp(firebaseConfig);
    
    // Check if Firebase Messaging is supported in this browser.
    if (firebase.messaging.isSupported()) {
      const messaging = firebase.messaging();
      
      // Handle background messages (notifications) when the app is not in the foreground.
      messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body,
          icon: '/icons/icon-192x192.png' // Default icon for notifications
        };
        
        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  }
} catch (e) {
  console.error('Error initializing Firebase in service worker:', e);
}
