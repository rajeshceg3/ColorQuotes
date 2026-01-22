import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    fs: {
      // Deny access to sensitive files and directories
      deny: ['.env', '.env.*', '*.{pem,crt}', '.git', '.hg', '.svn', '.idea', 'node_modules'],
    },
  },
})
