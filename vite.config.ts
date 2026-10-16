import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function katexWoff2Only(): Plugin {
  return {
    name: 'katex-woff2-only',
    enforce: 'pre',
    transform(source, id) {
      const normalizedId = id.replaceAll('\\', '/')
      if (!normalizedId.includes('/node_modules/katex/dist/katex.min.css')) {
        return null
      }

      return source
        .replace(/,url\([^)]*\.woff\)\s*format\("woff"\)/g, '')
        .replace(/,url\([^)]*\.ttf\)\s*format\("truetype"\)/g, '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), katexWoff2Only()],
})
