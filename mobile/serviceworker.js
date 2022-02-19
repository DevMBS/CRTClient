self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll([
          '/',
          '/package.json',
          '/package-lock.json',
          '/manifest.json',
          '/loading-bar.css',
          '/server.js',
          '/index.html',
          '/index.css',
          '/index.js',
          '/mobile/',
          '/mobile/index.js',
          '/mobile/index.html',
          '/mobile/index.css',
          '/login/',
          '/login/index.html',
          '/login/login.js',
          '/login/login.css',
          '/login/mobile.css',
        ]);
      })
    );
  });