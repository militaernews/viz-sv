<script lang="ts">
	import { CookieManager } from '@boxfish-studio/sveltekit-cookie-manager';
	import type { SKCMConfiguration } from '@boxfish-studio/sveltekit-cookie-manager';

	const configuration: SKCMConfiguration = {
		disclaimer: {
			title: 'This website uses cookies',
			body: 'By using this site, you agree with our use of cookies'
		},
		theme: {
			primary: '#e6a527',
			dark: '#14283f',
			medium: '#a89e8e',
			light: '#fff7e8'
		}
	};
</script>

<CookieManager {configuration} />
