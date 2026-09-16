import { proxyToBackend } from '$lib/server/backend';
import type { RequestHandler } from './$types';

// Same-origin proxy so the browser only ever talks to this SvelteKit server -
// it never learns viz-rs's address or its API key.
export const POST: RequestHandler = async ({ request }) => {
	return proxyToBackend('/search/tags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: await request.text()
	});
};
