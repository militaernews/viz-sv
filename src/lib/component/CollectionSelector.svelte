<script lang="ts">
	import type { MetaResponse } from '$lib/MetaResponse';

	interface Props {
		collections: MetaResponse['datasets'];
		selectedCollection: string;
	}

	let { collections, selectedCollection = $bindable() }: Props = $props();

	const collectionEntries = $derived(
		Object.entries(collections).sort(([a], [b]) => a.localeCompare(b))
	);

	$effect(() => {
		if (!selectedCollection && collectionEntries.length > 0) {
			selectedCollection = collectionEntries[0][0];
		}
	});
</script>

{#if collectionEntries.length > 0}
	<select
		bind:value={selectedCollection}
		name="collection"
		class="field-control w-full min-w-0 rounded-full px-4 py-2 text-sm"
	>
		{#each collectionEntries as [name, count]}
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
