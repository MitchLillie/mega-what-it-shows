import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Build scaffold for the kb export, added so the pages can be rendered exactly as the desk sees them:
// .svx pages through mdsvex, `layout: runbook` → the shared frame, `#lib/…` → src/lib, every page prerendered.
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } })],
      adapter: adapter(),
      prerender: { entries: ['/kb'], handleHttpError: 'warn' },
    }),
  ],
});
