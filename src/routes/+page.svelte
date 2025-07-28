<script lang="ts">
	import DetailsModal from '../lib/component/DetailsModal.svelte';
	import SearchResultCell from '$lib/component/SearchResultCell.svelte';
	import { browser } from '$app/environment';
	import SuperDebug from 'sveltekit-superforms';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHistory24Regular from '~icons/fluent/history-24-regular';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
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

	// Set default collection value
	$effect(() => {
		if (!$form.collection && data.meta?.datasets) {
			const collections = Object.keys(data.meta.datasets);
			if (collections.length > 0) {
				$form.collection = collections[0];
			}
		}
	});

	// Search state using runes
	let searchResults = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let searchError = $state<string | null>(null);

	// UI state
	let dragActive = $state(false);
	let isLoading = $state(false);
	let fileInput: HTMLInputElement;
	let tagInput = $state('');
	let tagInputElement: HTMLInputElement;
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

			const existingHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
			const updatedHistory = [historyEntry, ...existingHistory];
			const limitedHistory = updatedHistory.slice(0, 100);

			localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
			console.log('Search saved to history:', historyEntry.id);
		} catch (error) {
			console.error('Failed to save to history:', error);
		}
	}

	// Client-side search function
	async function performSearch() {
		if (!browser) return;

		isSearching = true;
		searchError = null;

		try {
			let response: Response;

			if ($form.searchType === 'tags') {
				if (!$form.tags?.length) {
					throw new Error('No tags provided for tag search');
				}

				const requestBody = {
					tags: $form.tags,
					collection: $form.collection,
					posted_before: $form.endDate?.toISOString(),
					posted_after: $form.startDate?.toISOString()
				};

				response = await fetch('http://localhost:3000/search/tags', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody)
				});
			} else {
				if (!$form.image) {
					throw new Error('No image provided for image search');
				}

				const searchParams = {
					collection: $form.collection,
					posted_before: $form.endDate?.toISOString(),
					posted_after: $form.startDate?.toISOString()
				};

				const body = new FormData();
				body.append('image', $form.image);
				body.append('params', JSON.stringify(searchParams));

				response = await fetch('http://localhost:3000/search/images', {
					method: 'POST',
					body
				});
			}

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Search failed: ${errorText}`);
			}

			const results: SearchResult[] = await response.json();
			searchResults = results;

			// Save to history
			await saveToHistory(results, {
				searchType: $form.searchType,
				imageFileName: $form.image?.name || '',
				tags: $form.tags,
				startDate: $form.startDate || '',
				endDate: $form.endDate || '',
				collection: $form.collection
			});
		} catch (error) {
			searchError = error instanceof Error ? error.message : 'Search failed';
		} finally {
			isSearching = false;
		}
	}

	// Handle form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();
		await performSearch();
	}

	const showModal = (index: number) => {
		details = searchResults[index];
		dialog?.showModal();
		return () => dialog?.close();
	};

	function handleFileChange(event: Event) {
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
			$form.image = e.dataTransfer.files[0];
		}
	}

	function initiateImageUpload() {
		if (!isLoading && !isSearching) {
			fileInput.click();
		}
	}

	function addTag() {
		const trimmedTag = tagInput.trim();
		if (trimmedTag && !($form.tags || []).includes(trimmedTag)) {
			$form.tags = [...($form.tags || []), trimmedTag];
			tagInput = '';
			setTimeout(() => tagInputElement?.focus(), 0);
		}
	}

	function removeTag(tagToRemove: string) {
		$form.tags = ($form.tags || []).filter((tag) => tag !== tagToRemove);
		setTimeout(() => tagInputElement?.focus(), 0);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		} else if (e.key === 'Backspace' && tagInput === '' && ($form.tags?.length || 0) > 0) {
			e.preventDefault();
			const tags = $form.tags || [];
			removeTag(tags[tags.length - 1]);
		}
	}

	// Derived reactive values using runes
	const uploadStatus = $derived(isSearching ? 'loading' : searchError ? 'error' : 'idle');
	const hasImage = $derived(!!$form.image);
	const selectedFileName = $derived($form.image?.name || '');

	// Validation for search readiness
	const canSearch = $derived(() => {
		if ($form.searchType === 'image') {
			return hasImage;
		} else {
			return ($form.tags?.length || 0) > 0;
		}
	});

	// Auto-switch search type when tags are added/removed
	$effect(() => {
		if (($form.tags?.length || 0) > 0 && $form.searchType === 'image' && !hasImage) {
			$form.searchType = 'tags';
		}
	});
</script>

<svelte:head>
	<title>MN Viz</title>
</svelte:head>

<!-- Main Container -->
<div class="bg-base-100 min-h-screen">
	<!-- Compact Header -->
	<div class="bg-base-100/95 border-base-200 sticky top-0 z-20 border-b backdrop-blur-sm">
		<div class="container mx-auto max-w-7xl px-4 py-3">
			<form onsubmit={handleSubmit}>
				<div class="flex flex-row items-start gap-6">
					<!-- Search Type & Content - Vertical Stack -->
					<div class="flex min-w-[300px] flex-col gap-3">
						<!-- Search Type Selector with Icons -->
						<div class="flex gap-2">
							<button
								type="button"
								onclick={() => ($form.searchType = 'image')}
								class="btn btn-sm gap-2 {$form.searchType === 'image'
									? 'btn-primary'
									: 'btn-outline'}"
							>
								<FluentImage24Regular class="h-4 w-4" />
								Image
							</button>
							<button
								type="button"
								onclick={() => ($form.searchType = 'tags')}
								class="btn btn-sm gap-2 {$form.searchType === 'tags'
									? 'btn-primary'
									: 'btn-outline'}"
							>
								<FluentTag24Regular class="h-4 w-4" />
								Tags
							</button>
						</div>

						<!-- Search Input Area -->
						<div class="w-full">
							{#if $form.searchType === 'image'}
								<div
									class="border-base-300 bg-base-100 hover:border-primary/50 flex min-h-[42px] items-center gap-3 rounded-lg border border-dashed px-4 py-2.5 text-sm transition-colors"
								>
									{#if hasImage}
										<span class="text-primary font-medium">📁 {selectedFileName}</span>
									{:else}
										<button
											type="button"
											onclick={initiateImageUpload}
											class="text-base-content/60 hover:text-primary transition-colors"
										>
											Click to upload image or drag & drop
										</button>
									{/if}
								</div>
								<input
									bind:this={fileInput}
									type="file"
									accept="image/*"
									class="hidden"
									onchange={handleFileChange}
								/>
							{:else}
								<TagsInput
									tags={$form.tags || []}
									bind:tagInput
									bind:tagInputElement
									onAddTag={addTag}
									onRemoveTag={removeTag}
									onTagKeydown={handleTagKeydown}
								/>
							{/if}
						</div>
					</div>

					<!-- Filters & Actions - Horizontal Row -->
					<div class="flex flex-1 items-center justify-end gap-3">
						<select
							bind:value={$form.collection}
							class="select select-sm select-bordered min-w-[120px]"
						>
							{#each Object.entries(data.meta?.datasets || {}) as [key, count]}
								<option value={key}>{key} ({count})</option>
							{/each}
						</select>

						<div class="flex items-center gap-2">
							<input
								type="date"
								bind:value={$form.startDate}
								class="input input-sm input-bordered w-[130px]"
								placeholder="From"
							/>
							<span class="text-base-content/40 text-sm">to</span>
							<input
								type="date"
								bind:value={$form.endDate}
								class="input input-sm input-bordered w-[130px]"
								placeholder="To"
							/>
						</div>

						<div class="flex gap-2">
							<button
								type="submit"
								disabled={isSearching || !canSearch()}
								class="btn btn-primary btn-sm min-w-[80px] gap-2"
							>
								<FluentSearch24Regular class="h-4 w-4" />
								{isSearching ? 'Searching...' : 'Search'}
							</button>

							<a href="/history" class="btn btn-secondary btn-sm gap-2">
								<FluentHistory24Regular class="h-4 w-4" />
								History
							</a>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>

	<!-- Error Display -->
	{#if searchError}
		<div class="container mx-auto max-w-7xl px-6 py-4">
			<div class="alert alert-error">
				<span>{searchError}</span>
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if isSearching}
		<div class="container mx-auto max-w-7xl px-4 py-8">
			<div class="flex items-center justify-center">
				<div class="loading loading-spinner loading-md"></div>
				<span class="ml-2 text-sm">Searching...</span>
			</div>
		</div>
	{:else if searchResults.length > 0}
		<div class="container mx-auto max-w-7xl px-4 py-2">
			<div class="mb-2 flex items-center justify-between">
				<div class="text-base-content/60 text-sm">
					Found {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
				</div>
				<div class="text-base-content/40 text-xs">
					Total: {Object.values(data.meta?.datasets || {})
						.reduce((a, b) => a + b, 0)
						.toLocaleString()} items
				</div>
			</div>
			<div
				class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
			>
				{#each searchResults as result, index}
					<SearchResultCell
						{result}
						onclick={() => showModal(index)}
						class="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
					/>
				{/each}
			</div>
		</div>

		<DetailsModal {details} bind:dialog />
	{/if}
</div>

{@debug $form}
<SuperDebug data={$form} />
