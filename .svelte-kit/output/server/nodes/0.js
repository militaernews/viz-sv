

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DFARuqgN.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/oNtRZf3p.js"];
export const stylesheets = ["_app/immutable/assets/0.CWqbs5Lc.css"];
export const fonts = [];
