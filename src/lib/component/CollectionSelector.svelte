<script lang="ts">
	import type { CollectionInfo } from '$lib/CollectionInfo';

	interface Props {
		collections: CollectionInfo[];
		selectedCollection: string;
	}

	let { collections, selectedCollection = $bindable() }: Props = $props();

	const sorted = $derived([...collections].sort((a, b) => a.name.localeCompare(b.name)));

	$effect(() => {
		if (!selectedCollection && sorted.length > 0) {
			selectedCollection = sorted[0].name;
		}
	});
</script>

{#if sorted.length > 0}
	<select
		bind:value={selectedCollection}
		name="collection"
		class="field-control w-full min-w-0 rounded-full px-4 py-2 text-sm"
	>
		{#each sorted as { name, count } (name)}
			<option value={name}>
				{name} ({count.toLocaleString()})
			</option>
		{/each}
	</select>
{:else}
	<div class="panel-muted text-base-content/60 rounded-full px-4 py-2 text-xs italic">
		No collections
	</div>
{/if}
