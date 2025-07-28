<script lang="ts">
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
	interface Props {
		tags: string[];
		tagInput: string;
		tagInputElement: HTMLInputElement;
		onAddTag: () => void;
		onRemoveTag: (tag: string) => void;
		onTagKeydown: (e: KeyboardEvent) => void;
	}
	let {
		tags,
		tagInput = $bindable(),
		tagInputElement = $bindable(),
		onAddTag,
		onRemoveTag,
		onTagKeydown
	}: Props = $props();
</script>

<div class="w-full">
	<div
		class="border-base-300 bg-base-100 focus-within:border-primary flex min-h-[40px] flex-wrap items-center gap-2 rounded-lg border-2 p-2"
	>
		{#each tags as tag}
			<button
				type="button"
				onclick={() => onRemoveTag(tag)}
				class="bg-primary/10 text-primary hover:bg-secondary hover:text-secondary-content group focus:ring-primary/50 relative inline-flex cursor-pointer items-center justify-center rounded-full border-none px-2 py-1 text-xs font-medium transition-colors outline-none focus:ring-2"
			>
				<span class="transition-opacity group-hover:opacity-0">{tag}</span>
				<span
					class="absolute inset-0 flex items-center justify-center text-xs opacity-0 transition-opacity group-hover:opacity-100"
					>×</span
				>
			</button>
		{/each}
		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if tags.length === 0}
				<FluentTag24Regular class="text-base-content/30 h-4 w-4 flex-shrink-0" />
			{/if}
			<input
				bind:this={tagInputElement}
				bind:value={tagInput}
				onkeydown={onTagKeydown}
				onblur={onAddTag}
				name="tags"
				placeholder={tags.length === 0 ? 'Add tags to search...' : 'Add tag...'}
				class="placeholder:text-base-content/60 min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
			/>
		</div>
	</div>
</div>
