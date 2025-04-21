
// === AUTOMATISCH EINGEFÜGT ===
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://quizapp-backend:9090',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
