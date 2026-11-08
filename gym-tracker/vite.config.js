import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Względne ścieżki - zbudowana appka działa z dowolnego folderu/hostingu.
  base: './',
})
