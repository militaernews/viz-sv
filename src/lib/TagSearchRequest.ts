export interface TagSearchRequest {
	tags: string[];
	posted_before?: string;
	posted_after?: string;
	collection: string;
}
