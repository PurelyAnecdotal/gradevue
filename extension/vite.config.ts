import { copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	publicDir: false,
	build: {
		outDir: resolve(dir, 'dist'),
		emptyOutDir: true,
		minify: false,
		lib: {
			entry: resolve(dir, 'src/background.ts'),
			formats: ['es'],
			fileName: () => 'background.js'
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true
			}
		}
	},
	resolve: {
		alias: {
			$lib: resolve(dir, '../src/lib')
		}
	},
	plugins: [
		{
			name: 'copy-extension-static',
			closeBundle() {
				copyFileSync(resolve(dir, 'manifest.json'), resolve(dir, 'dist/manifest.json'));
				copyFileSync(resolve(dir, 'content.js'), resolve(dir, 'dist/content.js'));
			}
		}
	]
});
