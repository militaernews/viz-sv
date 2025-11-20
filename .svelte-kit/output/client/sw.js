if (!self.define) {
	let e,
		s = {};
	const l = (l, i) => (
		(l = new URL(l + '.js', i).href),
		s[l] ||
			new Promise((s) => {
				if ('document' in self) {
					const e = document.createElement('script');
					((e.src = l), (e.onload = s), document.head.appendChild(e));
				} else ((e = l), importScripts(l), s());
			}).then(() => {
				let e = s[l];
				if (!e) throw new Error(`Module ${l} didn’t register its module`);
				return e;
			})
	);
	self.define = (i, n) => {
		const r = e || ('document' in self ? document.currentScript.src : '') || location.href;
		if (s[r]) return;
		let u = {};
		const o = (e) => l(e, r),
			t = { module: { uri: r }, exports: u, require: o };
		s[r] = Promise.all(i.map((e) => t[e] || o(e))).then((e) => (n(...e), u));
	};
}
define(['./workbox-e3490c72'], function (e) {
	'use strict';
	(self.addEventListener('message', (e) => {
		e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
	}),
		e.precacheAndRoute(
			[
				{ url: '_app/immutable/assets/_layout.CWqbs5Lc.css', revision: null },
				{ url: '_app/immutable/assets/0.CWqbs5Lc.css', revision: null },
				{ url: '_app/immutable/chunks/aPSXSzo0.js', revision: null },
				{ url: '_app/immutable/chunks/BC2Jm6Wp.js', revision: null },
				{ url: '_app/immutable/chunks/BLzYw7u3.js', revision: null },
				{ url: '_app/immutable/chunks/NZTpNUN0.js', revision: null },
				{ url: '_app/immutable/chunks/oNtRZf3p.js', revision: null },
				{ url: '_app/immutable/entry/app.B2PpyC6e.js', revision: null },
				{ url: '_app/immutable/entry/start.CWyVl_VW.js', revision: null },
				{ url: '_app/immutable/nodes/0.DFARuqgN.js', revision: null },
				{ url: '_app/immutable/nodes/1.Bjna-6c7.js', revision: null },
				{ url: '_app/immutable/nodes/2.DU9W4p8l.js', revision: null },
				{ url: 'favicon.png', revision: '3a387408ecc6cc283f724b39ca5fffb4' },
				{ url: 'placeholder.svg', revision: '888fcd0b60014870eb17ed064ca7550b' },
				{ url: 'registerSW.js', revision: '402b66900e731ca748771b6fc5e7a068' },
				{ url: 'service-worker.js', revision: 'ce7242831013df04bc3776f84f312464' },
				{ url: 'manifest.webmanifest', revision: 'bcfb0c6b1e3e2b6cfafa8ccad98b8f8d' }
			],
			{}
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL('/'))));
});
