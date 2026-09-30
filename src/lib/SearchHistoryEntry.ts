import type { SearchHit } from './SearchHit';

export interface SearchHistoryEntry {
	id: string;
	timestamp: number;
	results: SearchHit[];
	searchParams: {
		tags: string[];
		startDate: string;
		endDate: string;
		imageFileName?: string;
	};
}
