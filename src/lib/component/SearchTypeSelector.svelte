<script lang="ts">
	import FluentImage24Regular from '~icons/fluent/image-24-regular';

	import FluentTag24Regular from '~icons/fluent/tag-24-regular';

	interface Props {
		searchType: 'image' | 'tags';
	}

	let { searchType = $bindable() }: Props = $props();
</script>

<div>
	<div class="mb-2">
		<span class="text-base-content/80 text-xs font-medium">Search Type</span>
	</div>

	<div class="space-y-1">
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="radio"
				bind:group={searchType}
				value="image"
				class="radio radio-primary radio-xs"
			/>

			<div class="flex items-center gap-1.5">
				<FluentImage24Regular class="h-3 w-3" />

				<span class="text-xs">Image Search</span>
			</div>
		</label>

		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="radio"
				bind:group={searchType}
				value="tags"
				class="radio radio-primary radio-xs"
			/>

			<div class="flex items-center gap-1.5">
				<FluentTag24Regular class="h-3 w-3" />

				<span class="text-xs">Tag Search</span>
			</div>
		</label>
	</div>
</div>
