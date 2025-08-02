import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api-server',
      configureServer(server) {
        server.middlewares.use('/api/quotes', (req, res, next) => {
          try {
            const jsonPath = path.resolve('./src/data/quotes.json');
            const data = fs.readFileSync(jsonPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to load quote data from mock API' }));
          }
        });

        server.middlewares.use('/api/gradients', (req, res, next) => {
          try {
            const jsonPath = path.resolve('./src/data/gradients.json');
            const data = fs.readFileSync(jsonPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to load gradient data from mock API' }));
          }
        });
      },
    },
  ],
  server: {
    fs: {
      // Deny access to sensitive files and directories
      deny: ['.env', '.env.*', '*.{pem,crt}', '.git', '.hg', '.svn', '.idea', 'node_modules'],
    },
  },
})
