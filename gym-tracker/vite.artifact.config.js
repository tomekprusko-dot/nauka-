import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Osobny build do opublikowania appki w Claude (npm run build:artifact).
// React NIE jest wklejany do paczki - strona ładuje go z CDN (cdnjs),
// a tutaj mówimy bundlerowi: "react" to globalna zmienna React itd.
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'dist-artifact',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
      output: {
        format: 'iife',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
        },
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
})
