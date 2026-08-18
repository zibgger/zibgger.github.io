// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://zibgger.github.io',
  base: '/',
  server: {
    host: '0.0.0.0',
  },
});
