const e = location.pathname.split('/').slice(0, -1).join('/'),
	r = [
		e + '/_app/immutable/entry/app.B2PpyC6e.js',
		e + '/_app/immutable/nodes/0.DFARuqgN.js',
		e + '/_app/immutable/assets/0.CWqbs5Lc.css',
		e + '/_app/immutable/nodes/1.Bjna-6c7.js',
		e + '/_app/immutable/nodes/2.DU9W4p8l.js',
		e + '/_app/immutable/chunks/BC2Jm6Wp.js',
		e + '/_app/immutable/chunks/BLzYw7u3.js',
		e + '/_app/immutable/chunks/NZTpNUN0.js',
		e + '/_app/immutable/chunks/aPSXSzo0.js',
		e + '/_app/immutable/chunks/oNtRZf3p.js',
		e + '/_app/immutable/entry/start.CWyVl_VW.js'
	],
	l = [e + '/favicon.png', e + '/placeholder.svg', e + '/test.jpg'],
	u = '1753220644956',
	i = `cache-${u}`,
	p = [...r, ...l];
self.addEventListener('install', (s) => {
	async function n() {
		await (await caches.open(i)).addAll(p);
	}
	s.waitUntil(n());
});
self.addEventListener('activate', (s) => {
	async function n() {
		for (const t of await caches.keys()) t !== i && (await caches.delete(t));
	}
	s.waitUntil(n());
});
self.addEventListener('fetch', (s) => {
	if (s.request.method !== 'GET') return;
	async function n() {
		const t = new URL(s.request.url),
			c = await caches.open(i);
		if (p.includes(t.pathname)) {
			const a = await c.match(t.pathname);
			if (a) return a;
		}
		try {
			const a = await fetch(s.request);
			if (!(a instanceof Response)) throw new Error('invalid response from fetch');
			return (a.status === 200 && c.put(s.request, a.clone()), a);
		} catch (a) {
			const o = await c.match(s.request);
			if (o) return o;
			throw a;
		}
	}
	s.respondWith(n());
});
