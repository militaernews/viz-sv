<script lang="ts">
	import '../app.css';
	import CookieBanner from '$lib/component/CookieBanner.svelte';

	let { children } = $props();
</script>

<div class=" container mx-auto h-screen max-w-3xl" style="font-family:'HP Simplified'">
	{@render children()}
</div>

<CookieBanner />
