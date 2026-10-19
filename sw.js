const C="vt-v5";const A=["./","index.html","css/style.css","js/data.js","js/art.js","js/monetize.js","js/game.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png",...["dorian","lucien","sabine","kade","mira"].map(n=>`assets/portraits/${n}.svg`)];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
