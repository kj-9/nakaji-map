import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		baseURL: 'http://localhost:4173',
		locale: 'ja-JP',
		timezoneId: 'Asia/Tokyo',
		screenshot: 'on'
	},
	webServer: {
		command: 'pnpm build && pnpm preview --host 127.0.0.1',
		url: 'http://localhost:4173',
		timeout: 120000
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
});
