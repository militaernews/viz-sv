<script lang="ts">
	import FluentOpen24Regular from '~icons/fluent/open-24-regular';
	import FluentChat24Regular from '~icons/fluent/chat-24-regular';
	import FluentCloudWords24Regular from '~icons/fluent/cloud-words-24-regular';
	import FluentDatabase24Regular from '~icons/fluent/database-24-regular';

	import { formatDate } from '$lib/util';
	import { channelLabel, messageUrl, primaryLink, type SearchHit } from '$lib/SearchHit';
	import BottomSheet from '$lib/component/BottomSheet.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import Badge from '$lib/component/ui/Badge.svelte';
	import { similarityTone } from '$lib/component/ui/styles';

	interface Props {
		open: boolean;
		details: SearchHit | null;
	}

	let { open = $bindable(), details }: Props = $props();

	const link = $derived(details ? primaryLink(details) : null);

	// Earliest post of this media in a source channel, and its earliest copy in a
	// backup channel; either can be missing if that side was never indexed.
	const sourceLink: string = $derived(details?.origin ? messageUrl(details.origin) : '');
	const backupLink: string = $derived(details?.backup ? messageUrl(details.backup) : '');

	// mix-sv is the companion admin tool that holds full source/channel metadata.
	const channelLink: string = $derived(
		details?.origin ? `https://mix-sv.vercel.app/channel/${details.origin.channel_id}` : ''
	);

	function handleImageError(event: Event): void {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.onerror = null;
			target.src = '/placeholder.svg';
		}
	}
</script>

<BottomSheet bind:open title={channelLabel(link)}>
	{#if details}
		<div class="space-y-4">
			<div class="flex flex-wrap items-center gap-2">
				<Badge tone={similarityTone(details.score)}>
					{(details.score * 100).toFixed(1)}% match
				</Badge>
				{#if link}
					<span class="text-base-content/60 text-xs">{formatDate(link.posted_at)}</span>
				{/if}
			</div>

			<div class="panel-muted overflow-hidden">
				<img
					src={details.thumb_url}
					class="h-auto max-h-[50vh] w-full object-contain"
					alt="Thumbnail from {channelLabel(link)}"
					onerror={handleImageError}
				/>
			</div>

			<div class="flex flex-wrap gap-3">
				{#if sourceLink}
					<Button
						href={sourceLink}
						target="_blank"
						rel="noopener noreferrer"
						variant="secondary"
						icon={FluentChat24Regular}
						iconRight={FluentOpen24Regular}
						grow
					>
						Original Message
					</Button>
				{/if}

				{#if backupLink}
					<Button
						href={backupLink}
						target="_blank"
						rel="noopener noreferrer"
						variant="subtle"
						icon={FluentCloudWords24Regular}
						iconRight={FluentOpen24Regular}
						grow
					>
						Backup
					</Button>
				{/if}

				{#if channelLink}
					<Button
						href={channelLink}
						target="_blank"
						rel="noopener noreferrer"
						variant="subtle"
						icon={FluentDatabase24Regular}
						iconRight={FluentOpen24Regular}
						grow
					>
						Channel Data
					</Button>
				{/if}
			</div>
		</div>
	{/if}
</BottomSheet>
