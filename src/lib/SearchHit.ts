/** One post a result was seen in (see viz-rs README, API section). */
export interface Link {
	/** Bot API style id, e.g. -1001234567890. */
	channel_id: number;
	channel_username: string | null;
	message_id: number;
	posted_at: string;
}

export interface SearchHit {
	thumb_url: string;
	/** 1.0 for an exact hash/caption match, otherwise hash or CLIP similarity. */
	score: number;
	/** Earliest post in a source channel. */
	origin: Link | null;
	/** Earliest post in a backup channel. */
	backup: Link | null;
}

/** Private channels have no username; t.me/c/ takes the id without the -100 prefix. */
export function messageUrl(link: Link): string {
	if (link.channel_username) return `https://t.me/${link.channel_username}/${link.message_id}`;
	const internalId = String(link.channel_id).replace(/^-100/, '');
	return `https://t.me/c/${internalId}/${link.message_id}`;
}

export function channelLabel(link: Link | null): string {
	if (!link) return 'Unknown channel';
	return link.channel_username ? `@${link.channel_username}` : 'Private channel';
}

/** The link shown first: the origin post, or the backup copy if the origin isn't indexed. */
export function primaryLink(hit: SearchHit): Link | null {
	return hit.origin ?? hit.backup;
}

/** thumb_url is content-addressed, so it's unique per result. */
export function hitKey(hit: SearchHit): string {
	return hit.thumb_url;
}
