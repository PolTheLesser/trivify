import axios from 'axios';
import { useServerStatus } from '../contexts/ServerStatusContext';

const instance = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

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
