
// === AUTOMATISCH EINGEFÜGT ===
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
