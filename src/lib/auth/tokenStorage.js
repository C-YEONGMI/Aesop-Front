const AUTH_TOKENS_STORAGE_KEY = 'aesop-auth-tokens';
const EXPIRY_BUFFER_MS = 30000;

const createEmptyTokenState = () => ({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    refreshStrategy: null,
});

const readPersistedTokens = () => {
    if (typeof window === 'undefined') {
        return createEmptyTokenState();
    }

    try {
        const rawValue = window.localStorage.getItem(AUTH_TOKENS_STORAGE_KEY);

        if (!rawValue) {
            return createEmptyTokenState();
        }

        const parsedValue = JSON.parse(rawValue);

        return {
            accessToken: parsedValue?.accessToken || null,
            refreshToken: parsedValue?.refreshToken || null,
            accessTokenExpiresAt: parsedValue?.accessTokenExpiresAt || null,
            refreshTokenExpiresAt: parsedValue?.refreshTokenExpiresAt || null,
            refreshStrategy:
                parsedValue?.refreshStrategy ||
                (parsedValue?.refreshToken
                    ? 'body'
                    : parsedValue?.refreshTokenExpiresAt
                      ? 'cookie'
                      : null),
        };
    } catch {
        return createEmptyTokenState();
    }
};

let inMemoryTokens = readPersistedTokens();

export const readTokenState = () => ({ ...inMemoryTokens });

export const getAccessToken = () => inMemoryTokens.accessToken || null;

export const getRefreshToken = () => inMemoryTokens.refreshToken || null;

export const getRefreshStrategy = () => inMemoryTokens.refreshStrategy || null;

export const getTokenExpiry = () => inMemoryTokens.accessTokenExpiresAt || null;

export const getRefreshTokenExpiry = () => inMemoryTokens.refreshTokenExpiresAt || null;

export const isTokenExpired = (expiresAt, bufferMs = EXPIRY_BUFFER_MS) => {
    if (!expiresAt) {
        return true;
    }

    const expiresAtTimestamp = new Date(expiresAt).getTime();

    if (!Number.isFinite(expiresAtTimestamp)) {
        return true;
    }

    return expiresAtTimestamp <= Date.now() + bufferMs;
};

export const hasValidAccessToken = () =>
    Boolean(getAccessToken() && !isTokenExpired(getTokenExpiry()));

export const hasUsableRefreshToken = () =>
    Boolean(
        (
            (getRefreshStrategy() === 'cookie' && getRefreshTokenExpiry()) ||
            getRefreshToken()
        ) &&
            !isTokenExpired(getRefreshTokenExpiry())
    );

export const setAuthTokens = (tokens = {}) => {
    inMemoryTokens = {
        accessToken: tokens.accessToken || null,
        refreshToken: tokens.refreshToken || null,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt || null,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt || null,
        refreshStrategy:
            tokens.refreshStrategy ||
            (tokens.refreshToken ? 'body' : tokens.refreshTokenExpiresAt ? 'cookie' : null),
    };

    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify(inMemoryTokens));
};

export const clearAuthTokens = () => {
    inMemoryTokens = createEmptyTokenState();

    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(AUTH_TOKENS_STORAGE_KEY);
};
