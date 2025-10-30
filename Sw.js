// ===============================================
// !!!           التغيير المهم هنا           !!!
// ===============================================
const CACHE_NAME = 'mcq-app-cache-v3';

// الملفات الأساسية التي نريد تخزينها
const URLS_TO_CACHE = [
  '/', 
  'index.html', // هذا سيخزن النسخة الجديدة من index.html
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js'
];

// 1. حدث التثبيت (Install)
// سيتم تشغيل هذا لأن v3 جديد
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        // سيقوم بجلب index.html الجديد من السيرفر
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // تفعيل الـ SW الجديد فوراً
  );
});

// 2. حدث التفعيل (Activate)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME]; // القائمة الآن هي v3
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // سيجد 'mcq-app-cache-v2' ويقوم بحذفه
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. حدث جلب البيانات (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجده في كاش v3، سيعيده
        if (response) {
          return response;
        }
        // إذا لم يجده، سيجلبه من الإنترنت
        return fetch(event.request);
      })
  );
});
