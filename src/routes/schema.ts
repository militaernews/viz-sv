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

export const authorizedExtensions = ['image/jpeg', 'image/png'];

export const searchFormSchema = object({
	// Image field - required for image search, optional for tag search

	image: optional(
		pipe(
			file('Please select an image file.'),

			mimeType(['image/jpeg', 'image/png'], 'Please select a JPEG or PNG file.'),

			maxSize(1024 * 1024 * 10, 'Please select a file smaller than 10 MB.')
		)
	),

	// Date fields - optional

	startDate: optional(date()),

	endDate: optional(date()),

	// Tags field - optional but should be string

	tags: optional(array(string())),

	// Collection field - required with default

	collection: string(),

	// Search type - required, must be either 'image' or 'tags'

	searchType: union(
		[literal('image'), literal('tags')],

		'Search type must be either "image" or "tags"'
	)
});

export type SearchFormSchema = InferInput<typeof searchFormSchema>;
