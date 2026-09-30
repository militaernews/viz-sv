import { proxyToBackend } from '$lib/server/backend';
import type { RequestHandler } from './$types';

// Same-origin proxy for POST /api/search/{image,text}, so the browser only
// ever talks to this SvelteKit server - it never learns viz-rs's address or its
// API key. Bodies (multipart field "file", or JSON {"q"}) pass through unchanged.
export const POST: RequestHandler = async ({ request, params, getClientAddress }) => {
	const contentType =
		params.kind === 'text' ? 'application/json' : (request.headers.get('Content-Type') ?? '');

	return proxyToBackend(
		`/api/search/${params.kind}`,
		{
			method: 'POST',
			headers: { 'Content-Type': contentType },
			body: await request.arrayBuffer()
		},
		getClientAddress()
	);
};
