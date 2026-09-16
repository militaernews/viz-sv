<script lang="ts">
	import type { Snippet } from 'svelte';
	import FluentDismiss24Regular from '~icons/fluent/dismiss-24-regular';
	import IconButton from '$lib/component/ui/IconButton.svelte';

	let {
		open = $bindable(false),
		title = '',
		children
	}: {
		open: boolean;
		title?: string;
		children: Snippet;
	} = $props();

	function handleClose() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<div
			class="absolute inset-0 cursor-pointer bg-black/60"
			onclick={handleClose}
			role="presentation"
		></div>

		<div class="animate-slide-up absolute inset-x-0 bottom-0">
			<div
				class="mx-auto flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-2xl border-t border-base-content/20 bg-base-100"
			>
				<div class="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
					<div
						class="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-base-content/25"
					></div>
					{#if title}
						<h3 class="editorial-title text-lg font-bold text-base-content">{title}</h3>
					{:else}
						<div></div>
					{/if}
					<IconButton
						icon={FluentDismiss24Regular}
						label="Close"
						variant="subtle"
						size="sm"
						onclick={handleClose}
					/>
				</div>

				<div class="overflow-y-auto px-5 pb-5">
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}
