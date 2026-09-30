import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MAX_QUERY_CHARS, searchFormSchema } from './schema';
import { message, superValidate } from 'sveltekit-superforms/server';

import { valibot } from 'sveltekit-superforms/adapters';
import type { SearchHit } from '$lib/SearchHit';
import { backendFetch } from '$lib/server/backend';
import { errorMessage, filterByDate, textQuery } from '$lib/search';

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(searchFormSchema));
	return { form, searchResults: [] };
};

// Fallback for form posts without JavaScript; the page normally searches via
// the /api/search/* proxy routes instead.
export const actions = {
	default: async ({ request, getClientAddress }) => {
		const form = await superValidate(request, valibot(searchFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			let response: Response;

			if (form.data.searchType === 'tags') {
				const q = textQuery(form.data.tags ?? []);
				if (!q) {
					return fail(400, { error: 'No tags provided for tag search' });
				}
				if (q.length > MAX_QUERY_CHARS) {
					return fail(400, {
						error: `Tags must be at most ${MAX_QUERY_CHARS} characters in total`
					});
				}

				response = await backendFetch(
					'/api/search/text',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ q })
					},
					getClientAddress()
				);
			} else {
				const upload = form.data.image;
				if (!upload) {
					return fail(400, { error: 'No image provided for image search' });
				}

				const body = new FormData();
				body.append('file', upload);
				response = await backendFetch(
					'/api/search/image',
					{ method: 'POST', body },
					getClientAddress()
				);
			}

			if (!response.ok) {
				return fail(response.status === 429 ? 429 : 400, {
					error: `Failed to search: ${await errorMessage(response)}`
				});
			}

			const hits: SearchHit[] = await response.json();
			const searchResults = filterByDate(hits, form.data.startDate, form.data.endDate);

			return message(form, {
				success: true,
				searchResults,
				searchParams: {
					searchType: form.data.searchType,
					imageFileName: form.data.image?.name || '',
					tags: form.data.tags,
					startDate: form.data.startDate || '',
					endDate: form.data.endDate || ''
				}
			});
		} catch (error) {
			console.error('Search error:', error);
			return fail(500, { error: 'Failed to perform search' });
		}
	}
} satisfies Actions;
