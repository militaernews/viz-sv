import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		Icons({
			compiler: 'svelte',
			autoInstall: true,
			// Configure for separate files

			iconCustomizer(collection, icon, props) {
				props.mode = 'url';
			}
		}),
		SvelteKitPWA({
			// static/manifest.json is already hand-written and linked from app.html;
			// don't have vite-pwa generate/inject a second one.
			manifest: false,
			// src/service-worker.js is a real Workbox service worker (precaching +
			// runtime image caching) rather than the plugin's auto-generated one.
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.js',
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}']
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	server: {
		allowedHosts: true,
		port: 3011
	}
});
