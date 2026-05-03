import { defineConfig } from 'vite';
import { extensions, ember, classicEmberSupport } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

// For scenario testing
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);
const isGHPages = process.env.DEPLOY_TARGET === 'gh-pages';

export default defineConfig({
  base: isGHPages ? '/ember-drag-sort/' : '/',
  plugins: [
    ...(isCompat ? [classicEmberSupport()] : []),
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  build: {
    outDir: isGHPages ? 'dist-demo' : undefined,
    rollupOptions: {
      input: isGHPages
        ? { main: 'index.html' }
        : { tests: 'tests/index.html' },
    },
  },
});
