<script lang="ts">
	// Proper Fluent icons
	import FluentDismiss24Regular from '~icons/fluent/dismiss-24-regular';
	import FluentOpen24Regular from '~icons/fluent/open-24-regular';
	import FluentChat24Regular from '~icons/fluent/chat-24-regular';
	import FluentCloudWords24Regular from '~icons/fluent/cloud-words-24-regular';
	import FluentLink24Regular from '~icons/fluent/link-24-regular';

	import { formatDate } from '$lib/util';
	import type { SearchResult } from '$lib/SearchResult';

	interface Props {
		dialog?: HTMLDialogElement;
		details: SearchResult | null;
	}

	let { dialog = $bindable(), details }: Props = $props();

	// Derived values using $derived rune
	const sourceLink: string = $derived(
		details?.invite_hash && !details?.user_name
			? `https://t.me/c/${details?.chat_id}/${details?.msg_id}`
			: details?.user_name
				? `https://t.me/${details.user_name}/${details.msg_id}`
				: ''
	);

	const backupLink: string = $derived(
		details?.msg_id ? `https://t.me/nn_backup/${details.msg_id}` : ''
	);

	const inviteLink: string = $derived(
		details?.invite_hash ? `https://t.me/joinchat/${details.invite_hash}` : ''
	);

	function closeModal(): void {
		dialog?.close();
	}

	function handleImageError(event: Event): void {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.onerror = null;
			target.src = '/placeholder.svg';
		}
	}

	function handleBackdropClick(event: Event): void {
		event.preventDefault();
		closeModal();
	}

	function getSimilarityColor(similarity: number): string {
		if (similarity > 0.9) return 'text-emerald-500';
		if (similarity > 0.75) return 'text-blue-500';
		if (similarity > 0.5) return 'text-amber-500';
		if (similarity > 0.35) return 'text-orange-500';
		if (similarity > 0.1) return 'text-gray-500';
		return 'text-red-500';
	}
</script>

<dialog
	bind:this={dialog}
	class="modal fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
>
	{#if details}
		<div
			class="modal-box relative z-10 mx-4 max-w-2xl rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800"
			>
				<div class="flex items-center gap-3">
					<div>
						<div class="flex items-center gap-3">
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
								{details?.display_name}
								<span class="font-normal text-gray-500 dark:text-gray-400">
									{#if details?.bias}
										• {details.bias}
									{/if}
								</span>
							</h2>
						</div>
						<div class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
							<span class={getSimilarityColor(details.similarity)}>
								{(details.similarity * 100).toFixed(1)}%
							</span>{' • '}{formatDate(details.posted_at)}
						</div>
						{#if details?.tags?.length}
							<div
								class="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 mt-2 flex gap-2 overflow-x-auto"
							>
								{#each details.tags as tag}
									<span
										class="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
									>
										{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<button
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
					onclick={closeModal}
					aria-label="Close modal"
					type="button"
				>
					<FluentDismiss24Regular class="h-4 w-4 text-gray-500 dark:text-gray-400" />
				</button>
			</div>

			<!-- Image Section -->
			<div class="p-6">
				<div class="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
					<img
						src="data:image/png;base64,{details.img}"
						class="h-auto max-h-[50vh] w-full object-contain"
						alt="Full resolution image from {details?.display_name || 'unknown source'}"
						onerror={handleImageError}
					/>
				</div>

				<!-- Action Buttons -->
				<div class="mt-6 flex gap-3">
					{#if sourceLink}
						<a
							class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
							href={sourceLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FluentChat24Regular class="h-4 w-4" />
							Original Message
							<FluentOpen24Regular class="h-3 w-3 opacity-60" />
						</a>
					{/if}

					{#if inviteLink && details?.invite_hash && !details?.user_name}
						<a
							class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
							href={inviteLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FluentLink24Regular class="h-4 w-4" />
							Join Chat
							<FluentOpen24Regular class="h-3 w-3 opacity-60" />
						</a>
					{/if}

					{#if backupLink}
						<a
							class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
							href={backupLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FluentCloudWords24Regular class="h-4 w-4" />
							Backup
							<FluentOpen24Regular class="h-3 w-3 opacity-60" />
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Modern Backdrop -->
		<form
			method="dialog"
			class="modal-backdrop fixed inset-0 flex items-center justify-center bg-black/60"
		>
			<button
				aria-label="Close modal"
				onclick={handleBackdropClick}
				type="submit"
				class="absolute inset-0">close</button
			>
		</form>
	{/if}
</dialog>
