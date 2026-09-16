<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CookieBanner from '$lib/component/CookieBanner.svelte';
	import DockNav from '$lib/component/DockNav.svelte';
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

		const goHome = () => goto('/');
		webApp.BackButton.show();
		webApp.BackButton.onClick(goHome);
		return () => webApp.BackButton.offClick(goHome);
	});
</script>

<div class="dock-spacer min-h-screen lg:pb-0">
	{@render children()}
</div>

<DockNav />
{#if !inTelegram}
	<CookieBanner />
{/if}
