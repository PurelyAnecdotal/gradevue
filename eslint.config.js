import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default tseslint.config(
	includeIgnoreFile(gitignorePath),
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},
		rules: {
			'no-duplicate-imports': 'error',
			eqeqeq: 'error',
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/no-unsafe-call': 'warn', // incorrectly flags {@render children?.()},
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		name: 'typescript',
		files: ['**/*.ts', '*.ts']
	},
	{
		name: 'svelte',
		files: [
			'**/*.svelte',
			'*.svelte',
			'**/*.svelte.js',
			'*.svelte.js',
			'**/*.svelte.ts',
			'*.svelte.ts'
		],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser
			}
		},
		extends: [tseslint.configs.disableTypeChecked]
	}
);
