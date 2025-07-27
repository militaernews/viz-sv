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
			<span
				class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
			>
				{tag}

				<button
					type="button"
					onclick={() => onRemoveTag(tag)}
					class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
				>
					<span class="text-xs">×</span>
				</button>
			</span>
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
				placeholder={tags.length === 0 ? 'Add tags to search...' : 'Add tag...'}
				class="placeholder:text-base-content/60 min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
			/>
		</div>
	</div>
</div>
