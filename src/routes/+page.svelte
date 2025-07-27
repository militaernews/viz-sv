<script lang="ts">
	import DetailsModal from '../lib/component/DetailsModal.svelte';
	import SearchResultCell from '$lib/component/SearchResultCell.svelte';
	import { browser } from '$app/environment';
	import SuperDebug from 'sveltekit-superforms';
	// Using proper Fluent icons
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHistory24Regular from '~icons/fluent/history-24-regular';
	import type { SearchResult } from '$lib/SearchResult';
	import type { SearchHistoryEntry } from '$lib/SearchHistoryEntry';
	import DateFilter from '$lib/component/DateFilter.svelte';
	import TagsInput from '$lib/component/TagsInput.svelte';
	import ImageUpload from '$lib/component/ImageUpload.svelte';
	import CollectionSelector from '$lib/component/CollectionSelector.svelte';
	import SearchTypeSelector from '$lib/component/SearchTypeSelector.svelte';
	import { superForm } from 'sveltekit-superforms/client';

	let { data } = $props();
	const { form, errors, enhance } = superForm(data.form);

	let dragActive = $state(false);
	let isLoading = $state(false);
	let fileInput: HTMLInputElement;

	let tagInput = $state('');
	let tagInputElement: HTMLInputElement;

	// Date states

	// Collection and search type states
	let selectedCollection = $state('images');

	let dialog: HTMLDialogElement | undefined = $state();
	let details: SearchResult | null = $state(null);

	// Local storage key for history
	const HISTORY_STORAGE_KEY = 'search_history_v2';

	// Convert image to base64
	async function imageToBase64(imageUrl: string): Promise<string> {
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		} catch (error) {
			console.error('Failed to convert image to base64:', error);
			return '';
		}
	}

	// Save search results to history
	async function saveToHistory(results: SearchResult[], searchParams?: any) {
		if (!browser || results.length === 0) return;

		try {
			// Convert images to base64 if they aren't already
			const resultsWithBase64 = await Promise.all(
				results.map(async (result) => ({
					...result,
					img: result.img.startsWith('data:') ? result.img : await imageToBase64(result.img)
				}))
			);

			const historyEntry: SearchHistoryEntry = {
				id: crypto.randomUUID(),
				timestamp: Date.now(),
				results: resultsWithBase64,
				searchParams: {
					...searchParams,
					tags: $form.tags,
					startDate: $form.startDate,
					endDate: $form.endDate,
					collection: selectedCollection,
					searchType: $form.searchType
				}
			};

			// Get existing history
			const existingHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');

			// Add new entry at the beginning
			const updatedHistory = [historyEntry, ...existingHistory];

			// Keep only last 100 entries
			const limitedHistory = updatedHistory.slice(0, 100);

			// Save to localStorage
			localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));

			console.log('Search saved to history:', historyEntry.id);
		} catch (error) {
			console.error('Failed to save to history:', error);
		}
	}

	const showModal = (index: number) => {
		const results = data || [];
		//	details = results[index];
		dialog?.showModal();
		return () => dialog?.close();
	};

	function handleFileChange(event: Event) {
		// Update the selected file state immediately
		const target = event.target as HTMLInputElement;
		$form.image = target.files?.[0];
	}

	function handleDrag(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = e.type === 'dragenter' || e.type === 'dragover';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;

		if (e.dataTransfer?.files?.[0]) {
			const dt = new DataTransfer();
			dt.items.add(e.dataTransfer.files[0]);
			fileInput.files = dt.files;
			// Update selected file state immediately
			$form.image = e.dataTransfer.files[0];
		}
	}

	function initiateImageUpload() {
		if (!isLoading) {
			fileInput.click();
		}
	}

	function addTag() {
		const trimmedTag = tagInput.trim();
		if (trimmedTag && !$form.tags?.includes(trimmedTag)) {
			$form.tags = [...$form.tags!, trimmedTag];
			tagInput = '';
			setTimeout(() => tagInputElement?.focus(), 0);
		}
	}

	function removeTag(tagToRemove: string) {
		$form.tags = $form.tags?.filter((tag) => tag !== tagToRemove);
		setTimeout(() => tagInputElement?.focus(), 0);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		} else if ((e.key === 'Backspace' && tagInput === '' && $form.tags?.length) || 0 > 0) {
			e.preventDefault();
			removeTag($form.tags![$form.tags?.length || 0 - 1]);
		}
	}

	// Reactive status
	const uploadStatus = $derived(isLoading ? 'loading' : errors ? 'error' : 'idle');

	const hasImage = $derived(!!$form.image);
	const selectedFileName = $derived($form.image?.name || '');

	// Validation for search readiness
	const canSearch = $derived(() => {
		if ($form.searchType === 'image') {
			return hasImage;
		} else {
			return $form.tags?.length! > 0;
		}
	});

	// Auto-switch search type when tags are added/removed
	$effect(() => {
		if ($form.tags?.length! > 0 && $form.searchType === 'image' && !hasImage) {
			$form.searchType = 'tags';
		}
	});
</script>

<svelte:head>
	<title>MN Viz</title>
</svelte:head>

<!-- Hidden form inputs -->

<!-- Main Container -->
<div class="bg-base-100 min-h-screen">
	<!-- Compact Header -->
	<div class="bg-base-100/95 border-base-200 sticky top-0 z-10 border-b backdrop-blur-sm">
		<div class="container mx-auto max-w-7xl px-4 py-2">
			<form method="POST" enctype="multipart/form-data" use:enhance>
				<div class="flex flex-row gap-4">
					<!-- Search Type Selector -->
					<div class="flex-shrink-0">
						<SearchTypeSelector searchType={$form.searchType} />
					</div>

					<!-- Main Content Area -->
					<div class="flex flex-1 flex-col items-center">
						{#if $form.searchType === 'image'}
							<ImageUpload
								bind:fileInput
								{isLoading}
								{uploadStatus}
								{dragActive}
								error={''}
								accept="image/*"
								uploadText={selectedFileName || 'Upload image to search'}
								dragText="Drop image here"
								onInitiateUpload={initiateImageUpload}
								onFileChange={handleFileChange}
								onDrag={handleDrag}
								onDrop={handleDrop}
							/>
						{:else}
							<div class="w-full max-w-md">
								<TagsInput
									tags={$form.tags || []}
									bind:tagInput
									bind:tagInputElement
									onAddTag={addTag}
									onRemoveTag={removeTag}
									onTagKeydown={handleTagKeydown}
								/>
							</div>
						{/if}
					</div>

					<!-- Sidebar: Filters + Actions -->
					<div class="border-base-200 w-48 flex-shrink-0 space-y-3 border-l p-4">
						<CollectionSelector
							collections={data.meta.datasets}
							bind:selectedCollection={$form.collection}
						/>

						<DateFilter
							startDate={$form.startDate?.toDateString() || ''}
							endDate={$form.endDate?.toDateString() || ''}
						/>

						<!-- Action Buttons -->
						<div class="space-y-2">
							<button
								type="submit"
								disabled={isLoading || !canSearch()}
								class="btn btn-primary btn-sm w-full gap-1"
								title={!canSearch()
									? $form.searchType === 'image'
										? 'Please select an image'
										: 'Please add at least one tag'
									: ''}
							>
								<FluentSearch24Regular class="h-3 w-3" />
								Search
							</button>

							<a
								type="button"
								href={'/history'}
								class="btn btn-secondary btn-sm w-full gap-1"
								title="View Search History"
							>
								<FluentHistory24Regular class="h-3 w-3" />
								History
							</a>
						</div>

						{#if Object.keys(data.meta.datasets).length > 0}
							<div class="text-base-content/60 border-t pt-2 text-xs">
								Total: {Object.values(data.meta.datasets)
									.reduce((a, b) => a + b, 0)
									.toLocaleString()} items
							</div>
						{/if}
					</div>
				</div>
			</form>
		</div>
	</div>

	<!-- Results -->
	{@debug data}
	<SuperDebug data={$form} />

	{#if data.searchResults.length > 0}
		<div class="container mx-auto max-w-7xl px-6 py-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.searchResults as result, index}
					<SearchResultCell
						{result}
						onclick={() => showModal(index)}
						class="hover:shadow-shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
					/>
				{/each}
			</div>
		</div>

		<DetailsModal {details} bind:dialog />
	{/if}
</div>
