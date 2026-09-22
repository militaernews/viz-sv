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

	// Actively checks for a new service worker on every load instead of
	// waiting for the browser's own (slower, sometimes-throttled) update
	// heuristics, and reloads once the new one takes over - installed PWAs in
	// particular can otherwise keep serving an old cached build for a long
	// time even after skipWaiting()/clientsClaim() ship a new deploy.
	$effect(() => {
		if (!browser || !('serviceWorker' in navigator)) return;

		navigator.serviceWorker.getRegistration().then((registration) => registration?.update());

		const onControllerChange = () => location.reload();
		navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
		return () =>
			navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
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
