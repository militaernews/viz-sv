const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			'../nodes/0.DFARuqgN.js',
			'../chunks/NZTpNUN0.js',
			'../chunks/oNtRZf3p.js',
			'../assets/0.CWqbs5Lc.css',
			'../nodes/1.Bjna-6c7.js',
			'../chunks/BLzYw7u3.js',
			'../chunks/aPSXSzo0.js',
			'../nodes/2.DU9W4p8l.js',
			'../chunks/BC2Jm6Wp.js'
		])
) => i.map((i) => d[i]);
import {
	h as N,
	d as U,
	b as B,
	E as G,
	k as W,
	l as Y,
	m as Z,
	n as H,
	q as J,
	p as K,
	D as w,
	O as Q,
	z as m,
	ap as X,
	a6 as $,
	aw as ee,
	Z as te,
	R as re,
	T as ae,
	ax as x,
	av as se,
	f as F,
	_ as k,
	a1 as ne,
	a as E,
	a0 as oe,
	ay as O,
	c as ce,
	r as ie,
	az as S,
	aA as le,
	$ as ue
} from '../chunks/oNtRZf3p.js';
import { h as fe, m as de, u as me, o as he, s as _e } from '../chunks/BLzYw7u3.js';
import '../chunks/NZTpNUN0.js';
import { p as A, i as C, b as L } from '../chunks/BC2Jm6Wp.js';
function T(l, e, s) {
	N && U();
	var o = l,
		n,
		r,
		t = null,
		a = null;
	function _() {
		(r && (K(r), (r = null)),
			t && (t.lastChild.remove(), o.before(t), (t = null)),
			(r = a),
			(a = null));
	}
	(B(() => {
		if (n !== (n = e())) {
			var h = H();
			if (n) {
				var c = o;
				(h && ((t = document.createDocumentFragment()), t.append((c = W()))),
					(a = Y(() => s(c, n))));
			}
			h ? Z.add_callback(_) : _();
		}
	}, G),
		N && (o = J));
}
function ve(l) {
	return class extends ge {
		constructor(e) {
			super({ component: l, ...e });
		}
	};
}
class ge {
	#t;
	#e;
	constructor(e) {
		var s = new Map(),
			o = (r, t) => {
				var a = ee(t, !1, !1);
				return (s.set(r, a), a);
			};
		const n = new Proxy(
			{ ...(e.props || {}), $$events: {} },
			{
				get(r, t) {
					return m(s.get(t) ?? o(t, Reflect.get(r, t)));
				},
				has(r, t) {
					return t === Q ? !0 : (m(s.get(t) ?? o(t, Reflect.get(r, t))), Reflect.has(r, t));
				},
				set(r, t, a) {
					return (w(s.get(t) ?? o(t, a), a), Reflect.set(r, t, a));
				}
			}
		);
		((this.#e = (e.hydrate ? fe : de)(e.component, {
			target: e.target,
			anchor: e.anchor,
			props: n,
			context: e.context,
			intro: e.intro ?? !1,
			recover: e.recover
		})),
			(!e?.props?.$$host || e.sync === !1) && X(),
			(this.#t = n.$$events));
		for (const r of Object.keys(this.#e))
			r === '$set' ||
				r === '$destroy' ||
				r === '$on' ||
				$(this, r, {
					get() {
						return this.#e[r];
					},
					set(t) {
						this.#e[r] = t;
					},
					enumerable: !0
				});
		((this.#e.$set = (r) => {
			Object.assign(n, r);
		}),
			(this.#e.$destroy = () => {
				me(this.#e);
			}));
	}
	$set(e) {
		this.#e.$set(e);
	}
	$on(e, s) {
		this.#t[e] = this.#t[e] || [];
		const o = (...n) => s.call(this, ...n);
		return (
			this.#t[e].push(o),
			() => {
				this.#t[e] = this.#t[e].filter((n) => n !== o);
			}
		);
	}
	$destroy() {
		this.#e.$destroy();
	}
}
const ye = 'modulepreload',
	be = function (l, e) {
		return new URL(l, e).href;
	},
	q = {},
	j = function (e, s, o) {
		let n = Promise.resolve();
		if (s && s.length > 0) {
			let t = function (c) {
				return Promise.all(
					c.map((f) =>
						Promise.resolve(f).then(
							(v) => ({ status: 'fulfilled', value: v }),
							(v) => ({ status: 'rejected', reason: v })
						)
					)
				);
			};
			const a = document.getElementsByTagName('link'),
				_ = document.querySelector('meta[property=csp-nonce]'),
				h = _?.nonce || _?.getAttribute('nonce');
			n = t(
				s.map((c) => {
					if (((c = be(c, o)), c in q)) return;
					q[c] = !0;
					const f = c.endsWith('.css'),
						v = f ? '[rel="stylesheet"]' : '';
					if (o)
						for (let g = a.length - 1; g >= 0; g--) {
							const i = a[g];
							if (i.href === c && (!f || i.rel === 'stylesheet')) return;
						}
					else if (document.querySelector(`link[href="${c}"]${v}`)) return;
					const u = document.createElement('link');
					if (
						((u.rel = f ? 'stylesheet' : ye),
						f || (u.as = 'script'),
						(u.crossOrigin = ''),
						(u.href = c),
						h && u.setAttribute('nonce', h),
						document.head.appendChild(u),
						f)
					)
						return new Promise((g, i) => {
							(u.addEventListener('load', g),
								u.addEventListener('error', () => i(new Error(`Unable to preload CSS for ${c}`))));
						});
				})
			);
		}
		function r(t) {
			const a = new Event('vite:preloadError', { cancelable: !0 });
			if (((a.payload = t), window.dispatchEvent(a), !a.defaultPrevented)) throw t;
		}
		return n.then((t) => {
			for (const a of t || []) a.status === 'rejected' && r(a.reason);
			return e().catch(r);
		});
	},
	Ce = {};
var Ee = F(
		'<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>'
	),
	Pe = F('<!> <!>', 1);
function pe(l, e) {
	te(e, !0);
	let s = A(e, 'components', 23, () => []),
		o = A(e, 'data_0', 3, null),
		n = A(e, 'data_1', 3, null);
	(re(() => e.stores.page.set(e.page)),
		ae(() => {
			(e.stores, e.page, e.constructors, s(), e.form, o(), n(), e.stores.page.notify());
		}));
	let r = x(!1),
		t = x(!1),
		a = x(null);
	he(() => {
		const i = e.stores.page.subscribe(() => {
			m(r) &&
				(w(t, !0),
				se().then(() => {
					w(a, document.title || 'untitled page', !0);
				}));
		});
		return (w(r, !0), i);
	});
	const _ = S(() => e.constructors[1]);
	var h = Pe(),
		c = k(h);
	{
		var f = (i) => {
				var d = O();
				const P = S(() => e.constructors[0]);
				var p = k(d);
				(T(
					p,
					() => m(P),
					(y, b) => {
						L(
							b(y, {
								get data() {
									return o();
								},
								get form() {
									return e.form;
								},
								get params() {
									return e.page.params;
								},
								children: (R, we) => {
									var D = O(),
										I = k(D);
									(T(
										I,
										() => m(_),
										(M, V) => {
											L(
												V(M, {
													get data() {
														return n();
													},
													get form() {
														return e.form;
													},
													get params() {
														return e.page.params;
													}
												}),
												(z) => (s()[1] = z),
												() => s()?.[1]
											);
										}
									),
										E(R, D));
								},
								$$slots: { default: !0 }
							}),
							(R) => (s()[0] = R),
							() => s()?.[0]
						);
					}
				),
					E(i, d));
			},
			v = (i) => {
				var d = O();
				const P = S(() => e.constructors[0]);
				var p = k(d);
				(T(
					p,
					() => m(P),
					(y, b) => {
						L(
							b(y, {
								get data() {
									return o();
								},
								get form() {
									return e.form;
								},
								get params() {
									return e.page.params;
								}
							}),
							(R) => (s()[0] = R),
							() => s()?.[0]
						);
					}
				),
					E(i, d));
			};
		C(c, (i) => {
			e.constructors[1] ? i(f) : i(v, !1);
		});
	}
	var u = ne(c, 2);
	{
		var g = (i) => {
			var d = Ee(),
				P = ce(d);
			{
				var p = (y) => {
					var b = le();
					(ue(() => _e(b, m(a))), E(y, b));
				};
				C(P, (y) => {
					m(t) && y(p);
				});
			}
			(ie(d), E(i, d));
		};
		C(u, (i) => {
			m(r) && i(g);
		});
	}
	(E(l, h), oe());
}
const Le = ve(pe),
	Te = [
		() => j(() => import('../nodes/0.DFARuqgN.js'), __vite__mapDeps([0, 1, 2, 3]), import.meta.url),
		() =>
			j(() => import('../nodes/1.Bjna-6c7.js'), __vite__mapDeps([4, 1, 2, 5, 6]), import.meta.url),
		() =>
			j(
				() => import('../nodes/2.DU9W4p8l.js'),
				__vite__mapDeps([7, 1, 2, 5, 8, 6]),
				import.meta.url
			)
	],
	je = [],
	De = { '/': [2] },
	Re = {
		handleError: ({ error: l }) => {
			console.error(l);
		},
		reroute: () => {},
		transport: {}
	},
	ke = Object.fromEntries(Object.entries(Re.transport).map(([l, e]) => [l, e.decode])),
	Ne = !1,
	qe = (l, e) => ke[l](e);
export {
	qe as decode,
	ke as decoders,
	De as dictionary,
	Ne as hash,
	Re as hooks,
	Ce as matchers,
	Te as nodes,
	Le as root,
	je as server_loads
};
