import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true, // nötig, wenn du HttpOnly‑Cookies nutzt
});

/**
 * axiosInstance
 *
 * Diese Datei erstellt eine eigene axios-Instanz mit konfigurierter Basis-URL und aktiviert die
 * Übertragung von HttpOnly-Cookies (withCredentials).
 * Zusätzlich wird ein Interceptor eingebaut, der bei jedem Request einen im localStorage gespeicherten
 * Authentifizierungstoken im Authorization-Header mitsendet.
 *
 * Funktionalitäten:
 * - Basis-URL aus Umgebungsvariable setzen
 * - withCredentials aktivieren für Cookie-Handling
 * - Authentifizierungs-Token aus localStorage automatisch an Requests anhängen
 */
instance.interceptors.request.use(cfg => {
    const token = localStorage.getItem('authToken');
    if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

export default instance;
