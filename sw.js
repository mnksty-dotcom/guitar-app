// Pocket Guitar Studio - Service Worker
// 完全オフライン対応（Cache First戦略）

const CACHE_NAME = 'pocket-guitar-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/audio.js',
  './js/chord-data.js',
  './js/fretboard-renderer.js',
  './js/progression-player.js',
  './js/song-editor.js',
  './js/tuner.js',
  './js/app.js'
];

// インストール時：全アセットをキャッシュに保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// アクティベーション時：古いキャッシュをクリーンアップ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// リクエスト時：キャッシュから即座に返す（ネットワーク不要で起動可能）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ処理
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // キャッシュがあれば即座に返す
        // バックグラウンドで最新データをフェッチしてキャッシュ更新（Stale-While-Revalidate）
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {/* オフライン時は何もしない */});
        return cachedResponse;
      }

      // キャッシュになければネットワークから取得
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // ネットワークもキャッシュもない場合、オフライン時のフォールバックとしてindex.htmlを返す
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
