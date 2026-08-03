import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Only use the GitHub Pages subpath for production builds meant for github.io
  base: process.env.GITHUB_PAGES === '1' ? '/laszlo-launchpad/' : '/',
})
