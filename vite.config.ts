import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [tailwindcss(), sveltekit({ adapter: adapter(), preprocess: vitePreprocess() })],
	// Keep the worker URL import in Vite's transform pipeline.
	optimizeDeps: { exclude: ['svelte-maplibre-gl'] },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		fs: {
			allow: mode === 'development' ? ['data'] : []
		}
	}
}));
