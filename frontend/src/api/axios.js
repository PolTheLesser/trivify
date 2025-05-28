import axios from 'axios';

const instance = axios.create({
    baseURL: "/api",
    withCredentials: true, // nötig, wenn du HttpOnly‑Cookies nutzt
});

// Falls du localStorage nutzt:
instance.interceptors.request.use(cfg => {
    const token = localStorage.getItem('authToken');
    if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

export default instance;
