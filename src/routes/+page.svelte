<script lang="ts">
	import DetailsModal from '$lib/component/DetailsModal.svelte';
	import SearchResultCell from '$lib/component/SearchResultCell.svelte';
	import { browser } from '$app/environment';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHistory24Regular from '~icons/fluent/history-24-regular';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
	import type { SearchResult } from '$lib/SearchResult';
	import type { SearchHistoryEntry } from '$lib/SearchHistoryEntry';
	import DateFilter from '$lib/component/DateFilter.svelte';
	import TagsInput from '$lib/component/TagsInput.svelte';
	import CollectionSelector from '$lib/component/CollectionSelector.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { getTelegramWebApp, haptic, useMainButton } from '$lib/telegram';

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
	let hasSearched = $state(false);
	let isSearching = $state(false);
	let searchError = $state<string | null>(null);

	// UI state
	let dragActive = $state(false);
	let isLoading = $state(false);
	let fileInput: HTMLInputElement;
	let tagInput = $state('');
	let tagInputElement: HTMLInputElement;
	let selectedCollection = $state('images');
	let detailsOpen = $state(false);
	let details: SearchResult | null = $state(null);

	// Local storage keys
	const HISTORY_STORAGE_KEY = 'search_history_v2';
	const IMAGE_STORAGE_KEY = 'last_uploaded_image';

	function fileToDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function dataUrlToFile(dataUrl: string, name: string, type: string): File {
		const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return new File([bytes], name, { type });
	}

	// Keeps the last picked image around (e.g. across a reload) so it isn't
	// lost - image search inputs are otherwise the one piece of form state a
	// refresh would silently wipe.
	async function persistImage(file: File) {
		if (!browser) return;
		try {
			const dataUrl = await fileToDataUrl(file);
			localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify({ name: file.name, type: file.type, dataUrl }));
		} catch (error) {
			console.error('Failed to persist uploaded image:', error);
		}
	}

	function restoreImage() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(IMAGE_STORAGE_KEY);
			if (!raw) return;
			const { name, type, dataUrl } = JSON.parse(raw);
			$form.image = dataUrlToFile(dataUrl, name, type);
		} catch (error) {
			console.error('Failed to restore uploaded image:', error);
		}
	}

	function clearImage() {
		$form.image = undefined;
		if (browser) localStorage.removeItem(IMAGE_STORAGE_KEY);
	}

	$effect(() => {
		restoreImage();
	});

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

				response = await fetch('/api/search/tags', {
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

				response = await fetch('/api/search/images', {
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
			hasSearched = true;
			haptic(results.length > 0 ? 'success' : 'medium');

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
			haptic('error');
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
		detailsOpen = true;
		haptic('light');
	};

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		$form.image = target.files?.[0];
		if ($form.image) persistImage($form.image);
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
			persistImage($form.image);
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
			haptic('light');
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

	let inTelegram = $state(false);
	$effect(() => {
		if (browser) inTelegram = !!getTelegramWebApp();
	});

	// Inside Telegram, drive the native MainButton instead of our own submit
	// button - the search action then looks and feels like a normal Telegram
	// UI element rather than a website button.
	$effect(() => {
		if (!browser || !getTelegramWebApp()) return;

		return useMainButton({
			text: isSearching ? 'Searching…' : 'Search',
			enabled: canSearch() && !isSearching,
			loading: isSearching,
			onClick: () => performSearch()
		});
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

<div class="min-h-screen">
	<!-- Header: mix-sv-style compact search bar (pill inputs, tight rows) -->
	<div class="sticky top-0 z-20 border-b border-base-content/15 bg-neutral/95">
		<div class="container mx-auto max-w-7xl px-3 py-2">
			<form onsubmit={handleSubmit} class="flex flex-col gap-2">
				<!-- The actual input, full width -->
				<div class="w-full">
					{#if $form.searchType === 'image'}
						<div
							class="field-control flex min-h-[38px] cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-2 text-sm transition-colors {dragActive
								? 'border-primary bg-primary/10'
								: ''}"
							role="button"
							tabindex="0"
							onclick={() => !hasImage && initiateImageUpload()}
							onkeydown={(e) => {
								if ((e.key === 'Enter' || e.key === ' ') && !hasImage) {
									e.preventDefault();
									initiateImageUpload();
								}
							}}
							ondragenter={handleDrag}
							ondragover={handleDrag}
							ondragleave={handleDrag}
							ondrop={handleDrop}
						>
							{#if hasImage}
								<span class="truncate font-medium text-primary">📁 {selectedFileName}</span>
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										clearImage();
									}}
									class="shrink-0 cursor-pointer text-base-content/50 transition-colors hover:text-red-400"
									aria-label="Remove image"
								>
									×
								</button>
							{:else}
								<span class="text-base-content/60">Click or drag & drop an image to search…</span>
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

				<!-- Everything else: one dense, wrapping row -->
				<div class="flex flex-wrap items-center gap-1.5">
					<Button
						type="button"
						size="xs"
						variant={$form.searchType === 'image' ? 'primary' : 'subtle'}
						icon={FluentImage24Regular}
						onclick={() => ($form.searchType = 'image')}
					>
						Image
					</Button>
					<Button
						type="button"
						size="xs"
						variant={$form.searchType === 'tags' ? 'primary' : 'subtle'}
						icon={FluentTag24Regular}
						onclick={() => ($form.searchType = 'tags')}
					>
						Tags
					</Button>

					<div class="w-32 min-w-0">
						<CollectionSelector bind:selectedCollection={$form.collection} collections={data.meta?.datasets ?? {}} />
					</div>

					<div class="w-36 min-w-0">
						<DateFilter bind:startDate={$form.startDate} bind:endDate={$form.endDate} />
					</div>

					<Button
						href="/history"
						size="xs"
						variant="secondary"
						icon={FluentHistory24Regular}
						class="hidden lg:inline-flex"
					>
						History
					</Button>

					{#if !inTelegram}
						<Button
							type="submit"
							size="xs"
							disabled={isSearching || !canSearch()}
							loading={isSearching}
							icon={FluentSearch24Regular}
							class="ml-auto"
						>
							{isSearching ? 'Searching…' : 'Search'}
						</Button>
					{/if}
				</div>
			</form>
		</div>
	</div>

	<!-- Error -->
	{#if searchError}
		<div class="container mx-auto max-w-7xl px-4 py-4">
			<div class="panel border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
				{searchError}
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if isSearching}
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="flex items-center justify-center gap-2 text-base-content/70">
				<span class="loading loading-spinner loading-md text-primary"></span>
				<span class="text-sm">Searching…</span>
			</div>
		</div>
	{:else if searchResults.length > 0}
		<div class="fade_in container mx-auto max-w-7xl px-4 py-4">
			<div class="mb-3 flex items-center justify-between">
				<div class="text-sm text-base-content/70">
					Found {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
				</div>
				<div class="text-xs text-base-content/60">
					Total: {Object.values(data.meta?.datasets || {})
						.reduce((a, b) => a + b, 0)
						.toLocaleString()} items
				</div>
			</div>
			<div
				class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
			>
				{#each searchResults as result, index}
					<SearchResultCell {result} onclick={() => showModal(index)} />
				{/each}
			</div>
		</div>
	{:else if hasSearched}
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="panel-muted mx-auto max-w-md p-12 text-center">
				<div class="text-4xl opacity-20">🔍</div>
				<h3 class="editorial-title mt-4 text-lg text-base-content">No matches found</h3>
				<p class="mt-2 text-sm text-base-content/60">Try different tags, a wider date range, or another collection.</p>
			</div>
		</div>
	{/if}

	<DetailsModal {details} bind:open={detailsOpen} />
</div>
