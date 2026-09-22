<script lang="ts">
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
	import Badge from '$lib/component/ui/Badge.svelte';

	interface Props {
		tags: string[];
		tagInput: string;
		tagInputElement: HTMLInputElement;
		onAddTag: () => void;
		onRemoveTag: (tag: string) => void;
		onTagKeydown: (e: KeyboardEvent) => void;
		invalid?: boolean;
	}
	let {
		tags,
		tagInput = $bindable(),
		tagInputElement = $bindable(),
		onAddTag,
		onRemoveTag,
		onTagKeydown,
		invalid = false
	}: Props = $props();
</script>

<div class="w-full">
	<div
		class="field-control flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-full px-3 py-1.5"
		style={invalid ? 'border-color: var(--color-error)' : undefined}
	>
		{#each tags as tag (tag)}
			<button type="button" onclick={() => onRemoveTag(tag)} class="flinch">
				<Badge
					tone="amber"
					class="cursor-pointer transition-colors hover:bg-red-500 hover:text-white"
				>
					{tag} ×
				</Badge>
			</button>
		{/each}
		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if tags.length === 0}
				<FluentTag24Regular class="text-base-content/60 h-4 w-4 flex-shrink-0" />
			{/if}
			<input
				bind:this={tagInputElement}
				bind:value={tagInput}
				onkeydown={onTagKeydown}
				onblur={onAddTag}
				name="tags"
				placeholder={tags.length === 0 ? 'Add tags to search...' : 'Add tag...'}
				class="text-base-content placeholder:text-base-content/60 min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
			/>
		</div>
	</div>
</div>
