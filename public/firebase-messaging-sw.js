
// This import is needed for the service worker to work.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

try {
    const params = new URL(location).searchParams;
    const firebaseConfig = Object.fromEntries(params.entries());

    if (firebaseConfig.apiKey) {
        firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage(function(payload) {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);

            if (payload.notification) {
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    // icon: '/logo.png' // Optional: Add a logo to your public folder
                };

                self.registration.showNotification(notificationTitle, notificationOptions);
            }
        });
    } else {
        console.error('[firebase-messaging-sw.js] Firebase config not found in URL. Cannot initialize.');
    }
} catch (e) {
    console.error('[firebase-messaging-sw.js] Error initializing service worker:', e);
}
