<script lang="ts">
	import { formatDate } from '$lib/util';
	import FluentCalendar24Regular from '~icons/fluent/calendar-24-regular';
	import type { SearchResult } from '$lib/SearchResult';

	interface Props {
		result: SearchResult;
		onclick: () => void;
		class?: string;
	}

	let { result, onclick, class: className = '' }: Props = $props();

	interface SimilarityInfo {
		color: string;
		label: string;
		bgColor: string;
		borderColor: string;
	}

	// Get similarity color and label using $derived
	const similarityInfo: SimilarityInfo = $derived(getSimilarityInfo(result.similarity));

	function getSimilarityInfo(similarity: number): SimilarityInfo {
		if (similarity > 0.9)
			return {
				color: 'success',
				label: 'Excellent',
				bgColor: 'bg-success/10',
				borderColor: 'border-success/30'
			};
		if (similarity > 0.75)
			return {
				color: 'primary',
				label: 'Very Good',
				bgColor: 'bg-primary/10',
				borderColor: 'border-primary/30'
			};
		if (similarity > 0.5)
			return {
				color: 'warning',
				label: 'Good',
				bgColor: 'bg-warning/10',
				borderColor: 'border-warning/30'
			};
		if (similarity > 0.35)
			return {
				color: 'info',
				label: 'Fair',
				bgColor: 'bg-info/10',
				borderColor: 'border-info/30'
			};
		if (similarity > 0.1)
			return {
				color: 'secondary',
				label: 'Poor',
				bgColor: 'bg-secondary/10',
				borderColor: 'border-secondary/30'
			};
		return {
			color: 'error',
			label: 'Very Poor',
			bgColor: 'bg-error/10',
			borderColor: 'border-error/30'
		};
	}

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
	class="
		group bg-base-100 hover:border-primary/40 relative cursor-pointer overflow-hidden rounded-lg
		border shadow-sm transition-all duration-200
		ease-out hover:shadow-md
		{similarityInfo.borderColor} {className}
	"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={handleKeydown}
>
	<!-- Image Container -->
	<div class="relative aspect-[4/3] overflow-hidden">
		<img
			src="data:image/png;base64,{result.img}"
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			alt="Search result from {result.display_name}"
			loading="lazy"
			onerror={handleImageError}
		/>

		<!-- Similarity Badge -->
		<div class="absolute top-2 right-2">
			<div
				class="
				rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm
				text-{similarityInfo.color} {similarityInfo.bgColor} border {similarityInfo.borderColor}
			"
			>
				{Math.round(result.similarity * 100)}%
			</div>
		</div>

		<!-- Message ID on hover -->
		<div
			class="absolute bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
		>
			<div class="rounded bg-black/60 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
				#{result.msg_id}
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="p-3">
		<!-- Title -->
		<h3
			class="text-base-content group-hover:text-primary mb-2 line-clamp-2 text-sm font-medium transition-colors duration-200"
		>
			{result.display_name}
		</h3>

		<!-- Date -->
		<div class="text-base-content/60 flex items-center gap-1.5 text-xs">
			<FluentCalendar24Regular class="h-3 w-3" />
			<time datetime={result.posted_at}>
				{formatDate(result.posted_at)}
			</time>
		</div>
	</div>
</article>
