import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		allowedHosts: ['wilted-flower', 'gradecompass.localhost', 'jb.quetzal-vega.ts.net', '.ts.net']
	}
});
