import {
	file,
	maxSize,
	mimeType,
	object,
	pipe,
	string,
	optional,
	union,
	literal,
	type InferInput,
	date,
	array
} from 'valibot';

export const authorizedExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

// Vercel rejects function request bodies above 4.5 MB, so stay below that including the
// multipart overhead (viz-rs itself would accept up to API_MAX_UPLOAD_BYTES, 25 MiB).
export const MAX_UPLOAD_BYTES = 1024 * 1024 * 4;
export const UPLOAD_TOO_LARGE_MESSAGE =
	'Please select an image smaller than 4 MB, or crop it further.';
export const MAX_QUERY_CHARS = 200;

export const searchFormSchema = object({
	image: optional(
		pipe(
			file('Please select an image file.'),
			mimeType(authorizedExtensions, 'Please select a JPEG, PNG, WebP or GIF file.'),
			maxSize(MAX_UPLOAD_BYTES, UPLOAD_TOO_LARGE_MESSAGE)
		)
	),
	startDate: optional(date()),
	endDate: optional(date()),
	tags: optional(array(string())),
	searchType: union([literal('image'), literal('tags')], 'Search type must be "image" or "tags"')
});

export type SearchFormSchema = InferInput<typeof searchFormSchema>;
