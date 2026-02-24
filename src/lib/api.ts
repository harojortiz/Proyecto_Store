import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de axios configurada
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // IMPORTANTE: Enviar cookies automáticamente
});

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Interceptor para manejar errores 401 y refrescar token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Si el error es 401 y no es un retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si ya estamos refrescando, encolar la petición
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Intentar refrescar el token (el refreshToken está en cookies httpOnly)
                await authService.refreshToken();

                // Procesar cola de peticiones fallidas
                processQueue(null);

                // Reintentar la petición original
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla, hacer logout
                processQueue(refreshError as Error);

                // Limpiar datos de usuario en localStorage
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
