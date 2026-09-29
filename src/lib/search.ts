import { primaryLink, type SearchHit } from './SearchHit';

/** Tags are sent to viz-rs as one full-text/CLIP query. */
export function textQuery(tags: string[]): string {
	return tags.join(' ').trim();
}

/**
 * viz-rs has no date parameters, so the range is applied to the results, on the
 * date of the post each result links to first.
 */
export function filterByDate(hits: SearchHit[], startDate?: Date, endDate?: Date): SearchHit[] {
	if (!startDate && !endDate) return hits;
	return hits.filter((hit) => {
		const link = primaryLink(hit);
		if (!link) return false;
		const postedAt = new Date(link.posted_at).getTime();
		return (
			(!startDate || postedAt >= startDate.getTime()) && (!endDate || postedAt <= endDate.getTime())
		);
	});
}

/** viz-rs errors are `{"error": "..."}`; falls back to the raw body for anything else. */
export async function errorMessage(response: Response): Promise<string> {
	const text = await response.text();
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed?.error === 'string') return parsed.error;
	} catch {
		// not JSON
	}
	return text || `HTTP ${response.status}`;
}
