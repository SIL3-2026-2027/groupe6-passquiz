import axios from 'axios';

export const TOKEN_KEY = 'passquiz_token';

const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.startsWith('/auth/login');

        if (error.response?.status === 401 && !isAuthRoute && localStorage.getItem(TOKEN_KEY)) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);

/**
 * Message d'erreur lisible à partir d'une erreur axios.
 */
export function errorMessage(error) {
    return error.response?.data?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Erreurs de validation (422) indexées par champ : { email: 'message' }.
 */
export function validationErrors(error) {
    const errors = error.response?.status === 422 ? error.response.data.errors ?? {} : {};

    return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]]));
}

/**
 * Convertit un objet en FormData (envoi de fichiers). Les booléens deviennent 1/0.
 */
export function toFormData(values, method = null) {
    const form = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }

        if (typeof value === 'boolean') {
            form.append(key, value ? '1' : '0');
        } else if (value === null) {
            form.append(key, '');
        } else {
            form.append(key, value);
        }
    });

    if (method) {
        form.append('_method', method);
    }

    return form;
}

/**
 * Télécharge un fichier protégé par le token (ex. certificat PDF).
 */
export async function downloadFile(url, fileName) {
    const response = await api.get(url, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
}

export default api;
