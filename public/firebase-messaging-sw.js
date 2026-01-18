// This service worker must be in the public folder.

importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// The firebaseConfig object is passed in as a URL query parameter.
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get("firebaseConfig");

if (firebaseConfigParam) {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
    firebase.initializeApp(firebaseConfig);
    
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function (payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png' 
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('Firebase config not found in service worker URL.');
}
