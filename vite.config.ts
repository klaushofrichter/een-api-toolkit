import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EenApiToolkit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      },
      // Suppress warning about dynamic/static import mixing - not relevant for single-file library bundle
      // This warning occurs because service.ts is dynamically imported by store.ts (for circular dep)
      // but statically imported by index.ts. Since we bundle to a single file, chunking doesn't apply.
      onwarn(warning, warn) {
        if (warning.code === 'MIXED_EXPORTS') {
          return
        }
        // Specifically suppress the circular dependency chunking warning for auth/service.ts
        if (warning.message &&
            warning.message.includes('dynamic import will not move module into another chunk') &&
            warning.message.includes('auth/service.ts')) {
          return
        }
        warn(warning)
      }
    },
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**']
  }
})
