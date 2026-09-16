import { env } from '$env/dynamic/private';

/**
 * The only place viz-rs's location and shared secret are read. Everything under
 * src/routes/api/** and +page.server.ts load/actions must go through this - the
 * browser is never told where the backend lives or given the key.
 */
export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
	if (!env.API_BASE_URL) throw new Error('API_BASE_URL is not configured');
	if (!env.BACKEND_API_KEY) throw new Error('BACKEND_API_KEY is not configured');

	const headers = new Headers(init.headers);
	headers.set('x-api-key', env.BACKEND_API_KEY);

	return fetch(`${env.API_BASE_URL}${path}`, { ...init, headers });
}

/**
 * For +server.ts proxy routes: turns a missing config or unreachable backend into
 * a clean 502 instead of an uncaught exception (which SvelteKit renders as a bare
 * "Internal Server Error" with no useful detail).
 */
export async function proxyToBackend(path: string, init: RequestInit = {}): Promise<Response> {
	let response: Response;
	try {
		response = await backendFetch(path, init);
	} catch (err) {
		console.error(`proxy to ${path} failed:`, err);
		return Response.json(
			{ error: 'Backend unreachable', details: err instanceof Error ? err.message : String(err) },
			{ status: 502 }
		);
	}

	return new Response(response.body, {
		status: response.status,
		headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' }
	});
}
