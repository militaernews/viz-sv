<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CookieBanner from '$lib/component/CookieBanner.svelte';
	import { getTelegramWebApp, initTelegramWebApp } from '$lib/telegram';

	let { children } = $props();

	let inTelegram = $state(false);

	$effect(() => {
		if (!browser) return;
		initTelegramWebApp();
		inTelegram = !!getTelegramWebApp();
	});

	// Telegram's native back button replaces our own nav when embedded.
	$effect(() => {
		const webApp = browser ? getTelegramWebApp() : undefined;
		if (!webApp) return;

		const onHome = page.url.pathname === '/';
		if (onHome) {
			webApp.BackButton.hide();
			return;
		}

		const goHome = () => goto(resolve('/'));
		webApp.BackButton.show();
		webApp.BackButton.onClick(goHome);
		return () => webApp.BackButton.offClick(goHome);
	});
</script>

<div class="min-h-screen">
	{@render children()}
</div>

{#if !inTelegram}
	<CookieBanner />
{/if}
