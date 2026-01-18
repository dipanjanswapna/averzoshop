importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// URL প্যারামিটার থেকে কনফিগারেশন রিড করা
const urlParams = new URLSearchParams(location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
  try {
    const firebaseConfig = JSON.parse(firebaseConfigParam);
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    // ব্যাকগ্রাউন্ড নোটিফিকেশন হ্যান্ডলার
    messaging.onBackgroundMessage((payload) => {
      console.log('[SW] Background message received:', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // নিশ্চিত করুন public/logo.png আছে
        data: {
          url: payload.data?.link || '/'
        }
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (e) {
    console.error('[SW] Config parse error:', e);
  }
}

// নোটিফিকেশনে ক্লিক করলে পেজ ওপেন হওয়া
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});