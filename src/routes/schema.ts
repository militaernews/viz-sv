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

// viz-rs rejects uploads above API_MAX_UPLOAD_BYTES (25 MiB by default).
export const MAX_UPLOAD_BYTES = 1024 * 1024 * 25;
export const MAX_QUERY_CHARS = 200;

export const searchFormSchema = object({
	image: optional(
		pipe(
			file('Please select an image file.'),
			mimeType(authorizedExtensions, 'Please select a JPEG, PNG, WebP or GIF file.'),
			maxSize(MAX_UPLOAD_BYTES, 'Please select a file smaller than 25 MB.')
		)
	),
	startDate: optional(date()),
	endDate: optional(date()),
	tags: optional(array(string())),
	searchType: union([literal('image'), literal('tags')], 'Search type must be "image" or "tags"')
});

export type SearchFormSchema = InferInput<typeof searchFormSchema>;
