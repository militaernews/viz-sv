import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.DU9W4p8l.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/oNtRZf3p.js","_app/immutable/chunks/BLzYw7u3.js","_app/immutable/chunks/BC2Jm6Wp.js","_app/immutable/chunks/aPSXSzo0.js"];
export const stylesheets = [];
export const fonts = [];
