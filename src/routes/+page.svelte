<script lang="ts">
	import DetailsModal from '../lib/component/DetailsModal.svelte';
	import type { PageProps } from './$types';
	import SearchResultCell from '$lib/component/SearchResultCell.svelte';
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';

	// Using proper Fluent icons
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHistory24Regular from '~icons/fluent/history-24-regular';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';
	import type { SearchResult } from '$lib/SearchResult';
	import type { SearchHistoryEntry } from '$lib/SearchHistoryEntry';
	import DateFilter from '$lib/component/DateFilter.svelte';
	import TagsInput from '$lib/component/TagsInput.svelte';
	import ImageUpload from '$lib/component/ImageUpload.svelte';

	let { form }: PageProps = $props();
	let dragActive = $state(false);
	let isLoading = $state(false);
	let fileInput: HTMLInputElement;
	let tags = $state<string[]>([]);
	let tagInput = $state('');
	let tagInputElement: HTMLInputElement;

	// Date states
	let startDate = $state('');
	let endDate = $state('');

	// Tab state
	let activeTab = $state<'image' | 'tags'>('image');

	// Add reactive state for selected file
	let selectedFile = $state<File | null>(null);

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
	async function saveToHistory(results: SearchResult[], imageFileName?: string) {
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
					tags: [...tags],
					startDate,
					endDate,
					imageFileName
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

	// Load search history
	function loadSearchHistory(): Promise<SearchHistoryEntry[]> {
		if (!browser) return Promise.resolve([]);

		try {
			const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
			return Promise.resolve(history);
		} catch (error) {
			console.error('Failed to load search history:', error);
			return Promise.resolve([]);
		}
	}

	// Navigate to history page - with fallback to show history in console/alert
	async function goToHistory() {
		try {
			// Try to navigate to history page
			window.location.href = '/history';
		} catch (error) {
			// Fallback: show history in a simple way
			const history = await loadSearchHistory();
			if (history.length === 0) {
				alert('No search history found.');
				return;
			}

			// Create a simple history display
			const historyDisplay = history
				.map(
					(entry, index) =>
						`${index + 1}. ${new Date(entry.timestamp).toLocaleDateString()} - ${entry.results.length} results`
				)
				.join('\n');

			if (
				confirm(
					`Search History:\n\n${historyDisplay}\n\nWould you like to export this history as JSON?`
				)
			) {
				const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `search_history_${new Date().toISOString().split('T')[0]}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		}
	}

	const showModal = (index: number) => {
		const results = form?.data || [];
		details = results[index];
		dialog?.showModal();
		return () => dialog?.close();
	};

	function handleFileChange(event: Event) {
		// Update the selected file state immediately
		const target = event.target as HTMLInputElement;
		selectedFile = target.files?.[0] || null;
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
			selectedFile = e.dataTransfer.files[0];
		}
	}

	function initiateImageUpload() {
		if (!isLoading) {
			fileInput.click();
		}
	}

	function addTag() {
		const trimmedTag = tagInput.trim();
		if (trimmedTag && !tags.includes(trimmedTag)) {
			tags = [...tags, trimmedTag];
			tagInput = '';
			setTimeout(() => tagInputElement?.focus(), 0);
		}
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter((tag) => tag !== tagToRemove);
		setTimeout(() => tagInputElement?.focus(), 0);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		} else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
			e.preventDefault();
			removeTag(tags[tags.length - 1]);
		}
	}

	// Reactive status
	const uploadStatus = $derived(
		isLoading
			? 'loading'
			: form?.error
				? 'error'
				: form?.data && form.data.length > 0
					? 'success'
					: 'idle'
	);

	const hasImage = $derived(!!selectedFile);
	const selectedFileName = $derived(selectedFile?.name || '');
	const displayResults = $derived(form?.data || []);

	// Save to history when new results arrive
	$effect(() => {
		if (form?.data && form.data.length > 0 && !isLoading) {
			const imageFileName = selectedFile?.name;
			saveToHistory(form.data as SearchResult[], imageFileName);
		}
	});
</script>

<svelte:head>
	<title>MN Viz</title>
</svelte:head>

<!-- Hidden form inputs -->
<input type="hidden" name="tags" value={tags.join(',')} />
<input type="hidden" name="startDate" value={startDate} />
<input type="hidden" name="endDate" value={endDate} />

<!-- Main Container -->
<div class="bg-base-100 min-h-screen">
	<!-- Compact Header -->
	<div class="bg-base-100/95 border-base-200 sticky top-0 z-10 border-b backdrop-blur-sm">
		<div class="container mx-auto max-w-7xl px-4 py-2">
			<form
				method="POST"
				enctype="multipart/form-data"
				use:enhance={() => {
					isLoading = true;
					dragActive = false;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
			>
				<div class="flex flex-row">
					<!-- Left Tabs (Vertical) with DaisyUI lifted styling -->
					<div class="border-base-200 flex flex-row">
						<div class="tabs tabs-lifted tabs-lg flex-col lg:h-full">
							<button
								type="button"
								class={`tab ${activeTab === 'image' ? 'tab-active' : ''}`}
								onclick={() => (activeTab = 'image')}
								title="Image Search"
							>
								<FluentImage24Regular class="h-5 w-5" />
							</button>
							<button
								type="button"
								class={`tab ${activeTab === 'tags' ? 'tab-active' : ''}`}
								onclick={() => (activeTab = 'tags')}
								title="Tag Search"
							>
								<FluentTag24Regular class="h-5 w-5" />
							</button>
						</div>

						<button
							type="button"
							onclick={goToHistory}
							class="btn btn-secondary btn-square btn-sm mt-auto p-1"
							title="Search History"
						>
							<FluentHistory24Regular class="h-4 w-4" />
						</button>
					</div>

					<!-- Main Content Area -->
					<div class="flex flex-col items-center">
						{#if activeTab === 'image'}
							<ImageUpload
								bind:fileInput
								{isLoading}
								{uploadStatus}
								{dragActive}
								error={form?.error}
								accept="image/*"
								uploadText={selectedFileName || 'Upload image to search'}
								dragText="Drop image here"
								onInitiateUpload={initiateImageUpload}
								onFileChange={handleFileChange}
								onDrag={handleDrag}
								onDrop={handleDrop}
							/>
						{:else}
							<TagsInput
								{tags}
								bind:tagInput
								bind:tagInputElement
								onAddTag={addTag}
								onRemoveTag={removeTag}
								onTagKeydown={handleTagKeydown}
							/>
						{/if}
					</div>

					<!-- Sidebar: Filters + Actions -->
					<div class="border-base-200 space-y-3 border-l p-4 lg:col-span-1">
						<DateFilter bind:startDate bind:endDate />

						<!-- Action Buttons -->
						<div class="space-y-1">
							<button
								type="submit"
								disabled={isLoading}
								class="btn btn-primary btn-sm w-full gap-1"
							>
								<FluentSearch24Regular class="h-3 w-3" />
								Search
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>

	<!-- Results -->
	{#if displayResults.length > 0}
		<div class="container mx-auto max-w-7xl px-6 py-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each displayResults as result, index}
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
