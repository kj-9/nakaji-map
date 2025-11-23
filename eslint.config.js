import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: [
			'.DS_Store',
			'node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'package/**',
			'.env',
			'.env.*',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock',
			'**/*.config.{js,cjs,mjs,ts}',
			'.eslintrc.*',
			'**/*.timestamp-*.mjs'
		]
	},
	...svelte.configs['flat/recommended'],
	...tseslint.configs.recommended,
	js.configs.recommended,
	{
		files: ['**/*.{js,ts,mjs,cjs}'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['src/lib/components/PopupContent.svelte'],
		rules: {
			// 外部サイト（YouTube/Google Maps）への直リンクのみのため、SvelteKit 内部ルーティング解決は不要
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	eslintConfigPrettier
];
