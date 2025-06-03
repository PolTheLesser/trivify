import axios from 'axios';

// Base URL from env or default
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

/**
 * axiosDefault
 *
 * Diese Datei konfiguriert die globale axios-Instanz mit einer Basis-URL und aktiviert mitCredentials für Cookies.
 * Außerdem wird ein Request-Interceptor definiert, der den Authentifizierungs-Token aus localStorage automatisch
 * in den Authorization-Header bei jedem Request einfügt.
 *
 * Funktionalitäten:
 * - Setzt globale Basis-URL für alle axios-Requests
 * - Aktiviert mitCredentials für Cookie-Übertragung
 * - Fügt automatisch Authentifizierungs-Token aus localStorage als Bearer-Token bei Requests hinzu
 */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axios;
