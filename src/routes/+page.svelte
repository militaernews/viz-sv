<script lang="ts">
	import DetailsModal from '$lib/component/DetailsModal.svelte';
	import SearchResultCell from '$lib/component/SearchResultCell.svelte';
	import ImageCropPicker from '$lib/component/ImageCropPicker.svelte';
	import WelcomeTutorial from '$lib/component/WelcomeTutorial.svelte';
	import { browser } from '$app/environment';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';
	import FluentCrop24Regular from '~icons/fluent/crop-24-regular';
	import type { SearchResult } from '$lib/SearchResult';
	import type { SearchHistoryEntry } from '$lib/SearchHistoryEntry';
	import DateFilter from '$lib/component/DateFilter.svelte';
	import TagsInput from '$lib/component/TagsInput.svelte';
	import CollectionSelector from '$lib/component/CollectionSelector.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import IconButton from '$lib/component/ui/IconButton.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { getTelegramWebApp, haptic, useMainButton } from '$lib/telegram';

	let { data } = $props();
	const { form } = superForm(data.form);

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
	let detailsOpen = $state(false);
	let details: SearchResult | null = $state(null);
	let cropPickerOpen = $state(false);
	let rawImageFile: File | null = $state(null);

	// Local storage keys
	const HISTORY_STORAGE_KEY = 'search_history_v2';
	const IMAGE_STORAGE_KEY = 'last_uploaded_image';
	const SEARCH_INPUTS_STORAGE_KEY = 'search_inputs_v1';
	const LAST_RESULTS_STORAGE_KEY = 'last_search_results_v1';

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
			localStorage.setItem(
				IMAGE_STORAGE_KEY,
				JSON.stringify({ name: file.name, type: file.type, dataUrl })
			);
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

	// Keeps the tag/date/collection inputs around across a reload, same as the
	// uploaded image.
	function persistSearchInputs() {
		if (!browser) return;
		try {
			localStorage.setItem(
				SEARCH_INPUTS_STORAGE_KEY,
				JSON.stringify({
					tags: $form.tags ?? [],
					startDate: $form.startDate?.toISOString() ?? null,
					endDate: $form.endDate?.toISOString() ?? null,
					collection: $form.collection ?? ''
				})
			);
		} catch (error) {
			console.error('Failed to persist search inputs:', error);
		}
	}

	function restoreSearchInputs() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(SEARCH_INPUTS_STORAGE_KEY);
			if (!raw) return;
			const inputs = JSON.parse(raw);
			if (inputs.tags?.length) $form.tags = inputs.tags;
			if (inputs.startDate) $form.startDate = new Date(inputs.startDate);
			if (inputs.endDate) $form.endDate = new Date(inputs.endDate);
			if (inputs.collection) $form.collection = inputs.collection;
		} catch (error) {
			console.error('Failed to restore search inputs:', error);
		}
	}

	// Keeps the last result grid around across a reload too, so the page isn't
	// blank again until the next search.
	function persistLastResults(results: SearchResult[]) {
		if (!browser) return;
		try {
			localStorage.setItem(LAST_RESULTS_STORAGE_KEY, JSON.stringify(results));
		} catch (error) {
			console.error('Failed to persist last search results:', error);
		}
	}

	function restoreLastResults() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(LAST_RESULTS_STORAGE_KEY);
			if (!raw) return;
			const results: SearchResult[] = JSON.parse(raw);
			if (results.length > 0) {
				searchResults = results;
				hasSearched = true;
			}
		} catch (error) {
			console.error('Failed to restore last search results:', error);
		}
	}

	// Gates the hero-mode CSS transition (see markup below): stays false
	// through the initial restore so a page load that already has cached
	// results jumps straight to the compact layout instead of visibly
	// animating hero -> compact. Flips true a frame later so the collapse
	// still animates once a real search starts.
	let readyForTransition = $state(false);

	$effect(() => {
		restoreImage();
		restoreSearchInputs();
		restoreLastResults();
		requestAnimationFrame(() => {
			readyForTransition = true;
		});
	});

	// Re-persists search inputs whenever tags/dates/collection change.
	$effect(() => {
		persistSearchInputs();
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
	async function saveToHistory(results: SearchResult[], searchParams?: Record<string, unknown>) {
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
					tags: $form.tags ?? [],
					startDate: $form.startDate?.toISOString() ?? '',
					endDate: $form.endDate?.toISOString() ?? ''
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
			persistLastResults(results);

			// Save to history
			await saveToHistory(results, {
				searchType: $form.searchType,
				imageFileName: $form.image?.name || '',
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
	let showValidationError = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!canSearch()) {
			showValidationError = true;
			return;
		}
		showValidationError = false;
		await performSearch();
	}

	const showModal = (index: number) => {
		details = searchResults[index];
		detailsOpen = true;
		haptic('light');
	};

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			rawImageFile = file;
			cropPickerOpen = true;
		}
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

		const file = e.dataTransfer?.files?.[0];
		if (file) {
			const dt = new DataTransfer();
			dt.items.add(file);
			fileInput.files = dt.files;
			rawImageFile = file;
			cropPickerOpen = true;
		}
	}

	function initiateImageUpload() {
		if (!isLoading && !isSearching) {
			fileInput.click();
		}
	}

	// The picker crops the raw upload down to the area the user wants to
	// search by, Google-Lens style, before it becomes the actual search image.
	function handleCropConfirm(croppedFile: File) {
		$form.image = croppedFile;
		persistImage(croppedFile);
		cropPickerOpen = false;
	}

	function handleCropCancel() {
		cropPickerOpen = false;
		if (!$form.image) {
			rawImageFile = null;
			if (fileInput) fileInput.value = '';
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
	const hasImage = $derived(!!$form.image);
	const selectedFileName = $derived($form.image?.name || '');
	// Falls back to the already-cropped image so "adjust crop" still works
	// after a reload, when only the cropped result was persisted.
	const cropSourceFile = $derived(rawImageFile ?? $form.image ?? null);

	// Tag input and image upload sit side by side now (no mode toggle) - either
	// one satisfies search readiness.
	const canSearch = $derived(() => hasImage || ($form.tags?.length || 0) > 0);
	const missingBoth = $derived(showValidationError && !hasImage && ($form.tags?.length || 0) === 0);

	// True only while there's nothing to show yet - no restored last-search
	// results, and no search in flight. Drives the centered "hero" placement;
	// it collapses (see the spacer below) the moment a search starts.
	const heroMode = $derived(!hasSearched && !isSearching);

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

	// Tag input and image upload are both visible at once; the backend only
	// supports one mode per request, so an attached image takes priority.
	$effect(() => {
		if (hasImage) {
			$form.searchType = 'image';
		} else if (($form.tags?.length || 0) > 0) {
			$form.searchType = 'tags';
		}
	});
</script>

<svelte:head>
	<title>MN Viz</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Hero spacer: pushes the sticky search bar down to roughly mid-screen
	     when there's nothing to show yet, then quickly collapses to 0 the
	     moment a search starts, so the bar reads as sliding up into place. -->
	<div
		class="overflow-hidden {readyForTransition
			? 'transition-[height] duration-150 ease-in'
			: ''} {heroMode ? 'h-[52vh]' : 'h-0'}"
	>
		<div class="flex h-full flex-col items-center justify-end px-4 pb-8 text-center">
			<h1 class="editorial-title text-base-content text-4xl sm:text-5xl">MN Viz</h1>
			<p class="text-base-content/60 mt-3 text-sm">
				Search the collection by tags or a reference image.
			</p>
		</div>
	</div>

	<!-- Header: mix-sv-style compact search bar (pill inputs, tight rows) -->
	<div class="border-base-content/15 bg-base-100 sticky top-0 z-20 border-b">
		<div
			class="container mx-auto max-w-7xl px-3 {heroMode ? 'py-6' : 'py-2'} {readyForTransition
				? 'transition-[padding] duration-150 ease-in'
				: ''}"
		>
			<form onsubmit={handleSubmit} class="flex flex-col gap-2">
				<!-- Row 1: tag input, image upload, search - all in one row -->
				<div
					class="flex items-center gap-1.5 rounded-full transition-shadow {dragActive
						? 'ring-primary ring-2'
						: ''}"
					ondragenter={handleDrag}
					ondragover={handleDrag}
					ondragleave={handleDrag}
					ondrop={handleDrop}
				>
					<div class="min-w-0 flex-1">
						<TagsInput
							tags={$form.tags || []}
							bind:tagInput
							bind:tagInputElement
							onAddTag={addTag}
							onRemoveTag={removeTag}
							onTagKeydown={handleTagKeydown}
							invalid={missingBoth}
						/>
					</div>

					<div class="relative shrink-0">
						<IconButton
							type="button"
							size="lg"
							icon={hasImage ? FluentCrop24Regular : FluentImage24Regular}
							label={hasImage
								? `Adjust image crop (${selectedFileName})`
								: 'Upload an image to search'}
							variant={hasImage ? 'primary' : 'subtle'}
							onclick={() => (hasImage ? (cropPickerOpen = true) : initiateImageUpload())}
							style={missingBoth ? 'box-shadow: 0 0 0 2px var(--color-error)' : undefined}
						/>
						{#if hasImage}
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									clearImage();
								}}
								class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white"
								aria-label="Remove image"
							>
								×
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

					{#if !inTelegram}
						<Button
							type="submit"
							size="lg"
							shape="circle"
							disabled={isSearching}
							loading={isSearching}
							icon={FluentSearch24Regular}
							aria-label="Search"
						/>
					{/if}
				</div>
				{#if showValidationError && missingBoth}
					<p class="-mt-1 text-xs text-red-400">Add a tag or upload an image to search.</p>
				{/if}

				<!-- Row 2: collection + date range -->
				<div class="flex items-center gap-1.5">
					<div class="w-32 min-w-0 shrink-0">
						<CollectionSelector
							bind:selectedCollection={$form.collection}
							collections={data.meta?.datasets ?? {}}
						/>
					</div>

					<div class="min-w-0 flex-1">
						<DateFilter bind:startDate={$form.startDate} bind:endDate={$form.endDate} />
					</div>
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
			<div class="text-base-content/70 flex items-center justify-center gap-2">
				<span class="loading loading-spinner loading-md text-primary"></span>
				<span class="text-sm">Searching…</span>
			</div>
		</div>
	{:else if searchResults.length > 0}
		<div class="fade_in container mx-auto max-w-7xl px-4 py-4">
			<div class="mb-3 flex items-center justify-between">
				<div class="text-base-content/70 text-sm">
					Found {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
				</div>
				<div class="text-base-content/60 text-xs">
					Total: {Object.values(data.meta?.datasets || {})
						.reduce((a, b) => a + b, 0)
						.toLocaleString()} items
				</div>
			</div>
			<div
				class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
			>
				{#each searchResults as result, index (result.chat_id + '/' + result.msg_id)}
					<SearchResultCell {result} onclick={() => showModal(index)} />
				{/each}
			</div>
		</div>
	{:else if hasSearched}
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="panel-muted mx-auto max-w-md p-12 text-center">
				<div class="text-4xl opacity-20">🔍</div>
				<h3 class="editorial-title text-base-content mt-4 text-lg">No matches found</h3>
				<p class="text-base-content/60 mt-2 text-sm">
					Try different tags, a wider date range, or another collection.
				</p>
			</div>
		</div>
	{/if}

	<DetailsModal {details} bind:open={detailsOpen} />
	<ImageCropPicker
		bind:open={cropPickerOpen}
		file={cropSourceFile}
		onConfirm={handleCropConfirm}
		onCancel={handleCropCancel}
	/>
	<WelcomeTutorial />
</div>
