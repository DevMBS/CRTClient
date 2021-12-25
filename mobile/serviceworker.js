self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll([
          '../',
          '../server.js',
          '../assets/head.jpg',
          '../assets/icon192.png',
          '../assets/icon512.png',
          '../assets/icon512.svg',
          '../assets/line-angle-down.svg',
          '../assets/maskable_icon_x192.png',
          '../assets/favicon.ico',
          '../assets/rpi4.png',
          '../app/',
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