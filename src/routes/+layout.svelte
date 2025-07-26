<script lang="ts">
	import '../app.css';
	import CookieBanner from '$lib/component/CookieBanner.svelte';

	let { children } = $props();
</script>

<div class=" container mx-auto h-screen max-w-3xl">
	{@render children()}
</div>

<CookieBanner />
