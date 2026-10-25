/**
 * Service Worker for SignAction PWA.
 * Caches app shell, static assets, and sign language media for offline use.
 */

const CACHE_NAME = 'signaction-v5';
const STATIC_CACHE = 'signaction-static-v5';
const MEDIA_CACHE = 'signaction-v1';

// Install: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: clean up obsolete caches while preserving offline media cache ('signaction-v1')
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME && name !== MEDIA_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/**
 * Serve cached sign MP4 videos with proper HTTP 206 Partial Content Range support
 * so Chrome, Safari, and Android WebView <video> elements play seamlessly offline,
 * while never calling Cache.put() on 206 network responses.
 */
async function handleMediaRequest(request, url) {
  const mediaCache = await caches.open(MEDIA_CACHE);
  let cachedResponse = await mediaCache.match(url.pathname);

  if (!cachedResponse && url.pathname.startsWith('/assets/alphabet/')) {
    const fallbackSignPath = url.pathname.replace('/assets/alphabet/', '/assets/signs/');
    cachedResponse = await mediaCache.match(fallbackSignPath);
  }

  if (cachedResponse) {
    const arrayBuffer = await cachedResponse.arrayBuffer();
    const total = arrayBuffer.byteLength;
    const contentType =
      cachedResponse.headers.get('content-type') ||
      (url.pathname.endsWith('.webm') ? 'video/webm' : 'video/mp4');
    const rangeHeader = request.headers.get('range');

    if (rangeHeader && total > 0) {
      const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
      if (match) {
        const start = Math.min(Number(match[1]), total - 1);
        const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
        const chunk = arrayBuffer.slice(start, end + 1);
        return new Response(chunk, {
          status: 206,
          statusText: 'Partial Content',
          headers: {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': String(chunk.byteLength),
          },
        });
      }
    }

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(total),
      },
    });
  }

  // Not yet in offline media cache: stream directly from network without Cache.put on 206
  return fetch(request);
}

// Fetch: different strategies for different request types
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http
  if (!url.protocol.startsWith('http')) return;

  // Skip Vosk model and large downloads (e.g. APK) — stored in IndexedDB / downloaded directly
  if (
    url.pathname === '/api/vosk-model' ||
    url.pathname.startsWith('/models/') ||
    url.pathname.startsWith('/download-apk') ||
    url.pathname.endsWith('.apk')
  ) {
    return;
  }

  // Serve cached MP4/WebM sign videos offline with Range support, or pass through to network online
  if (
    request.headers.has('range') ||
    request.destination === 'video' ||
    request.destination === 'audio' ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.webm') ||
    url.pathname.endsWith('.ogg')
  ) {
    event.respondWith(handleMediaRequest(request, url));
    return;
  }

  // Skip Next.js dev HMR endpoints
  if (url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  // Code assets (JS, CSS): network-first so clients always receive latest code updates
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static media assets (images, fonts, icons): cache-first
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          return caches.match('/');
        });
      })
    );
    return;
  }

  // HTML pages: network-first so clients always receive latest deployment HTML, fallback to cache offline
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        })
    );
    return;
  }

  // API calls: network-first (fall back to cache)
  if (
    url.pathname.startsWith('/translate-') ||
    url.pathname.startsWith('/health') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/dictionary')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
