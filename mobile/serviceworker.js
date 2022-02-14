self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll([
          '../',
          '../server.js',
          '../assets/head.jpg',
          '../assets/logo_x192.svg',
          '../assets/logo_x192.png',
          '../assets/logo_x192.png',
          '../assets/logo_x512.svg',
          '../assets/line-angle-down.svg',
          '../assets/maskable_icon_x192.png',
          '../assets/fav.ico',
          '../assets/rpi4.png',
          '../app/mobile/',
          '../login/',
          '../login/index.html',
          '../login/login.js',
          '../login/login.css',
          './',
          './index.html',
          './index.css',
          './index.js'
        ]);
      })
    );
  });