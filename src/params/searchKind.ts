import type { ParamMatcher } from '@sveltejs/kit';

export type SearchKind = 'image' | 'video' | 'text';

export const match = ((param: string): param is SearchKind =>
	param === 'image' || param === 'video' || param === 'text') satisfies ParamMatcher;
