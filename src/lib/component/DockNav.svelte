<script lang="ts">
	import { page } from '$app/state';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHistory24Regular from '~icons/fluent/history-24-regular';

	const items = [
		{ href: '/', label: 'Search', icon: FluentSearch24Regular },
		{ href: '/history', label: 'History', icon: FluentHistory24Regular }
	];
</script>

<nav class="dock lg:hidden">
	{#each items as item}
		<a href={item.href} class:active={page.url.pathname === item.href} aria-label={item.label}>
			<item.icon class="size-5" />
		</a>
	{/each}
</nav>
