
// === AUTOMATISCH EINGEFÜGT ===
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://trivify-backend:9090',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
