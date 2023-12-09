import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
	console.log('mode', mode);
	return {
		plugins: [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		server: {
			fs: {
				allow: mode == 'development' ? ['data'] : []
			}
		}
	};
});
