export const index = 1;
let component_cache;
export const component = async () =>
	(component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default);
export const imports = [
	'_app/immutable/nodes/1.Bjna-6c7.js',
	'_app/immutable/chunks/NZTpNUN0.js',
	'_app/immutable/chunks/oNtRZf3p.js',
	'_app/immutable/chunks/BLzYw7u3.js',
	'_app/immutable/chunks/aPSXSzo0.js'
];
export const stylesheets = [];
export const fonts = [];
