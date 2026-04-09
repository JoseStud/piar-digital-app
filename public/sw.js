/* Service worker for the static PIAR export. */

const CACHE_NAME = 'piar-v1';
const PRECACHE_URLS = ['/', '/diligenciar'];
const STATIC_ASSET_PREFIX = '/_next/static/';
const STATIC_ASSET_PATTERN = /(?:href|src)=["'](\/_next\/static\/[^"']+)["']/g;

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isStaticAsset(url) {
  return url.pathname.startsWith(STATIC_ASSET_PREFIX);
}

async function cacheResponse(cache, request, response) {
  if (!response || !response.ok || !isSameOrigin(new URL(request.url))) {
    return response;
  }

  cache.put(request, response.clone()).catch(() => undefined);
  return response;
}

async function discoverStaticAssets() {
  const urls = new Set(PRECACHE_URLS);

  for (const pageUrl of PRECACHE_URLS) {
    try {
      const response = await fetch(pageUrl, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      for (const match of html.matchAll(STATIC_ASSET_PATTERN)) {
        urls.add(match[1]);
      }
    } catch {
      // ignore install-time discovery failures; route precache still works
    }
  }

  return [...urls];
}

async function networkFirst(request, fallbackUrl = '/') {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    return cacheResponse(cache, request, response);
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      return cached;
    }

    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) {
        return fallback;
      }
    }

    return Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    return cacheResponse(cache, request, response);
  } catch {
    return Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urlsToCache = await discoverStaticAssets();
    await Promise.all(urlsToCache.map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        // ignore individual asset failures so one bad file does not abort install
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith('piar-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
