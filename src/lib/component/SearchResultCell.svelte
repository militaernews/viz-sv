<script lang="ts">
	import { formatDate } from '$lib/util';
	import { channelLabel, primaryLink, type SearchHit } from '$lib/SearchHit';
	import Badge from '$lib/component/ui/Badge.svelte';
	import { similarityTone } from '$lib/component/ui/styles';

	interface Props {
		result: SearchHit;
		onclick: () => void;
		class?: string;
	}

	let { result, onclick, class: className = '' }: Props = $props();

	const link = $derived(primaryLink(result));

	function handleClick(): void {
		onclick();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick();
		}
	}

	function handleImageError(event: Event): void {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.onerror = null;
			target.src = '/placeholder.svg';
		}
	}
</script>

<article
	class="panel-interactive flinch group relative overflow-hidden {className}"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={handleKeydown}
>
	<div class="relative aspect-[4/3] overflow-hidden">
		<img
			src={result.thumb_url}
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			alt="Search result from {channelLabel(link)}"
			loading="lazy"
			onerror={handleImageError}
		/>

		{#if link}
			<div
				class="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			>
				<div
					class="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white"
				>
					#{link.message_id}
				</div>
			</div>
		{/if}
	</div>

	<div class="p-3">
		<h3
			class="text-base-content group-hover:text-primary mb-2 line-clamp-2 text-sm font-medium transition-colors"
		>
			{channelLabel(link)}
		</h3>

		<div class="text-base-content/60 flex items-center justify-between text-xs">
			{#if link}
				<time datetime={link.posted_at}>
					{formatDate(link.posted_at)}
				</time>
			{:else}
				<span></span>
			{/if}
			<Badge tone={similarityTone(result.score)} size="xs">
				{Math.round(result.score * 100)}%
			</Badge>
		</div>
	</div>
</article>
