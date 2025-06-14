import axios from 'axios';

const instance = axios.create({
    baseURL: "/api",
    withCredentials: true,
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

export const attachServerInterceptor = (setServerDown) => {
    instance.interceptors.response.use(
        res => {
            setServerDown(false); // server responded
            return res;
        },
        err => {
            if (!err.response) {
                console.error('Server nicht erreichbar:', err);
                setServerDown(true);
            }
            return Promise.reject(err);
        }
    );
};

export default instance;
