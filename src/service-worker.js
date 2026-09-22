/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Without these, a new deploy's service worker installs but sits "waiting"
// until every open tab of the site is fully closed - until then, browsers
// keep serving the *previous* precached JS/CSS bundle, so a fix can look
// like it never shipped even though the new code is already live. Skipping
// the wait and claiming existing clients makes a new deploy take over
// immediately instead.
self.skipWaiting();
clientsClaim();

// Precaches the app shell (build output + static/ files) - vite-pwa injects the
// manifest into self.__WB_MANIFEST at build time.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Search results embed each match's thumbnail as a base64 data URI, so there's
// no separate image request to cache - caching the response body here is what
// caches the thumbs. Requests are POSTs (tags JSON or a multipart image), which
// the Cache API can't key on directly, so we hash the body into a synthetic key.
const SEARCH_CACHE = 'search-results-v1';

async function searchCacheKey(request) {
	const bytes = await request.clone().arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
	return new Request(`${new URL(request.url).pathname}?body=${hex}`);
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (request.method !== 'POST' || !url.pathname.startsWith('/api/search/')) {
		return;
	}

	event.respondWith(
		(async () => {
			const cache = await caches.open(SEARCH_CACHE);
			const key = await searchCacheKey(request);

			// Network-first: search results should be fresh whenever possible: the
			// cache is only a fallback for offline/flaky-connection use, not a way
			// to skip fetching newer results while online.
			try {
				const response = await fetch(request);
				if (response.ok) cache.put(key, response.clone());
				return response;
			} catch (err) {
				const cached = await cache.match(key);
				if (cached) return cached;
				throw err;
			}
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key.startsWith('search-results-') && key !== SEARCH_CACHE) {
					await caches.delete(key);
				}
			}
		})()
	);
});
