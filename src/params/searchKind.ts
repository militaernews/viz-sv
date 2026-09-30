import type { ParamMatcher } from '@sveltejs/kit';

export type SearchKind = 'image' | 'text';

export const match = ((param: string): param is SearchKind =>
	param === 'image' || param === 'text') satisfies ParamMatcher;
