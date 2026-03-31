const GOOGLE_IDENTITY_SCRIPT_ID = 'google-identity-services';
const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';
const EXCHANGE_REQUEST_TIMEOUT_MS = 15000;

const OAUTH_RETURN_TO_KEY = 'aesop-oauth-return-to';
const OAUTH_STATE_KEY_PREFIX = 'aesop-oauth-state:';

const SOCIAL_PROVIDER_META = {
    google: {
        label: 'Google',
        mode: 'popup',
    },
    kakao: {
        label: '카카오',
        mode: 'redirect',
    },
    naver: {
        label: '네이버',
        mode: 'redirect',
    },
};

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getOAuthProxyBaseUrl = () =>
    trimTrailingSlash(import.meta.env.VITE_OAUTH_PROXY_BASE_URL || '/api/oauth');

const getExchangeEndpoint = (provider) => {
    const explicitEndpoint = import.meta.env[`VITE_${provider.toUpperCase()}_EXCHANGE_ENDPOINT`] || '';

    if (explicitEndpoint) {
        return explicitEndpoint;
    }

    const proxyBaseUrl = getOAuthProxyBaseUrl();
    return proxyBaseUrl ? `${proxyBaseUrl}/${provider}/exchange` : '';
};

const getProviderConfig = (provider) => {
    switch (provider) {
        case 'google':
            return {
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                scope: 'openid profile email',
            };
        case 'kakao':
            return {
                clientId:
                    import.meta.env.VITE_KAKAO_REST_API_KEY ||
                    import.meta.env.VITE_KAKAO_CLIENT_ID ||
                    '',
                exchangeEndpoint: getExchangeEndpoint('kakao'),
            };
        case 'naver':
            return {
                clientId: import.meta.env.VITE_NAVER_CLIENT_ID || '',
                exchangeEndpoint: getExchangeEndpoint('naver'),
            };
        default:
            return null;
    }
};

const getStateStorageKey = (provider) => `${OAUTH_STATE_KEY_PREFIX}${provider}`;

const getStorageList = () => {
    const storages = [];

    try {
        if (window.sessionStorage) {
            storages.push(window.sessionStorage);
        }
    } catch {}

    try {
        if (window.localStorage) {
            storages.push(window.localStorage);
        }
    } catch {}

    return storages;
};

const setStoredValue = (key, value) => {
    getStorageList().forEach((storage) => {
        try {
            storage.setItem(key, value);
        } catch {}
    });
};

const getStoredValue = (key) => {
    for (const storage of getStorageList()) {
        try {
            const value = storage.getItem(key);
            if (value) {
                return value;
            }
        } catch {}
    }

    return '';
};

const removeStoredValue = (key) => {
    getStorageList().forEach((storage) => {
        try {
            storage.removeItem(key);
        } catch {}
    });
};

const createRandomState = () => {
    if (window.crypto?.getRandomValues) {
        const values = new Uint32Array(4);
        window.crypto.getRandomValues(values);
        return Array.from(values, (value) => value.toString(16)).join('');
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const persistOAuthState = (provider, state) => {
    setStoredValue(getStateStorageKey(provider), state);
};

export const validateOAuthState = (provider, incomingState) => {
    const storageKey = getStateStorageKey(provider);
    const expectedState = getStoredValue(storageKey);

    removeStoredValue(storageKey);

    if (!expectedState || !incomingState) {
        return false;
    }

    return expectedState === incomingState;
};

export const rememberSocialReturnTo = (returnTo = '/mypage') => {
    const nextPath = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/mypage';
    setStoredValue(OAUTH_RETURN_TO_KEY, nextPath);
};

export const consumeSocialReturnTo = () => {
    const nextPath = getStoredValue(OAUTH_RETURN_TO_KEY);
    removeStoredValue(OAUTH_RETURN_TO_KEY);

    return nextPath && nextPath.startsWith('/') ? nextPath : '/mypage';
};

export const getSocialProviderLabel = (provider) => SOCIAL_PROVIDER_META[provider]?.label || provider;

const loadGoogleIdentityScript = (() => {
    let scriptPromise;

    return () => {
        if (window.google?.accounts?.oauth2) {
            return Promise.resolve(window.google);
        }

        if (scriptPromise) {
            return scriptPromise;
        }

        scriptPromise = new Promise((resolve, reject) => {
            const existingScript = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);

            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.google), { once: true });
                existingScript.addEventListener(
                    'error',
                    () => reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다.')),
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.id = GOOGLE_IDENTITY_SCRIPT_ID;
            script.src = GOOGLE_IDENTITY_SCRIPT_URL;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.google);
            script.onerror = () => reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다.'));
            document.head.appendChild(script);
        });

        return scriptPromise;
    };
})();

const fetchGoogleUserProfile = async (accessToken) => {
    const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Google 사용자 정보를 불러오지 못했습니다.');
    }

    const payload = await response.json();

    return {
        providerUserId: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        avatarUrl: payload.picture || '',
    };
};

const startGoogleLogin = async () => {
    const config = getProviderConfig('google');

    if (!config?.clientId) {
        throw new Error('Google OAuth Client ID가 설정되지 않았습니다.');
    }

    await loadGoogleIdentityScript();

    return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: config.clientId,
            scope: config.scope,
            prompt: 'select_account',
            callback: async (tokenResponse) => {
                if (tokenResponse?.error) {
                    reject(new Error(tokenResponse.error_description || 'Google 로그인을 완료하지 못했습니다.'));
                    return;
                }

                try {
                    const profile = await fetchGoogleUserProfile(tokenResponse.access_token);
                    resolve({
                        provider: 'google',
                        profile,
                    });
                } catch (error) {
                    reject(error);
                }
            },
            error_callback: (error) => {
                const messageByType = {
                    popup_closed: 'Google 로그인 창이 닫혀 로그인이 취소되었습니다.',
                    popup_failed_to_open: 'Google 로그인 창을 열지 못했습니다. 팝업 설정을 확인해 주세요.',
                    unknown: 'Google 로그인 중 알 수 없는 오류가 발생했습니다.',
                };

                reject(new Error(messageByType[error?.type] || 'Google 로그인 중 오류가 발생했습니다.'));
            },
        });

        tokenClient.requestAccessToken();
    });
};

const buildRedirectUri = (provider) => `${window.location.origin}/auth/callback/${provider}`;

const getProviderSetupError = (provider) => {
    const label = getSocialProviderLabel(provider);
    const config = getProviderConfig(provider);

    if (!config?.clientId) {
        return `${label} OAuth 설정값이 없습니다. .env.local에 클라이언트 키를 추가해 주세요.`;
    }

    if (SOCIAL_PROVIDER_META[provider]?.mode === 'redirect' && !config.exchangeEndpoint) {
        return `${label} OAuth를 완료하려면 토큰 교환 엔드포인트가 필요합니다.`;
    }

    return '';
};

const buildAuthorizeUrl = (provider) => {
    const config = getProviderConfig(provider);
    const redirectUri = buildRedirectUri(provider);
    const state = createRandomState();

    persistOAuthState(provider, state);

    if (provider === 'kakao') {
        const url = new URL('https://kauth.kakao.com/oauth/authorize');
        url.searchParams.set('client_id', config.clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', state);
        return url.toString();
    }

    if (provider === 'naver') {
        const url = new URL('https://nid.naver.com/oauth2.0/authorize');
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', config.clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('state', state);
        // Force account re-authentication so testers can switch away from a previously signed-in Naver account.
        url.searchParams.set('auth_type', 'reauthenticate');
        return url.toString();
    }

    throw new Error('지원하지 않는 소셜 로그인입니다.');
};

export const prepareRedirectSocialLogin = (provider, options = {}) => {
    const setupError = getProviderSetupError(provider);

    if (setupError) {
        throw new Error(setupError);
    }

    rememberSocialReturnTo(options.returnTo);
    return buildAuthorizeUrl(provider);
};

const startRedirectLogin = (provider, options = {}) => {
    window.location.assign(prepareRedirectSocialLogin(provider, options));
    return null;
};

const normalizeProfilePayload = (provider, payload) => {
    const source = payload?.profile || payload?.user || payload?.data || payload;
    const response = source?.response || source;

    if (!response || typeof response !== 'object') {
        throw new Error('소셜 로그인 응답을 해석하지 못했습니다.');
    }

    if (provider === 'kakao') {
        return {
            providerUserId: response.id || response.sub || '',
            email: response.email || response.kakao_account?.email || '',
            name:
                response.name ||
                response.properties?.nickname ||
                response.kakao_account?.profile?.nickname ||
                '',
            avatarUrl:
                response.picture ||
                response.properties?.profile_image ||
                response.kakao_account?.profile?.profile_image_url ||
                '',
            phone: response.phone || response.kakao_account?.phone_number || '',
        };
    }

    if (provider === 'naver') {
        return {
            providerUserId: response.id || response.sub || '',
            email: response.email || '',
            name: response.name || response.nickname || '',
            avatarUrl: response.profile_image || response.picture || '',
            phone: response.mobile || response.phone || '',
        };
    }

    return {
        providerUserId: response.id || response.sub || '',
        email: response.email || '',
        name: response.name || '',
        avatarUrl: response.picture || response.avatarUrl || '',
        phone: response.phone || '',
    };
};

const parseErrorPayload = async (response) => {
    try {
        const payload = await response.json();
        return payload?.message || payload?.error_description || payload?.error || '';
    } catch {
        return '';
    }
};

const fetchWithTimeout = async (input, init = {}, timeoutMs = EXCHANGE_REQUEST_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('소셜 로그인 서버 응답이 지연되고 있습니다. 서버 설정을 확인해 주세요.');
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
};

export const beginSocialLogin = async (provider, options = {}) => {
    if (provider === 'google') {
        rememberSocialReturnTo(options.returnTo);
        return startGoogleLogin();
    }

    if (provider === 'kakao' || provider === 'naver') {
        return startRedirectLogin(provider, options);
    }

    throw new Error('지원하지 않는 소셜 로그인입니다.');
};

export const completeRedirectSocialLogin = async (provider, searchParams) => {
    const config = getProviderConfig(provider);
    const exchangeEndpoint = config?.exchangeEndpoint;

    if (!exchangeEndpoint) {
        throw new Error(`${getSocialProviderLabel(provider)} OAuth를 완료하려면 토큰 교환 엔드포인트가 필요합니다.`);
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
        throw new Error(errorDescription || `${getSocialProviderLabel(provider)} 로그인이 취소되었습니다.`);
    }

    if (!code) {
        throw new Error('인증 코드가 없어 소셜 로그인을 완료할 수 없습니다.');
    }

    if (!validateOAuthState(provider, state)) {
        throw new Error('보안 검증에 실패했습니다. 다시 로그인해 주세요.');
    }

    const response = await fetchWithTimeout(exchangeEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            provider,
            code,
            state,
            redirectUri: buildRedirectUri(provider),
        }),
    });

    if (!response.ok) {
        const errorMessage = await parseErrorPayload(response);
        throw new Error(errorMessage || `${getSocialProviderLabel(provider)} 계정 정보를 가져오지 못했습니다.`);
    }

    const payload = await response.json();

    return {
        provider,
        profile: normalizeProfilePayload(provider, payload),
    };
};

export const isRedirectSocialProvider = (provider) => SOCIAL_PROVIDER_META[provider]?.mode === 'redirect';
