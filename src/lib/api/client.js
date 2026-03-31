import { runRefreshFlow } from '../auth/refreshManager';
import { getAccessToken } from '../auth/tokenStorage';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value = '') => {
    const trimmedValue = trimTrailingSlash(value);

    if (!trimmedValue) {
        return '';
    }

    if (/\/api$/i.test(trimmedValue)) {
        return trimmedValue;
    }

    return `${trimmedValue}/api`;
};

const getApiBaseUrl = () => normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || '');

const toRequestUrl = (path) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = getApiBaseUrl();

    return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

const parseResponseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    if (contentType.includes('text/')) {
        return response.text();
    }

    return null;
};

const buildHeaders = ({ headers, data, auth }) => {
    const nextHeaders = new Headers(headers || {});

    if (data !== undefined && !(data instanceof FormData) && !nextHeaders.has('Content-Type')) {
        nextHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
        const accessToken = getAccessToken();

        if (accessToken && !nextHeaders.has('Authorization')) {
            nextHeaders.set('Authorization', `Bearer ${accessToken}`);
        }
    }

    return nextHeaders;
};

export class ApiError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = options.status || 0;
        this.data = options.data ?? null;
    }
}

export const apiRequest = async (path, options = {}) => {
    const {
        method = 'GET',
        data,
        headers,
        credentials = 'include',
        auth = true,
        retryOnAuthError = true,
        signal,
    } = options;

    const executeRequest = async () => {
        const response = await fetch(toRequestUrl(path), {
            method,
            headers: buildHeaders({ headers, data, auth }),
            body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
            credentials,
            signal,
        });

        return response;
    };

    let response = await executeRequest();

    if (response.status === 401 && auth && retryOnAuthError) {
        await runRefreshFlow();
        response = await executeRequest();
    }

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
        const message =
            responseBody?.message ||
            responseBody?.error_description ||
            responseBody?.error ||
            `Request failed with status ${response.status}`;

        throw new ApiError(message, {
            status: response.status,
            data: responseBody,
        });
    }

    return responseBody;
};
