import { proxyToBackend } from '$lib/server/backend';
import type { RequestHandler } from './$types';

// Same-origin proxy so the browser only ever talks to this SvelteKit server -
// it never learns viz-rs's address or its API key. Forwards the multipart body
// (image + params) through unchanged, boundary and all.
export const POST: RequestHandler = async ({ request }) => {
	return proxyToBackend('/search/images', {
		method: 'POST',
		headers: { 'Content-Type': request.headers.get('Content-Type') ?? '' },
		body: await request.arrayBuffer()
	});
};
