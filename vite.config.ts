import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        product: path.resolve(__dirname, 'product.html'),
        checkout: path.resolve(__dirname, 'checkout.html'),
        privacy: path.resolve(__dirname, 'privacy.html'),
        terms: path.resolve(__dirname, 'terms.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        faq: path.resolve(__dirname, 'faq.html'),
        shipping: path.resolve(__dirname, 'shipping.html'),
        about: path.resolve(__dirname, 'about.html'),
      },
    },
  },
});
