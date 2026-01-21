importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

try {
    const urlParams = new URLSearchParams(self.location.search);
    const firebaseConfigStr = urlParams.get('firebaseConfig');

    if (firebaseConfigStr) {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            
            const notificationTitle = payload.notification?.title || 'New Notification';
            const notificationOptions = {
                body: payload.notification?.body || 'You have a new message.',
                icon: '/icons/icon-192x192.png'
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
} catch (e) {
    console.error('Error in service worker', e);
}
