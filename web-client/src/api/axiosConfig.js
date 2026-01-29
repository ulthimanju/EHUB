import axios from 'axios';
import { User } from 'oidc-client-ts';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the access token
axiosInstance.interceptors.request.use(
    (config) => {
        const oidcStorage = sessionStorage.getItem(`oidc.user:http://localhost:9090/realms/ehub-realm:web-client`);
        if (oidcStorage) {
            const user = User.fromStorageString(oidcStorage);
            if (user && user.access_token) {
                config.headers.Authorization = `Bearer ${user.access_token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
