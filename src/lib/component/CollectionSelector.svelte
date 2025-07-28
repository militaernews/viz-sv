<script lang="ts">
	import type { MetaResponse } from '$lib/MetaResponse';
	import FluentDatabase24Regular from '~icons/fluent/database-24-regular';

	interface Props {
		collections: MetaResponse['datasets'];

		selectedCollection: string;
	}

	let { collections, selectedCollection = $bindable() }: Props = $props();

	// Get collection entries sorted by name

	const collectionEntries = $derived(
		Object.entries(collections).sort(([a], [b]) => a.localeCompare(b))
	);

	// Set default collection if none selected and collections are available

	$effect(() => {
		if (!selectedCollection && collectionEntries.length > 0) {
			selectedCollection = collectionEntries[0][0];
		}
	});
</script>

<div>
	<div class="mb-2 flex items-center gap-2">
		<FluentDatabase24Regular class="text-base-content/60 h-3 w-3" />

		<span class="text-base-content/80 text-xs font-medium">Collection</span>
	</div>

	{#if collectionEntries.length > 0}
		<select
			bind:value={selectedCollection}
			name="collection"
			class="select select-bordered select-xs w-full"
		>
			{#each collectionEntries as [name, count]}
				<option value={name}>
					{name} ({count.toLocaleString()} items)
				</option>
			{/each}
		</select>
	{:else}
		<div class="text-base-content/60 border-base-300 rounded border p-2 text-xs italic">
			No collections available
		</div>
	{/if}
</div>
