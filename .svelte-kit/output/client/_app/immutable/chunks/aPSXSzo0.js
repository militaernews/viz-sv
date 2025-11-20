import { o as Ke, b as Et } from './BLzYw7u3.js';
import { aV as be, aK as Rt, ax as T, z as x, D as P } from './oNtRZf3p.js';
const V = [];
function Oe(e, t = be) {
	let n = null;
	const r = new Set();
	function a(o) {
		if (Rt(e, o) && ((e = o), n)) {
			const c = !V.length;
			for (const l of r) (l[1](), V.push(l, e));
			if (c) {
				for (let l = 0; l < V.length; l += 2) V[l][0](V[l + 1]);
				V.length = 0;
			}
		}
	}
	function s(o) {
		a(o(e));
	}
	function i(o, c = be) {
		const l = [o, c];
		return (
			r.add(l),
			r.size === 1 && (n = t(a, s) || be),
			o(e),
			() => {
				(r.delete(l), r.size === 0 && n && (n(), (n = null)));
			}
		);
	}
	return { set: a, update: s, subscribe: i };
}
class ue {
	constructor(t, n) {
		((this.status = t),
			typeof n == 'string'
				? (this.body = { message: n })
				: n
					? (this.body = n)
					: (this.body = { message: `Error: ${t}` }));
	}
	toString() {
		return JSON.stringify(this.body);
	}
}
class Ce {
	constructor(t, n) {
		((this.status = t), (this.location = n));
	}
}
class Ne extends Error {
	constructor(t, n, r) {
		(super(r), (this.status = t), (this.text = n));
	}
}
new URL('sveltekit-internal://');
function It(e, t) {
	return e === '/' || t === 'ignore'
		? e
		: t === 'never'
			? e.endsWith('/')
				? e.slice(0, -1)
				: e
			: t === 'always' && !e.endsWith('/')
				? e + '/'
				: e;
}
function Ut(e) {
	return e.split('%25').map(decodeURI).join('%25');
}
function Lt(e) {
	for (const t in e) e[t] = decodeURIComponent(e[t]);
	return e;
}
function Ae({ href: e }) {
	return e.split('#')[0];
}
function Tt(e, t, n, r = !1) {
	const a = new URL(e);
	Object.defineProperty(a, 'searchParams', {
		value: new Proxy(a.searchParams, {
			get(i, o) {
				if (o === 'get' || o === 'getAll' || o === 'has') return (l) => (n(l), i[o](l));
				t();
				const c = Reflect.get(i, o);
				return typeof c == 'function' ? c.bind(i) : c;
			}
		}),
		enumerable: !0,
		configurable: !0
	});
	const s = ['href', 'pathname', 'search', 'toString', 'toJSON'];
	r && s.push('hash');
	for (const i of s)
		Object.defineProperty(a, i, {
			get() {
				return (t(), e[i]);
			},
			enumerable: !0,
			configurable: !0
		});
	return a;
}
function xt(...e) {
	let t = 5381;
	for (const n of e)
		if (typeof n == 'string') {
			let r = n.length;
			for (; r; ) t = (t * 33) ^ n.charCodeAt(--r);
		} else if (ArrayBuffer.isView(n)) {
			const r = new Uint8Array(n.buffer, n.byteOffset, n.byteLength);
			let a = r.length;
			for (; a; ) t = (t * 33) ^ r[--a];
		} else throw new TypeError('value must be a string or TypedArray');
	return (t >>> 0).toString(36);
}
function Pt(e) {
	const t = atob(e),
		n = new Uint8Array(t.length);
	for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
	return n.buffer;
}
const Ot = window.fetch;
window.fetch = (e, t) => (
	(e instanceof Request ? e.method : t?.method || 'GET') !== 'GET' && H.delete($e(e)),
	Ot(e, t)
);
const H = new Map();
function Ct(e, t) {
	const n = $e(e, t),
		r = document.querySelector(n);
	if (r?.textContent) {
		let { body: a, ...s } = JSON.parse(r.textContent);
		const i = r.getAttribute('data-ttl');
		return (
			i && H.set(n, { body: a, init: s, ttl: 1e3 * Number(i) }),
			r.getAttribute('data-b64') !== null && (a = Pt(a)),
			Promise.resolve(new Response(a, s))
		);
	}
	return window.fetch(e, t);
}
function Nt(e, t, n) {
	if (H.size > 0) {
		const r = $e(e, n),
			a = H.get(r);
		if (a) {
			if (
				performance.now() < a.ttl &&
				['default', 'force-cache', 'only-if-cached', void 0].includes(n?.cache)
			)
				return new Response(a.body, a.init);
			H.delete(r);
		}
	}
	return window.fetch(t, n);
}
function $e(e, t) {
	let r = `script[data-sveltekit-fetched][data-url=${JSON.stringify(e instanceof Request ? e.url : e)}]`;
	if (t?.headers || t?.body) {
		const a = [];
		(t.headers && a.push([...new Headers(t.headers)].join(',')),
			t.body && (typeof t.body == 'string' || ArrayBuffer.isView(t.body)) && a.push(t.body),
			(r += `[data-hash="${xt(...a)}"]`));
	}
	return r;
}
const $t = /^(\[)?(\.\.\.)?(\w+)(?:=(\w+))?(\])?$/;
function jt(e) {
	const t = [];
	return {
		pattern:
			e === '/'
				? /^\/$/
				: new RegExp(
						`^${Vt(e)
							.map((r) => {
								const a = /^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(r);
								if (a)
									return (
										t.push({ name: a[1], matcher: a[2], optional: !1, rest: !0, chained: !0 }),
										'(?:/(.*))?'
									);
								const s = /^\[\[(\w+)(?:=(\w+))?\]\]$/.exec(r);
								if (s)
									return (
										t.push({ name: s[1], matcher: s[2], optional: !0, rest: !1, chained: !0 }),
										'(?:/([^/]+))?'
									);
								if (!r) return;
								const i = r.split(/\[(.+?)\](?!\])/);
								return (
									'/' +
									i
										.map((c, l) => {
											if (l % 2) {
												if (c.startsWith('x+'))
													return Se(String.fromCharCode(parseInt(c.slice(2), 16)));
												if (c.startsWith('u+'))
													return Se(
														String.fromCharCode(
															...c
																.slice(2)
																.split('-')
																.map((y) => parseInt(y, 16))
														)
													);
												const d = $t.exec(c),
													[, h, u, f, p] = d;
												return (
													t.push({
														name: f,
														matcher: p,
														optional: !!h,
														rest: !!u,
														chained: u ? l === 1 && i[0] === '' : !1
													}),
													u ? '(.*?)' : h ? '([^/]*)?' : '([^/]+?)'
												);
											}
											return Se(c);
										})
										.join('')
								);
							})
							.join('')}/?$`
					),
		params: t
	};
}
function Dt(e) {
	return !/^\([^)]+\)$/.test(e);
}
function Vt(e) {
	return e.slice(1).split('/').filter(Dt);
}
function Bt(e, t, n) {
	const r = {},
		a = e.slice(1),
		s = a.filter((o) => o !== void 0);
	let i = 0;
	for (let o = 0; o < t.length; o += 1) {
		const c = t[o];
		let l = a[o - i];
		if (
			(c.chained &&
				c.rest &&
				i &&
				((l = a
					.slice(o - i, o + 1)
					.filter((d) => d)
					.join('/')),
				(i = 0)),
			l === void 0)
		) {
			c.rest && (r[c.name] = '');
			continue;
		}
		if (!c.matcher || n[c.matcher](l)) {
			r[c.name] = l;
			const d = t[o + 1],
				h = a[o + 1];
			(d && !d.rest && d.optional && h && c.chained && (i = 0),
				!d && !h && Object.keys(r).length === s.length && (i = 0));
			continue;
		}
		if (c.optional && c.chained) {
			i++;
			continue;
		}
		return;
	}
	if (!i) return r;
}
function Se(e) {
	return e
		.normalize()
		.replace(/[[\]]/g, '\\$&')
		.replace(/%/g, '%25')
		.replace(/\//g, '%2[Ff]')
		.replace(/\?/g, '%3[Ff]')
		.replace(/#/g, '%23')
		.replace(/[.*+?^${}()|\\]/g, '\\$&');
}
function Ft({ nodes: e, server_loads: t, dictionary: n, matchers: r }) {
	const a = new Set(t);
	return Object.entries(n).map(([o, [c, l, d]]) => {
		const { pattern: h, params: u } = jt(o),
			f = {
				id: o,
				exec: (p) => {
					const y = h.exec(p);
					if (y) return Bt(y, u, r);
				},
				errors: [1, ...(d || [])].map((p) => e[p]),
				layouts: [0, ...(l || [])].map(i),
				leaf: s(c)
			};
		return ((f.errors.length = f.layouts.length = Math.max(f.errors.length, f.layouts.length)), f);
	});
	function s(o) {
		const c = o < 0;
		return (c && (o = ~o), [c, e[o]]);
	}
	function i(o) {
		return o === void 0 ? o : [a.has(o), e[o]];
	}
}
function tt(e, t = JSON.parse) {
	try {
		return t(sessionStorage[e]);
	} catch {}
}
function He(e, t, n = JSON.stringify) {
	const r = n(t);
	try {
		sessionStorage[e] = r;
	} catch {}
}
const U = globalThis.__sveltekit_18b7hx5?.base ?? '',
	qt = globalThis.__sveltekit_18b7hx5?.assets ?? U,
	Mt = '1753220644956',
	nt = 'sveltekit:snapshot',
	rt = 'sveltekit:scroll',
	at = 'sveltekit:states',
	Gt = 'sveltekit:pageurl',
	F = 'sveltekit:history',
	J = 'sveltekit:navigation',
	j = { tap: 1, hover: 2, viewport: 3, eager: 4, off: -1, false: -1 },
	de = location.origin;
function ot(e) {
	if (e instanceof URL) return e;
	let t = document.baseURI;
	if (!t) {
		const n = document.getElementsByTagName('base');
		t = n.length ? n[0].href : document.URL;
	}
	return new URL(e, t);
}
function he() {
	return { x: pageXOffset, y: pageYOffset };
}
function B(e, t) {
	return e.getAttribute(`data-sveltekit-${t}`);
}
const ze = { ...j, '': j.hover };
function st(e) {
	let t = e.assignedSlot ?? e.parentNode;
	return (t?.nodeType === 11 && (t = t.host), t);
}
function it(e, t) {
	for (; e && e !== t; ) {
		if (e.nodeName.toUpperCase() === 'A' && e.hasAttribute('href')) return e;
		e = st(e);
	}
}
function Ie(e, t, n) {
	let r;
	try {
		if (
			((r = new URL(e instanceof SVGAElement ? e.href.baseVal : e.href, document.baseURI)),
			n && r.hash.match(/^#[^/]/))
		) {
			const o = location.hash.split('#')[1] || '/';
			r.hash = `#${o}${r.hash}`;
		}
	} catch {}
	const a = e instanceof SVGAElement ? e.target.baseVal : e.target,
		s = !r || !!a || pe(r, t, n) || (e.getAttribute('rel') || '').split(/\s+/).includes('external'),
		i = r?.origin === de && e.hasAttribute('download');
	return { url: r, external: s, target: a, download: i };
}
function ae(e) {
	let t = null,
		n = null,
		r = null,
		a = null,
		s = null,
		i = null,
		o = e;
	for (; o && o !== document.documentElement; )
		(r === null && (r = B(o, 'preload-code')),
			a === null && (a = B(o, 'preload-data')),
			t === null && (t = B(o, 'keepfocus')),
			n === null && (n = B(o, 'noscroll')),
			s === null && (s = B(o, 'reload')),
			i === null && (i = B(o, 'replacestate')),
			(o = st(o)));
	function c(l) {
		switch (l) {
			case '':
			case 'true':
				return !0;
			case 'off':
			case 'false':
				return !1;
			default:
				return;
		}
	}
	return {
		preload_code: ze[r ?? 'off'],
		preload_data: ze[a ?? 'off'],
		keepfocus: c(t),
		noscroll: c(n),
		reload: c(s),
		replace_state: c(i)
	};
}
function We(e) {
	const t = Oe(e);
	let n = !0;
	function r() {
		((n = !0), t.update((i) => i));
	}
	function a(i) {
		((n = !1), t.set(i));
	}
	function s(i) {
		let o;
		return t.subscribe((c) => {
			(o === void 0 || (n && c !== o)) && i((o = c));
		});
	}
	return { notify: r, set: a, subscribe: s };
}
const ct = { v: () => {} };
function Kt() {
	const { set: e, subscribe: t } = Oe(!1);
	let n;
	async function r() {
		clearTimeout(n);
		try {
			const a = await fetch(`${qt}/_app/version.json`, {
				headers: { pragma: 'no-cache', 'cache-control': 'no-cache' }
			});
			if (!a.ok) return !1;
			const i = (await a.json()).version !== Mt;
			return (i && (e(!0), ct.v(), clearTimeout(n)), i);
		} catch {
			return !1;
		}
	}
	return { subscribe: t, check: r };
}
function pe(e, t, n) {
	return e.origin !== de || !e.pathname.startsWith(t)
		? !0
		: n
			? !(
					e.pathname === t + '/' ||
					e.pathname === t + '/index.html' ||
					(e.protocol === 'file:' && e.pathname.replace(/\/[^/]+\.html?$/, '') === t)
				)
			: !1;
}
function En(e) {}
function Ye(e) {
	const t = zt(e),
		n = new ArrayBuffer(t.length),
		r = new DataView(n);
	for (let a = 0; a < n.byteLength; a++) r.setUint8(a, t.charCodeAt(a));
	return n;
}
const Ht = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function zt(e) {
	e.length % 4 === 0 && (e = e.replace(/==?$/, ''));
	let t = '',
		n = 0,
		r = 0;
	for (let a = 0; a < e.length; a++)
		((n <<= 6),
			(n |= Ht.indexOf(e[a])),
			(r += 6),
			r === 24 &&
				((t += String.fromCharCode((n & 16711680) >> 16)),
				(t += String.fromCharCode((n & 65280) >> 8)),
				(t += String.fromCharCode(n & 255)),
				(n = r = 0)));
	return (
		r === 12
			? ((n >>= 4), (t += String.fromCharCode(n)))
			: r === 18 &&
				((n >>= 2),
				(t += String.fromCharCode((n & 65280) >> 8)),
				(t += String.fromCharCode(n & 255))),
		t
	);
}
const Wt = -1,
	Yt = -2,
	Jt = -3,
	Xt = -4,
	Zt = -5,
	Qt = -6;
function Rn(e, t) {
	return lt(JSON.parse(e), t);
}
function lt(e, t) {
	if (typeof e == 'number') return a(e, !0);
	if (!Array.isArray(e) || e.length === 0) throw new Error('Invalid input');
	const n = e,
		r = Array(n.length);
	function a(s, i = !1) {
		if (s === Wt) return;
		if (s === Jt) return NaN;
		if (s === Xt) return 1 / 0;
		if (s === Zt) return -1 / 0;
		if (s === Qt) return -0;
		if (i) throw new Error('Invalid input');
		if (s in r) return r[s];
		const o = n[s];
		if (!o || typeof o != 'object') r[s] = o;
		else if (Array.isArray(o))
			if (typeof o[0] == 'string') {
				const c = o[0],
					l = t?.[c];
				if (l) return (r[s] = l(a(o[1])));
				switch (c) {
					case 'Date':
						r[s] = new Date(o[1]);
						break;
					case 'Set':
						const d = new Set();
						r[s] = d;
						for (let f = 1; f < o.length; f += 1) d.add(a(o[f]));
						break;
					case 'Map':
						const h = new Map();
						r[s] = h;
						for (let f = 1; f < o.length; f += 2) h.set(a(o[f]), a(o[f + 1]));
						break;
					case 'RegExp':
						r[s] = new RegExp(o[1], o[2]);
						break;
					case 'Object':
						r[s] = Object(o[1]);
						break;
					case 'BigInt':
						r[s] = BigInt(o[1]);
						break;
					case 'null':
						const u = Object.create(null);
						r[s] = u;
						for (let f = 1; f < o.length; f += 2) u[o[f]] = a(o[f + 1]);
						break;
					case 'Int8Array':
					case 'Uint8Array':
					case 'Uint8ClampedArray':
					case 'Int16Array':
					case 'Uint16Array':
					case 'Int32Array':
					case 'Uint32Array':
					case 'Float32Array':
					case 'Float64Array':
					case 'BigInt64Array':
					case 'BigUint64Array': {
						const f = globalThis[c],
							p = o[1],
							y = Ye(p),
							_ = new f(y);
						r[s] = _;
						break;
					}
					case 'ArrayBuffer': {
						const f = o[1],
							p = Ye(f);
						r[s] = p;
						break;
					}
					default:
						throw new Error(`Unknown type ${c}`);
				}
			} else {
				const c = new Array(o.length);
				r[s] = c;
				for (let l = 0; l < o.length; l += 1) {
					const d = o[l];
					d !== Yt && (c[l] = a(d));
				}
			}
		else {
			const c = {};
			r[s] = c;
			for (const l in o) {
				const d = o[l];
				c[l] = a(d);
			}
		}
		return r[s];
	}
	return a(0);
}
const ft = new Set(['load', 'prerender', 'csr', 'ssr', 'trailingSlash', 'config']);
[...ft];
const en = new Set([...ft]);
[...en];
function tn(e) {
	return e.filter((t) => t != null);
}
const nn = 'x-sveltekit-invalidated',
	rn = 'x-sveltekit-trailing-slash';
function oe(e) {
	return e instanceof ue || e instanceof Ne ? e.status : 500;
}
function an(e) {
	return e instanceof Ne ? e.text : 'Internal Error';
}
let b, X, ke;
const on = Ke.toString().includes('$$') || /function \w+\(\) \{\}/.test(Ke.toString());
on
	? ((b = {
			data: {},
			form: null,
			error: null,
			params: {},
			route: { id: null },
			state: {},
			status: -1,
			url: new URL('https://example.com')
		}),
		(X = { current: null }),
		(ke = { current: !1 }))
	: ((b = new (class {
			#e = T({});
			get data() {
				return x(this.#e);
			}
			set data(t) {
				P(this.#e, t);
			}
			#t = T(null);
			get form() {
				return x(this.#t);
			}
			set form(t) {
				P(this.#t, t);
			}
			#n = T(null);
			get error() {
				return x(this.#n);
			}
			set error(t) {
				P(this.#n, t);
			}
			#r = T({});
			get params() {
				return x(this.#r);
			}
			set params(t) {
				P(this.#r, t);
			}
			#a = T({ id: null });
			get route() {
				return x(this.#a);
			}
			set route(t) {
				P(this.#a, t);
			}
			#o = T({});
			get state() {
				return x(this.#o);
			}
			set state(t) {
				P(this.#o, t);
			}
			#s = T(-1);
			get status() {
				return x(this.#s);
			}
			set status(t) {
				P(this.#s, t);
			}
			#i = T(new URL('https://example.com'));
			get url() {
				return x(this.#i);
			}
			set url(t) {
				P(this.#i, t);
			}
		})()),
		(X = new (class {
			#e = T(null);
			get current() {
				return x(this.#e);
			}
			set current(t) {
				P(this.#e, t);
			}
		})()),
		(ke = new (class {
			#e = T(!1);
			get current() {
				return x(this.#e);
			}
			set current(t) {
				P(this.#e, t);
			}
		})()),
		(ct.v = () => (ke.current = !0)));
function je(e) {
	Object.assign(b, e);
}
const sn = '/__data.json',
	cn = '.html__data.json';
function ln(e) {
	return e.endsWith('.html') ? e.replace(/\.html$/, cn) : e.replace(/\/$/, '') + sn;
}
const { tick: Ue } = Et,
	fn = new Set(['icon', 'shortcut icon', 'apple-touch-icon']),
	D = tt(rt) ?? {},
	Z = tt(nt) ?? {},
	$ = { url: We({}), page: We({}), navigating: Oe(null), updated: Kt() };
function De(e) {
	D[e] = he();
}
function un(e, t) {
	let n = e + 1;
	for (; D[n]; ) (delete D[n], (n += 1));
	for (n = t + 1; Z[n]; ) (delete Z[n], (n += 1));
}
function G(e) {
	return ((location.href = e.href), new Promise(() => {}));
}
async function ut() {
	if ('serviceWorker' in navigator) {
		const e = await navigator.serviceWorker.getRegistration(U || '/');
		e && (await e.update());
	}
}
function Je() {}
let Ve, Le, se, O, Te, v;
const ie = [],
	ce = [];
let N = null;
const re = new Map(),
	dt = new Set(),
	dn = new Set(),
	z = new Set();
let m = { branch: [], error: null, url: null },
	Be = !1,
	le = !1,
	Xe = !0,
	Q = !1,
	K = !1,
	ht = !1,
	ge = !1,
	q,
	S,
	I,
	C;
const W = new Set();
let Ee;
async function Tn(e, t, n) {
	(document.URL !== location.href && (location.href = location.href),
		(v = e),
		await e.hooks.init?.(),
		(Ve = Ft(e)),
		(O = document.documentElement),
		(Te = t),
		(Le = e.nodes[0]),
		(se = e.nodes[1]),
		Le(),
		se(),
		(S = history.state?.[F]),
		(I = history.state?.[J]),
		S || ((S = I = Date.now()), history.replaceState({ ...history.state, [F]: S, [J]: I }, '')));
	const r = D[S];
	function a() {
		r && ((history.scrollRestoration = 'manual'), scrollTo(r.x, r.y));
	}
	(n
		? (a(), await bn(Te, n))
		: (await Y({
				type: 'enter',
				url: ot(v.hash ? An(new URL(location.href)) : location.href),
				replace_state: !0
			}),
			a()),
		vn());
}
async function hn() {
	if ((await (Ee ||= Promise.resolve()), !Ee)) return;
	Ee = null;
	const e = (C = {}),
		t = await te(m.url, !0);
	N = null;
	const n = t && (await Me(t));
	if (!(!n || e !== C)) {
		if (n.type === 'redirect') return _e(new URL(n.location, m.url).href, {}, 1, e);
		(n.props.page && Object.assign(b, n.props.page),
			(m = n.state),
			pt(),
			q.$set(n.props),
			je(n.props.page));
	}
}
function pt() {
	((ie.length = 0), (ge = !1));
}
function gt(e) {
	ce.some((t) => t?.snapshot) && (Z[e] = ce.map((t) => t?.snapshot?.capture()));
}
function _t(e) {
	Z[e]?.forEach((t, n) => {
		ce[n]?.snapshot?.restore(t);
	});
}
function Ze() {
	(De(S), He(rt, D), gt(I), He(nt, Z));
}
async function _e(e, t, n, r) {
	return Y({
		type: 'goto',
		url: ot(e),
		keepfocus: t.keepFocus,
		noscroll: t.noScroll,
		replace_state: t.replaceState,
		state: t.state,
		redirect_count: n,
		nav_token: r,
		accept: () => {
			(t.invalidateAll && (ge = !0), t.invalidate && t.invalidate.forEach(wn));
		}
	});
}
async function pn(e) {
	if (e.id !== N?.id) {
		const t = {};
		(W.add(t),
			(N = {
				id: e.id,
				token: t,
				promise: Me({ ...e, preload: t }).then(
					(n) => (W.delete(t), n.type === 'loaded' && n.state.error && (N = null), n)
				)
			}));
	}
	return N.promise;
}
async function Re(e) {
	const t = (await te(e, !1))?.route;
	t && (await Promise.all([...t.layouts, t.leaf].map((n) => n?.[1]())));
}
function mt(e, t, n) {
	m = e.state;
	const r = document.querySelector('style[data-sveltekit]');
	if (
		(r && r.remove(),
		Object.assign(b, e.props.page),
		(q = new v.root({
			target: t,
			props: { ...e.props, stores: $, components: ce },
			hydrate: n,
			sync: !1
		})),
		_t(I),
		n)
	) {
		const a = {
			from: null,
			to: { params: m.params, route: { id: m.route?.id ?? null }, url: new URL(location.href) },
			willUnload: !1,
			type: 'enter',
			complete: Promise.resolve()
		};
		z.forEach((s) => s(a));
	}
	le = !0;
}
function ee({ url: e, params: t, branch: n, status: r, error: a, route: s, form: i }) {
	let o = 'never';
	if (U && (e.pathname === U || e.pathname === U + '/')) o = 'always';
	else for (const f of n) f?.slash !== void 0 && (o = f.slash);
	((e.pathname = It(e.pathname, o)), (e.search = e.search));
	const c = {
		type: 'loaded',
		state: { url: e, params: t, branch: n, error: a, route: s },
		props: { constructors: tn(n).map((f) => f.node.component), page: ye(b) }
	};
	i !== void 0 && (c.props.form = i);
	let l = {},
		d = !b,
		h = 0;
	for (let f = 0; f < Math.max(n.length, m.branch.length); f += 1) {
		const p = n[f],
			y = m.branch[f];
		(p?.data !== y?.data && (d = !0),
			p && ((l = { ...l, ...p.data }), d && (c.props[`data_${h}`] = l), (h += 1)));
	}
	return (
		(!m.url || e.href !== m.url.href || m.error !== a || (i !== void 0 && i !== b.form) || d) &&
			(c.props.page = {
				error: a,
				params: t,
				route: { id: s?.id ?? null },
				state: {},
				status: r,
				url: new URL(e),
				form: i ?? null,
				data: d ? l : b.data
			}),
		c
	);
}
async function Fe({ loader: e, parent: t, url: n, params: r, route: a, server_data_node: s }) {
	let i = null,
		o = !0;
	const c = {
			dependencies: new Set(),
			params: new Set(),
			parent: !1,
			route: !1,
			url: !1,
			search_params: new Set()
		},
		l = await e();
	if (l.universal?.load) {
		let d = function (...u) {
			for (const f of u) {
				const { href: p } = new URL(f, n);
				c.dependencies.add(p);
			}
		};
		const h = {
			route: new Proxy(a, { get: (u, f) => (o && (c.route = !0), u[f]) }),
			params: new Proxy(r, { get: (u, f) => (o && c.params.add(f), u[f]) }),
			data: s?.data ?? null,
			url: Tt(
				n,
				() => {
					o && (c.url = !0);
				},
				(u) => {
					o && c.search_params.add(u);
				},
				v.hash
			),
			async fetch(u, f) {
				u instanceof Request &&
					(f = {
						body: u.method === 'GET' || u.method === 'HEAD' ? void 0 : await u.blob(),
						cache: u.cache,
						credentials: u.credentials,
						headers: [...u.headers].length > 0 ? u?.headers : void 0,
						integrity: u.integrity,
						keepalive: u.keepalive,
						method: u.method,
						mode: u.mode,
						redirect: u.redirect,
						referrer: u.referrer,
						referrerPolicy: u.referrerPolicy,
						signal: u.signal,
						...f
					});
				const { resolved: p, promise: y } = yt(u, f, n);
				return (o && d(p.href), y);
			},
			setHeaders: () => {},
			depends: d,
			parent() {
				return (o && (c.parent = !0), t());
			},
			untrack(u) {
				o = !1;
				try {
					return u();
				} finally {
					o = !0;
				}
			}
		};
		i = (await l.universal.load.call(null, h)) ?? null;
	}
	return {
		node: l,
		loader: e,
		server: s,
		universal: l.universal?.load ? { type: 'data', data: i, uses: c } : null,
		data: i ?? s?.data ?? null,
		slash: l.universal?.trailingSlash ?? s?.slash
	};
}
function yt(e, t, n) {
	let r = e instanceof Request ? e.url : e;
	const a = new URL(r, n);
	a.origin === n.origin && (r = a.href.slice(n.origin.length));
	const s = le ? Nt(r, a.href, t) : Ct(r, t);
	return { resolved: a, promise: s };
}
function Qe(e, t, n, r, a, s) {
	if (ge) return !0;
	if (!a) return !1;
	if ((a.parent && e) || (a.route && t) || (a.url && n)) return !0;
	for (const i of a.search_params) if (r.has(i)) return !0;
	for (const i of a.params) if (s[i] !== m.params[i]) return !0;
	for (const i of a.dependencies) if (ie.some((o) => o(new URL(i)))) return !0;
	return !1;
}
function qe(e, t) {
	return e?.type === 'data' ? e : e?.type === 'skip' ? (t ?? null) : null;
}
function gn(e, t) {
	if (!e) return new Set(t.searchParams.keys());
	const n = new Set([...e.searchParams.keys(), ...t.searchParams.keys()]);
	for (const r of n) {
		const a = e.searchParams.getAll(r),
			s = t.searchParams.getAll(r);
		a.every((i) => s.includes(i)) && s.every((i) => a.includes(i)) && n.delete(r);
	}
	return n;
}
function et({ error: e, url: t, route: n, params: r }) {
	return {
		type: 'loaded',
		state: { error: e, url: t, route: n, params: r, branch: [] },
		props: { page: ye(b), constructors: [] }
	};
}
async function Me({ id: e, invalidating: t, url: n, params: r, route: a, preload: s }) {
	if (N?.id === e) return (W.delete(N.token), N.promise);
	const { errors: i, layouts: o, leaf: c } = a,
		l = [...o, c];
	(i.forEach((g) => g?.().catch(() => {})), l.forEach((g) => g?.[1]().catch(() => {})));
	let d = null;
	const h = m.url ? e !== fe(m.url) : !1,
		u = m.route ? a.id !== m.route.id : !1,
		f = gn(m.url, n);
	let p = !1;
	const y = l.map((g, w) => {
		const A = m.branch[w],
			k = !!g?.[0] && (A?.loader !== g[1] || Qe(p, u, h, f, A.server?.uses, r));
		return (k && (p = !0), k);
	});
	if (y.some(Boolean)) {
		try {
			d = await At(n, y);
		} catch (g) {
			const w = await M(g, { url: n, params: r, route: { id: e } });
			return W.has(s)
				? et({ error: w, url: n, params: r, route: a })
				: me({ status: oe(g), error: w, url: n, route: a });
		}
		if (d.type === 'redirect') return d;
	}
	const _ = d?.nodes;
	let R = !1;
	const E = l.map(async (g, w) => {
		if (!g) return;
		const A = m.branch[w],
			k = _?.[w];
		if ((!k || k.type === 'skip') && g[1] === A?.loader && !Qe(R, u, h, f, A.universal?.uses, r))
			return A;
		if (((R = !0), k?.type === 'error')) throw k;
		return Fe({
			loader: g[1],
			url: n,
			params: r,
			route: a,
			parent: async () => {
				const we = {};
				for (let ve = 0; ve < w; ve += 1) Object.assign(we, (await E[ve])?.data);
				return we;
			},
			server_data_node: qe(
				k === void 0 && g[0] ? { type: 'skip' } : (k ?? null),
				g[0] ? A?.server : void 0
			)
		});
	});
	for (const g of E) g.catch(() => {});
	const L = [];
	for (let g = 0; g < l.length; g += 1)
		if (l[g])
			try {
				L.push(await E[g]);
			} catch (w) {
				if (w instanceof Ce) return { type: 'redirect', location: w.location };
				if (W.has(s))
					return et({
						error: await M(w, { params: r, url: n, route: { id: a.id } }),
						url: n,
						params: r,
						route: a
					});
				let A = oe(w),
					k;
				if (_?.includes(w)) ((A = w.status ?? A), (k = w.error));
				else if (w instanceof ue) k = w.body;
				else {
					if (await $.updated.check()) return (await ut(), await G(n));
					k = await M(w, { params: r, url: n, route: { id: a.id } });
				}
				const ne = await wt(g, L, i);
				return ne
					? ee({
							url: n,
							params: r,
							branch: L.slice(0, ne.idx).concat(ne.node),
							status: A,
							error: k,
							route: a
						})
					: await bt(n, { id: a.id }, k, A);
			}
		else L.push(void 0);
	return ee({
		url: n,
		params: r,
		branch: L,
		status: 200,
		error: null,
		route: a,
		form: t ? void 0 : null
	});
}
async function wt(e, t, n) {
	for (; e--; )
		if (n[e]) {
			let r = e;
			for (; !t[r]; ) r -= 1;
			try {
				return {
					idx: r + 1,
					node: { node: await n[e](), loader: n[e], data: {}, server: null, universal: null }
				};
			} catch {
				continue;
			}
		}
}
async function me({ status: e, error: t, url: n, route: r }) {
	const a = {};
	let s = null;
	if (v.server_loads[0] === 0)
		try {
			const o = await At(n, [!0]);
			if (o.type !== 'data' || (o.nodes[0] && o.nodes[0].type !== 'data')) throw 0;
			s = o.nodes[0] ?? null;
		} catch {
			(n.origin !== de || n.pathname !== location.pathname || Be) && (await G(n));
		}
	try {
		const o = await Fe({
				loader: Le,
				url: n,
				params: a,
				route: r,
				parent: () => Promise.resolve({}),
				server_data_node: qe(s)
			}),
			c = { node: await se(), loader: se, universal: null, server: null, data: null };
		return ee({ url: n, params: a, branch: [o, c], status: e, error: t, route: null });
	} catch (o) {
		if (o instanceof Ce) return _e(new URL(o.location, location.href), {}, 0);
		throw o;
	}
}
async function _n(e) {
	const t = e.href;
	if (re.has(t)) return re.get(t);
	let n;
	try {
		const r = (async () => {
			let a =
				(await v.hooks.reroute({ url: new URL(e), fetch: async (s, i) => yt(s, i, e).promise })) ??
				e;
			if (typeof a == 'string') {
				const s = new URL(e);
				(v.hash ? (s.hash = a) : (s.pathname = a), (a = s));
			}
			return a;
		})();
		(re.set(t, r), (n = await r));
	} catch {
		re.delete(t);
		return;
	}
	return n;
}
async function te(e, t) {
	if (e && !pe(e, U, v.hash)) {
		const n = await _n(e);
		if (!n) return;
		const r = mn(n);
		for (const a of Ve) {
			const s = a.exec(r);
			if (s) return { id: fe(e), invalidating: t, route: a, params: Lt(s), url: e };
		}
	}
}
function mn(e) {
	return (
		Ut(v.hash ? e.hash.replace(/^#/, '').replace(/[?#].+/, '') : e.pathname.slice(U.length)) || '/'
	);
}
function fe(e) {
	return (v.hash ? e.hash.replace(/^#/, '') : e.pathname) + e.search;
}
function vt({ url: e, type: t, intent: n, delta: r }) {
	let a = !1;
	const s = Ge(m, n, e, t);
	r !== void 0 && (s.navigation.delta = r);
	const i = {
		...s.navigation,
		cancel: () => {
			((a = !0), s.reject(new Error('navigation cancelled')));
		}
	};
	return (Q || dt.forEach((o) => o(i)), a ? null : s);
}
async function Y({
	type: e,
	url: t,
	popped: n,
	keepfocus: r,
	noscroll: a,
	replace_state: s,
	state: i = {},
	redirect_count: o = 0,
	nav_token: c = {},
	accept: l = Je,
	block: d = Je
}) {
	const h = C;
	C = c;
	const u = await te(t, !1),
		f = e === 'enter' ? Ge(m, u, t, e) : vt({ url: t, type: e, delta: n?.delta, intent: u });
	if (!f) {
		(d(), C === c && (C = h));
		return;
	}
	const p = S,
		y = I;
	(l(),
		(Q = !0),
		le && f.navigation.type !== 'enter' && $.navigating.set((X.current = f.navigation)));
	let _ = u && (await Me(u));
	if (!_) {
		if (pe(t, U, v.hash)) return await G(t);
		_ = await bt(
			t,
			{ id: null },
			await M(new Ne(404, 'Not Found', `Not found: ${t.pathname}`), {
				url: t,
				params: {},
				route: { id: null }
			}),
			404
		);
	}
	if (((t = u?.url || t), C !== c)) return (f.reject(new Error('navigation aborted')), !1);
	if (_.type === 'redirect')
		if (o >= 20)
			_ = await me({
				status: 500,
				error: await M(new Error('Redirect loop'), { url: t, params: {}, route: { id: null } }),
				url: t,
				route: { id: null }
			});
		else return (await _e(new URL(_.location, t).href, {}, o + 1, c), !1);
	else _.props.page.status >= 400 && (await $.updated.check()) && (await ut(), await G(t));
	if (
		(pt(),
		De(p),
		gt(y),
		_.props.page.url.pathname !== t.pathname && (t.pathname = _.props.page.url.pathname),
		(i = n ? n.state : i),
		!n)
	) {
		const g = s ? 0 : 1,
			w = { [F]: (S += g), [J]: (I += g), [at]: i };
		((s ? history.replaceState : history.pushState).call(history, w, '', t), s || un(S, I));
	}
	if (((N = null), (_.props.page.state = i), le)) {
		((m = _.state), _.props.page && (_.props.page.url = t));
		const g = (await Promise.all(Array.from(dn, (w) => w(f.navigation)))).filter(
			(w) => typeof w == 'function'
		);
		if (g.length > 0) {
			let w = function () {
				g.forEach((A) => {
					z.delete(A);
				});
			};
			(g.push(w),
				g.forEach((A) => {
					z.add(A);
				}));
		}
		(q.$set(_.props), je(_.props.page), (ht = !0));
	} else mt(_, Te, !1);
	const { activeElement: R } = document;
	await Ue();
	const E = n ? n.scroll : a ? he() : null;
	if (Xe) {
		const g = t.hash && document.getElementById(kt(t));
		E ? scrollTo(E.x, E.y) : g ? g.scrollIntoView() : scrollTo(0, 0);
	}
	const L = document.activeElement !== R && document.activeElement !== document.body;
	(!r && !L && Pe(t),
		(Xe = !0),
		_.props.page && Object.assign(b, _.props.page),
		(Q = !1),
		e === 'popstate' && _t(I),
		f.fulfil(void 0),
		z.forEach((g) => g(f.navigation)),
		$.navigating.set((X.current = null)));
}
async function bt(e, t, n, r) {
	return e.origin === de && e.pathname === location.pathname && !Be
		? await me({ status: r, error: n, url: e, route: t })
		: await G(e);
}
function yn() {
	let e, t, n;
	O.addEventListener('mousemove', (o) => {
		const c = o.target;
		(clearTimeout(e),
			(e = setTimeout(() => {
				s(c, j.hover);
			}, 20)));
	});
	function r(o) {
		o.defaultPrevented || s(o.composedPath()[0], j.tap);
	}
	(O.addEventListener('mousedown', r), O.addEventListener('touchstart', r, { passive: !0 }));
	const a = new IntersectionObserver(
		(o) => {
			for (const c of o) c.isIntersecting && (Re(new URL(c.target.href)), a.unobserve(c.target));
		},
		{ threshold: 0 }
	);
	async function s(o, c) {
		const l = it(o, O),
			d = l === t && c >= n;
		if (!l || d) return;
		const { url: h, external: u, download: f } = Ie(l, U, v.hash);
		if (u || f) return;
		const p = ae(l),
			y = h && fe(m.url) === fe(h);
		if (!(p.reload || y))
			if (c <= p.preload_data) {
				((t = l), (n = j.tap));
				const _ = await te(h, !1);
				if (!_) return;
				pn(_);
			} else c <= p.preload_code && ((t = l), (n = c), Re(h));
	}
	function i() {
		a.disconnect();
		for (const o of O.querySelectorAll('a')) {
			const { url: c, external: l, download: d } = Ie(o, U, v.hash);
			if (l || d) continue;
			const h = ae(o);
			h.reload ||
				(h.preload_code === j.viewport && a.observe(o), h.preload_code === j.eager && Re(c));
		}
	}
	(z.add(i), i());
}
function M(e, t) {
	if (e instanceof ue) return e.body;
	const n = oe(e),
		r = an(e);
	return v.hooks.handleError({ error: e, event: t, status: n, message: r }) ?? { message: r };
}
function wn(e) {
	if (typeof e == 'function') ie.push(e);
	else {
		const { href: t } = new URL(e, location.href);
		ie.push((n) => n.href === t);
	}
}
function xn() {
	return ((ge = !0), hn());
}
async function Pn(e) {
	if (e.type === 'error') {
		const t = new URL(location.href),
			{ branch: n, route: r } = m;
		if (!r) return;
		const a = await wt(m.branch.length, n, r.errors);
		if (a) {
			const s = ee({
				url: t,
				params: m.params,
				branch: n.slice(0, a.idx).concat(a.node),
				status: e.status ?? 500,
				error: e.error,
				route: r
			});
			((m = s.state), q.$set(s.props), je(s.props.page), Ue().then(() => Pe(m.url)));
		}
	} else
		e.type === 'redirect'
			? await _e(e.location, { invalidateAll: !0 }, 0)
			: ((b.form = e.data),
				(b.status = e.status),
				q.$set({ form: null, page: ye(b) }),
				await Ue(),
				q.$set({ form: e.data }),
				e.type === 'success' && Pe(b.url));
}
function vn() {
	((history.scrollRestoration = 'manual'),
		addEventListener('beforeunload', (t) => {
			let n = !1;
			if ((Ze(), !Q)) {
				const r = Ge(m, void 0, null, 'leave'),
					a = {
						...r.navigation,
						cancel: () => {
							((n = !0), r.reject(new Error('navigation cancelled')));
						}
					};
				dt.forEach((s) => s(a));
			}
			n ? (t.preventDefault(), (t.returnValue = '')) : (history.scrollRestoration = 'auto');
		}),
		addEventListener('visibilitychange', () => {
			document.visibilityState === 'hidden' && Ze();
		}),
		navigator.connection?.saveData || yn(),
		O.addEventListener('click', async (t) => {
			if (
				t.button ||
				t.which !== 1 ||
				t.metaKey ||
				t.ctrlKey ||
				t.shiftKey ||
				t.altKey ||
				t.defaultPrevented
			)
				return;
			const n = it(t.composedPath()[0], O);
			if (!n) return;
			const { url: r, external: a, target: s, download: i } = Ie(n, U, v.hash);
			if (!r) return;
			if (s === '_parent' || s === '_top') {
				if (window.parent !== window) return;
			} else if (s && s !== '_self') return;
			const o = ae(n);
			if (
				(!(n instanceof SVGAElement) &&
					r.protocol !== location.protocol &&
					!(r.protocol === 'https:' || r.protocol === 'http:')) ||
				i
			)
				return;
			const [l, d] = (v.hash ? r.hash.replace(/^#/, '') : r.href).split('#'),
				h = l === Ae(location);
			if (a || (o.reload && (!h || !d))) {
				vt({ url: r, type: 'link' }) ? (Q = !0) : t.preventDefault();
				return;
			}
			if (d !== void 0 && h) {
				const [, u] = m.url.href.split('#');
				if (u === d) {
					if (
						(t.preventDefault(),
						d === '' || (d === 'top' && n.ownerDocument.getElementById('top') === null))
					)
						window.scrollTo({ top: 0 });
					else {
						const f = n.ownerDocument.getElementById(decodeURIComponent(d));
						f && (f.scrollIntoView(), f.focus());
					}
					return;
				}
				if (((K = !0), De(S), e(r), !o.replace_state)) return;
				K = !1;
			}
			(t.preventDefault(),
				await new Promise((u) => {
					(requestAnimationFrame(() => {
						setTimeout(u, 0);
					}),
						setTimeout(u, 100));
				}),
				await Y({
					type: 'link',
					url: r,
					keepfocus: o.keepfocus,
					noscroll: o.noscroll,
					replace_state: o.replace_state ?? r.href === location.href
				}));
		}),
		O.addEventListener('submit', (t) => {
			if (t.defaultPrevented) return;
			const n = HTMLFormElement.prototype.cloneNode.call(t.target),
				r = t.submitter;
			if ((r?.formTarget || n.target) === '_blank' || (r?.formMethod || n.method) !== 'get') return;
			const i = new URL((r?.hasAttribute('formaction') && r?.formAction) || n.action);
			if (pe(i, U, !1)) return;
			const o = t.target,
				c = ae(o);
			if (c.reload) return;
			(t.preventDefault(), t.stopPropagation());
			const l = new FormData(o),
				d = r?.getAttribute('name');
			(d && l.append(d, r?.getAttribute('value') ?? ''),
				(i.search = new URLSearchParams(l).toString()),
				Y({
					type: 'form',
					url: i,
					keepfocus: c.keepfocus,
					noscroll: c.noscroll,
					replace_state: c.replace_state ?? i.href === location.href
				}));
		}),
		addEventListener('popstate', async (t) => {
			if (!xe) {
				if (t.state?.[F]) {
					const n = t.state[F];
					if (((C = {}), n === S)) return;
					const r = D[n],
						a = t.state[at] ?? {},
						s = new URL(t.state[Gt] ?? location.href),
						i = t.state[J],
						o = m.url ? Ae(location) === Ae(m.url) : !1;
					if (i === I && (ht || o)) {
						(a !== b.state && (b.state = a), e(s), (D[S] = he()), r && scrollTo(r.x, r.y), (S = n));
						return;
					}
					const l = n - S;
					await Y({
						type: 'popstate',
						url: s,
						popped: { state: a, scroll: r, delta: l },
						accept: () => {
							((S = n), (I = i));
						},
						block: () => {
							history.go(-l);
						},
						nav_token: C
					});
				} else if (!K) {
					const n = new URL(location.href);
					(e(n), v.hash && location.reload());
				}
			}
		}),
		addEventListener('hashchange', () => {
			K &&
				((K = !1), history.replaceState({ ...history.state, [F]: ++S, [J]: I }, '', location.href));
		}));
	for (const t of document.querySelectorAll('link')) fn.has(t.rel) && (t.href = t.href);
	addEventListener('pageshow', (t) => {
		t.persisted && $.navigating.set((X.current = null));
	});
	function e(t) {
		((m.url = b.url = t), $.page.set(ye(b)), $.page.notify());
	}
}
async function bn(
	e,
	{ status: t = 200, error: n, node_ids: r, params: a, route: s, server_route: i, data: o, form: c }
) {
	Be = !0;
	const l = new URL(location.href);
	let d;
	(({ params: a = {}, route: s = { id: null } } = (await te(l, !1)) || {}),
		(d = Ve.find(({ id: f }) => f === s.id)));
	let h,
		u = !0;
	try {
		const f = r.map(async (y, _) => {
				const R = o[_];
				return (
					R?.uses && (R.uses = St(R.uses)),
					Fe({
						loader: v.nodes[y],
						url: l,
						params: a,
						route: s,
						parent: async () => {
							const E = {};
							for (let L = 0; L < _; L += 1) Object.assign(E, (await f[L]).data);
							return E;
						},
						server_data_node: qe(R)
					})
				);
			}),
			p = await Promise.all(f);
		if (d) {
			const y = d.layouts;
			for (let _ = 0; _ < y.length; _++) y[_] || p.splice(_, 0, void 0);
		}
		h = ee({ url: l, params: a, branch: p, status: t, error: n, form: c, route: d ?? null });
	} catch (f) {
		if (f instanceof Ce) {
			await G(new URL(f.location, location.href));
			return;
		}
		((h = await me({
			status: oe(f),
			error: await M(f, { url: l, params: a, route: s }),
			url: l,
			route: s
		})),
			(e.textContent = ''),
			(u = !1));
	}
	(h.props.page && (h.props.page.state = {}), mt(h, e, u));
}
async function At(e, t) {
	const n = new URL(e);
	((n.pathname = ln(e.pathname)),
		e.pathname.endsWith('/') && n.searchParams.append(rn, '1'),
		n.searchParams.append(nn, t.map((s) => (s ? '1' : '0')).join('')));
	const r = window.fetch,
		a = await r(n.href, {});
	if (!a.ok) {
		let s;
		throw (
			a.headers.get('content-type')?.includes('application/json')
				? (s = await a.json())
				: a.status === 404
					? (s = 'Not Found')
					: a.status === 500 && (s = 'Internal Error'),
			new ue(a.status, s)
		);
	}
	return new Promise(async (s) => {
		const i = new Map(),
			o = a.body.getReader(),
			c = new TextDecoder();
		function l(h) {
			return lt(h, {
				...v.decoders,
				Promise: (u) =>
					new Promise((f, p) => {
						i.set(u, { fulfil: f, reject: p });
					})
			});
		}
		let d = '';
		for (;;) {
			const { done: h, value: u } = await o.read();
			if (h && !d) break;
			for (
				d +=
					!u && d
						? `
`
						: c.decode(u, { stream: !0 });
				;

			) {
				const f = d.indexOf(`
`);
				if (f === -1) break;
				const p = JSON.parse(d.slice(0, f));
				if (((d = d.slice(f + 1)), p.type === 'redirect')) return s(p);
				if (p.type === 'data')
					(p.nodes?.forEach((y) => {
						y?.type === 'data' && ((y.uses = St(y.uses)), (y.data = l(y.data)));
					}),
						s(p));
				else if (p.type === 'chunk') {
					const { id: y, data: _, error: R } = p,
						E = i.get(y);
					(i.delete(y), R ? E.reject(l(R)) : E.fulfil(l(_)));
				}
			}
		}
	});
}
function St(e) {
	return {
		dependencies: new Set(e?.dependencies ?? []),
		params: new Set(e?.params ?? []),
		parent: !!e?.parent,
		route: !!e?.route,
		url: !!e?.url,
		search_params: new Set(e?.search_params ?? [])
	};
}
let xe = !1;
function Pe(e) {
	const t = document.querySelector('[autofocus]');
	if (t) t.focus();
	else {
		const n = kt(e);
		if (n && document.getElementById(n)) {
			const { x: a, y: s } = he();
			setTimeout(() => {
				const i = history.state;
				((xe = !0),
					location.replace(`#${n}`),
					v.hash && location.replace(e.hash),
					history.replaceState(i, '', e.hash),
					scrollTo(a, s),
					(xe = !1));
			});
		} else {
			const a = document.body,
				s = a.getAttribute('tabindex');
			((a.tabIndex = -1),
				a.focus({ preventScroll: !0, focusVisible: !1 }),
				s !== null ? a.setAttribute('tabindex', s) : a.removeAttribute('tabindex'));
		}
		const r = getSelection();
		if (r && r.type !== 'None') {
			const a = [];
			for (let s = 0; s < r.rangeCount; s += 1) a.push(r.getRangeAt(s));
			setTimeout(() => {
				if (r.rangeCount === a.length) {
					for (let s = 0; s < r.rangeCount; s += 1) {
						const i = a[s],
							o = r.getRangeAt(s);
						if (
							i.commonAncestorContainer !== o.commonAncestorContainer ||
							i.startContainer !== o.startContainer ||
							i.endContainer !== o.endContainer ||
							i.startOffset !== o.startOffset ||
							i.endOffset !== o.endOffset
						)
							return;
					}
					r.removeAllRanges();
				}
			});
		}
	}
}
function Ge(e, t, n, r) {
	let a, s;
	const i = new Promise((c, l) => {
		((a = c), (s = l));
	});
	return (
		i.catch(() => {}),
		{
			navigation: {
				from: { params: e.params, route: { id: e.route?.id ?? null }, url: e.url },
				to: n && { params: t?.params ?? null, route: { id: t?.route?.id ?? null }, url: n },
				willUnload: !t,
				type: r,
				complete: i
			},
			fulfil: a,
			reject: s
		}
	);
}
function ye(e) {
	return {
		data: e.data,
		error: e.error,
		form: e.form,
		params: e.params,
		route: e.route,
		state: e.state,
		status: e.status,
		url: e.url
	};
}
function An(e) {
	const t = new URL(e);
	return ((t.hash = decodeURIComponent(e.hash)), t);
}
function kt(e) {
	let t;
	if (v.hash) {
		const [, , n] = e.hash.split('#', 3);
		t = n ?? '';
	} else t = e.hash.slice(1);
	return decodeURIComponent(t);
}
export { Pn as a, Rn as b, v as c, Tn as d, xn as i, En as l, b as p, $ as s };
