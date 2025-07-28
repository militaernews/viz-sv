// @ts-nocheck
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { TagSearchRequest } from '$lib/TagSearchRequest';
import type { ImageSearchParams } from '$lib/ImageSearchParams';
import type { MetaResponse } from '$lib/MetaResponse';
import { searchFormSchema } from './schema';
import { message, superValidate } from 'sveltekit-superforms/server';

import { valibot } from 'sveltekit-superforms/adapters';
import type { SearchResult } from '$lib/SearchResult';

export const load = async () => {
	let meta: MetaResponse | null = null;

	try {
		// Fetch available collections from the meta endpoint

		const response = await fetch('http://localhost:3000/meta');

		if (response.ok) {
			meta = await response.json();
		}
	} catch (error) {
		console.error('Failed to fetch collections:', error);
	}

	const form = await superValidate(valibot(searchFormSchema));

	return { form, meta, searchResults: [] };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, valibot(searchFormSchema));

		console.log(form);

		if (!form.valid) {
			// Return { form } and things will just work.

			return fail(400, { form });
		}

		try {
			let response: Response;

			let body: FormData | string;

			if (form.data.searchType === 'tags') {
				// Tag-based search

				if (!form.data.tags?.length) {
					return fail(400, {
						error: 'No tags provided for tag search'
					});
				}

				const requestBody: TagSearchRequest = {
					tags: form.data.tags,

					collection: form.data.collection,

					posted_before: form.data.endDate?.toISOString(),

					posted_after: form.data.startDate?.toISOString()
				};

				console.log('Posting tag search request...', requestBody);

				response = await fetch('http://localhost:3000/search/tags', {
					method: 'POST',

					headers: {
						'Content-Type': 'application/json'
					},

					body: JSON.stringify(requestBody)
				});
			} else {
				// Image-based search

				if (!form.data.image) {
					return fail(400, {
						error: 'No image provided for image search'
					});
				}

				const searchParams: ImageSearchParams = {
					collection: form.data.collection,

					posted_before: form.data.endDate?.toISOString(),

					posted_after: form.data.startDate?.toISOString()
				};

				body = new FormData();

				body.append('image', form.data.image);

				body.append('params', JSON.stringify(searchParams));

				console.log('Posting image search request...', body, searchParams);

				response = await fetch('http://localhost:3000/search/images', {
					method: 'POST',

					body
				});
			}

			console.log('Response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();

				return fail(400, {
					error: `Failed to search. Server response: ${errorText}`
				});
			}

			const data: SearchResult[] = await response.json();
			console.log('Search results received:', data.length, 'items');

			return message(form, {
				success: true,

				searchResults: data,

				searchParams: {
					searchType: form.data.searchType,
					imageFileName: form.data.image?.name || '',
					tags: form.data.tags,
					startDate: form.data.startDate || '',
					endDate: form.data.endDate || '',
					collection: form.data.collection
				}
			});
		} catch (error) {
			console.error('Search error:', error);

			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to perform search'
			});
		}
	}
} satisfies Actions;
;null as any as PageServerLoad;