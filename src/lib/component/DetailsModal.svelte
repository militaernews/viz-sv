<script lang="ts">
	import FluentOpen24Regular from '~icons/fluent/open-24-regular';
	import FluentChat24Regular from '~icons/fluent/chat-24-regular';
	import FluentLink24Regular from '~icons/fluent/link-24-regular';
	import FluentDatabase24Regular from '~icons/fluent/database-24-regular';

	import { formatDate } from '$lib/util';
	import type { SearchResult } from '$lib/SearchResult';
	import BottomSheet from '$lib/component/BottomSheet.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import Badge from '$lib/component/ui/Badge.svelte';
	import { similarityTone, tagTone } from '$lib/component/ui/styles';

	interface Props {
		open: boolean;
		details: SearchResult | null;
	}

	let { open = $bindable(), details }: Props = $props();

	const sourceLink: string = $derived(
		details?.invite_hash && !details?.user_name
			? `https://t.me/c/${details?.chat_id}/${details?.msg_id}`
			: details?.user_name
				? `https://t.me/${details.user_name}/${details.msg_id}`
				: ''
	);

	const inviteLink: string = $derived(
		details?.invite_hash ? `https://t.me/joinchat/${details.invite_hash}` : ''
	);

	// mix-sv is the companion admin tool that holds full source/channel metadata.
	const channelLink: string = $derived(
		details?.chat_id ? `https://mix-sv.vercel.app/channel/${details.chat_id}` : ''
	);

	function handleImageError(event: Event): void {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.onerror = null;
			target.src = '/placeholder.svg';
		}
	}
</script>

<BottomSheet bind:open title={details?.display_name ?? ''}>
	{#if details}
		<div class="space-y-4">
			<div class="flex flex-wrap items-center gap-2">
				<Badge tone={similarityTone(details.similarity)}>
					{(details.similarity * 100).toFixed(1)}% match
				</Badge>
				<span class="text-base-content/60 text-xs">{formatDate(details.posted_at)}</span>
			</div>

			{#if details.tags?.length}
				<div class="flex flex-wrap gap-2">
					{#each details.tags as tag, i (tag)}
						<Badge tone={tagTone(i)} size="xs">{tag}</Badge>
					{/each}
				</div>
			{/if}

			<div class="panel-muted overflow-hidden">
				<img
					src="data:image/png;base64,{details.img}"
					class="h-auto max-h-[50vh] w-full object-contain"
					alt="Full resolution from {details.display_name}"
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

				{#if inviteLink && details.invite_hash && !details.user_name}
					<Button
						href={inviteLink}
						target="_blank"
						rel="noopener noreferrer"
						variant="success"
						icon={FluentLink24Regular}
						iconRight={FluentOpen24Regular}
						grow
					>
						Join Chat
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
