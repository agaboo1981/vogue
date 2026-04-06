const { defineConfig } = require('vite');
const path = require('node:path');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        product: path.resolve(__dirname, 'product.html'),
        checkout: path.resolve(__dirname, 'checkout.html')
      }
    }
  }
});
