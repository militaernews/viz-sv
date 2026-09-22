<script lang="ts">
	import { formatDate } from '$lib/util';
	import type { SearchResult } from '$lib/SearchResult';
	import Badge from '$lib/component/ui/Badge.svelte';
	import { similarityTone } from '$lib/component/ui/styles';

	interface Props {
		result: SearchResult;
		onclick: () => void;
		class?: string;
	}

	let { result, onclick, class: className = '' }: Props = $props();

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
			src="data:image/png;base64,{result.img}"
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			alt="Search result from {result.display_name}"
			loading="lazy"
			onerror={handleImageError}
		/>

		<div class="absolute top-2 right-2">
			<Badge tone={similarityTone(result.similarity)} size="xs">
				{Math.round(result.similarity * 100)}%
			</Badge>
		</div>

		<div class="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
			<div
				class="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white"
			>
				#{result.msg_id}
			</div>
		</div>
	</div>

	<div class="p-3">
		<h3
			class="text-base-content group-hover:text-primary mb-2 line-clamp-2 text-sm font-medium transition-colors"
		>
			{result.display_name}
		</h3>

		<div class="text-base-content/60 text-xs">
			<time datetime={result.posted_at}>
				{formatDate(result.posted_at)}
			</time>
		</div>
	</div>
</article>
