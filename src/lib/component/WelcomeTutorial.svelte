<script lang="ts">
	import { browser } from '$app/environment';
	import BottomSheet from '$lib/component/BottomSheet.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';
	import FluentTag24Regular from '~icons/fluent/tag-24-regular';
	import FluentCrop24Regular from '~icons/fluent/crop-24-regular';
	import FluentCalendarLtr24Regular from '~icons/fluent/calendar-ltr-24-regular';

	const STORAGE_KEY = 'welcome_tutorial_seen_v1';

	let open = $state(false);

	$effect(() => {
		if (browser && !localStorage.getItem(STORAGE_KEY)) {
			open = true;
		}
	});

	function dismiss() {
		open = false;
		if (browser) localStorage.setItem(STORAGE_KEY, '1');
	}
</script>

<BottomSheet bind:open title="Welcome">
	<div class="space-y-4">
		<p class="text-base-content/80 text-sm">
			Search the collection by tags or by a reference image.
		</p>
		<ul class="text-base-content/80 space-y-3 text-sm">
			<li class="flex gap-3">
				<FluentTag24Regular class="text-primary h-5 w-5 shrink-0" />
				<span
					>Switch to <strong class="text-base-content">Tags</strong> and add one or more keywords to search
					by.</span
				>
			</li>
			<li class="flex gap-3">
				<FluentImage24Regular class="text-primary h-5 w-5 shrink-0" />
				<span
					>Switch to <strong class="text-base-content">Image</strong> and upload or drop a picture to
					search by.</span
				>
			</li>
			<li class="flex gap-3">
				<FluentCrop24Regular class="text-primary h-5 w-5 shrink-0" />
				<span>After picking an image, drag the box over the exact area you want to search by.</span>
			</li>
			<li class="flex gap-3">
				<FluentCalendarLtr24Regular class="text-primary h-5 w-5 shrink-0" />
				<span
					>Optionally narrow results to a date range, then tap <strong class="text-base-content"
						>Search</strong
					>.</span
				>
			</li>
		</ul>
		<Button variant="primary" block onclick={dismiss}>Got it</Button>
	</div>
</BottomSheet>
