const CACHE_NAME = 'my-site-cache-v1'; // قم بتغيير رقم الإصدار عند تحديث الملفات المخزنة
// يجب أن تعكس هذه المسارات جذر موقعك على GitHub Pages
const urlsToCache = [
  '/safe-haven.com/',                 // الصفحة الرئيسية لموقعك
  '/safe-haven.com/index.html',       // ملف HTML الرئيسي
  '/safe-haven.com/styles.css',       // ملفات CSS الخاصة بك (إذا كان لديك)
  '/safe-haven.com/script.js',        // ملفات JavaScript الخاصة بك (إذا كان لديك)
  '/safe-haven.com/images/icon-192x192.png', // الأيقونات
  '/safe-haven.com/images/logo.png',   // أي صور رئيسية أخرى
  // أضف هنا جميع الملفات التي تريد أن تكون متاحة دون اتصال (HTML, CSS, JS, Images, Fonts)
  // مثال على ملف جوجل إذا كان HTML:
  '/safe-haven.com/googlec5f6c58e64a8bd8e.html',
  '/safe-haven.com/manifest.json',
  '/safe-haven.com/sw.js'
];

// حدث التثبيت (Install Event): يتم تشغيله عند تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache); // تخزين جميع الملفات المحددة
      })
      .then(() => self.skipWaiting()) // لتفعيل الخدمة فوراً
  );
});

// حدث الجلب (Fetch Event): يتم تشغيله لكل طلب شبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان الملف موجودًا في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }
        // إذا لم يكن موجودًا، اذهب للشبكة لجلب الملف
        return fetch(event.request)
          .then(networkResponse => {
            // يمكنك هنا تحديث الكاش بالملفات الجديدة
            // إذا كان الطلب ناجحًا وذا حالة 200
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // إذا أردت تخزين الموارد التي تم جلبها من الشبكة تلقائياً
            // var responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME)
            //   .then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            return networkResponse;
          })
          .catch(() => {
            // هذا الجزء سيُشغل في حال عدم وجود اتصال بالانترنت ولم يتم العثور على الملف في الكاش
            console.log("Service Worker: Network request failed and no cache match for", event.request.url);
            // يمكنك إرجاع صفحة "أنت غير متصل" مخصصة إذا كان لديك
            // return caches.match('/safe-haven.com/offline.html');
            return new Response('<h1>أنت غير متصل بالإنترنت.</h1>', {
                headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
});


// حدث التفعيل (Activate Event): يتم تشغيله بعد التثبيت، ويستخدم لتنظيف الكاشات القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName); // حذف الكاشات القديمة
          }
        })
      );
    }).then(() => self.clients.claim()) // تفعيل الخدمة لجميع الصفحات المفتوحة فوراً
  );
});
