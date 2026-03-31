import { apiRequest } from './client';
import {
    readAuthDirectory,
    readLegacyAuthState,
    readPersistedAuthState,
    writeAuthDirectory,
} from '../../app/store/persistence/authPersistence';
import {
    clearAuthTokens,
    getRefreshToken,
    hasUsableRefreshToken,
    hasValidAccessToken,
    readTokenState,
    setAuthTokens,
} from '../auth/tokenStorage';

const DEFAULT_CARRIER = 'KR +82';
const MOCK_AUTH_MODE = 'mock';
const REMOTE_AUTH_MODE = 'remote';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getRemoteApiBaseUrl = () => trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');
const getRemoteAuthBaseUrl = () => trimTrailingSlash(import.meta.env.VITE_AUTH_API_BASE_URL || '');

const getAuthEndpoint = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const remoteAuthBaseUrl = getRemoteAuthBaseUrl();
    const remoteApiBaseUrl = getRemoteApiBaseUrl();

    if (remoteAuthBaseUrl) {
        return `${remoteAuthBaseUrl}${normalizedPath}`;
    }

    if (remoteApiBaseUrl) {
        return `/auth${normalizedPath}`;
    }

    return `/api/auth${normalizedPath}`;
};

export const getAuthMode = () =>
    getRemoteAuthBaseUrl() || getRemoteApiBaseUrl() ? REMOTE_AUTH_MODE : MOCK_AUTH_MODE;

const normalizeValue = (value) => value?.trim().toLowerCase() || '';

const sanitizeUserId = (value) =>
    normalizeValue(value)
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 32);

const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const toSafeUser = (user) => {
    if (!user) {
        return null;
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
};

const toSafeUsers = (users) =>
    (Array.isArray(users) ? users : [])
        .map((user) => toSafeUser(user))
        .filter(Boolean);

const buildUserRecord = (userData, overrides = {}) => {
    const normalizedUserId = sanitizeUserId(userData.userId);
    const normalizedEmail = normalizeValue(userData.email);
    const fallbackEmail = normalizedUserId
        ? `${normalizedUserId}@aesop.member`
        : `guest-${Date.now()}@aesop.member`;

    return {
        id: overrides.id || generateId(),
        userId: normalizedUserId,
        name: userData.name?.trim() || '',
        email: normalizedEmail || fallbackEmail,
        verificationEmail: normalizedEmail,
        password: userData.password || '',
        phone: userData.phone || '',
        carrier: userData.carrier || DEFAULT_CARRIER,
        birthDate: userData.birthDate || '',
        gender: userData.gender || '',
        authMethod: userData.authMethod || 'password',
        socialProvider: userData.socialProvider || '',
        socialId: userData.socialId || '',
        providerLabel: userData.providerLabel || '',
        avatarUrl: userData.avatarUrl || '',
        addresses: overrides.addresses || [],
        createdAt: overrides.createdAt || new Date().toISOString(),
    };
};

const buildSocialUserData = (provider, profileData = {}) => {
    const providerUserId = String(
        profileData.providerUserId || profileData.id || profileData.sub || ''
    ).trim();
    const fallbackUserId = providerUserId ? `${provider}_${providerUserId}` : `${provider}_member`;
    const normalizedUserId = sanitizeUserId(profileData.userId || fallbackUserId) || `${provider}_member`;
    const normalizedEmail = normalizeValue(profileData.email);

    return {
        userId: normalizedUserId,
        name: profileData.name?.trim() || `${provider} member`,
        email: normalizedEmail || `${normalizedUserId}@aesop.member`,
        phone: profileData.phone?.trim() || '',
        birthDate: profileData.birthDate || '',
        gender: profileData.gender || '',
        authMethod: 'social',
        socialProvider: provider,
        socialId: providerUserId,
        providerLabel: provider,
        avatarUrl: profileData.avatarUrl || profileData.picture || '',
    };
};

const findSocialUserIndex = (users, provider, profileData = {}) => {
    const providerUserId = String(
        profileData.providerUserId || profileData.id || profileData.sub || ''
    ).trim();
    const normalizedEmail = normalizeValue(profileData.email);
    const normalizedUserId = sanitizeUserId(profileData.userId || '');

    return users.findIndex((user) => {
        if (
            providerUserId &&
            user.socialProvider === provider &&
            String(user.socialId || '') === providerUserId
        ) {
            return true;
        }

        if (normalizedEmail && normalizeValue(user.email) === normalizedEmail) {
            return true;
        }

        if (normalizedUserId && normalizeValue(user.userId) === normalizedUserId) {
            return true;
        }

        return false;
    });
};

const upsertSocialUser = (users, provider, profileData = {}) => {
    const socialUserData = buildSocialUserData(provider, profileData);
    const existingIndex = findSocialUserIndex(users, provider, socialUserData);

    const nextUser = buildUserRecord(
        socialUserData,
        existingIndex >= 0
            ? {
                  id: users[existingIndex].id,
                  addresses: users[existingIndex].addresses || [],
                  createdAt: users[existingIndex].createdAt,
              }
            : {}
    );

    if (existingIndex === -1) {
        return {
            user: nextUser,
            users: [...users, nextUser],
        };
    }

    const nextUsers = [...users];
    nextUsers[existingIndex] = nextUser;

    return {
        user: nextUser,
        users: nextUsers,
    };
};

const createMockTokens = (userId = 'guest') => {
    const now = Date.now();

    return {
        accessToken: `mock-access-${userId}-${now}`,
        refreshToken: `mock-refresh-${userId}-${now}`,
        accessTokenExpiresAt: new Date(now + 15 * 60 * 1000).toISOString(),
        refreshTokenExpiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
};

const createSessionPayload = ({ user, users = [], provider = null, tokens = null, authMode }) => {
    const safeUser = toSafeUser(user);
    const nextTokens = tokens || createMockTokens(safeUser?.id || 'guest');

    setAuthTokens(nextTokens);

    if (Array.isArray(users) && users.length > 0) {
        writeAuthDirectory(users);
    }

    return {
        isLoggedIn: Boolean(safeUser),
        user: safeUser,
        users: toSafeUsers(users),
        session: {
            accessToken: nextTokens.accessToken || null,
            refreshToken: nextTokens.refreshToken || null,
            accessTokenExpiresAt: nextTokens.accessTokenExpiresAt || null,
            refreshTokenExpiresAt: nextTokens.refreshTokenExpiresAt || null,
            provider: provider || safeUser?.socialProvider || null,
            userId: safeUser?.id || null,
            returnTo: '/',
        },
        meta: {
            initialized: true,
            authMode,
        },
    };
};

const normalizeRemoteSessionPayload = (payload, fallback = {}) => {
    const source = payload?.data || payload || {};
    const tokens = source.tokens || source.session || source;
    const tokenState = readTokenState();
    const user = source.user || source.profile || fallback.user || null;
    const users = Array.isArray(source.users) ? source.users : fallback.users || [];

    return createSessionPayload({
        user,
        users,
        provider: source.provider || tokens.provider || user?.socialProvider || null,
        tokens: {
            accessToken: tokens.accessToken || fallback.tokens?.accessToken || tokenState.accessToken || null,
            refreshToken: tokens.refreshToken || fallback.tokens?.refreshToken || tokenState.refreshToken || null,
            accessTokenExpiresAt:
                tokens.accessTokenExpiresAt ||
                fallback.tokens?.accessTokenExpiresAt ||
                tokenState.accessTokenExpiresAt ||
                null,
            refreshTokenExpiresAt:
                tokens.refreshTokenExpiresAt ||
                fallback.tokens?.refreshTokenExpiresAt ||
                tokenState.refreshTokenExpiresAt ||
                null,
            refreshStrategy:
                tokens.refreshToken || fallback.tokens?.refreshToken
                    ? 'body'
                    : tokens.refreshTokenExpiresAt
                      ? 'cookie'
                      : fallback.tokens?.refreshStrategy ||
                        tokenState.refreshStrategy ||
                        null,
        },
        authMode: REMOTE_AUTH_MODE,
    });
};

const resolvePersistedCurrentUser = () => {
    const persistedAuthState = readPersistedAuthState();
    const legacyAuthState = readLegacyAuthState();
    const currentUserId = persistedAuthState?.user?.id || legacyAuthState?.user?.id || null;
    const users = readAuthDirectory();

    if (currentUserId) {
        const matchedUser = users.find((entry) => entry.id === currentUserId);

        if (matchedUser) {
            return matchedUser;
        }
    }

    return legacyAuthState?.user || persistedAuthState?.user || null;
};

const loginWithMock = async (credentials = {}) => {
    const normalizedIdentifier = normalizeValue(credentials.identifier);
    const users = readAuthDirectory();
    const user = users.find(
        (entry) =>
            entry.password === credentials.password &&
            (
                normalizeValue(entry.email) === normalizedIdentifier ||
                normalizeValue(entry.userId) === normalizedIdentifier
            )
    );

    if (!user) {
        throw new Error('Invalid identifier or password.');
    }

    return createSessionPayload({
        user,
        users,
        provider: user.socialProvider || user.authMethod || 'password',
        authMode: MOCK_AUTH_MODE,
    });
};

const signupWithMock = async (userData = {}) => {
    const users = readAuthDirectory();
    const normalizedUserId = sanitizeUserId(userData.userId);
    const normalizedEmail = normalizeValue(userData.email);

    if (normalizedUserId && users.some((user) => normalizeValue(user.userId) === normalizedUserId)) {
        throw new Error('This user ID is already in use.');
    }

    if (normalizedEmail && users.some((user) => normalizeValue(user.email) === normalizedEmail)) {
        throw new Error('This email is already in use.');
    }

    const nextUser = buildUserRecord(userData);
    const nextUsers = [...users, nextUser];

    writeAuthDirectory(nextUsers);

    return createSessionPayload({
        user: nextUser,
        users: nextUsers,
        provider: 'password',
        authMode: MOCK_AUTH_MODE,
    });
};

const completeSocialLoginWithMock = async ({ provider, profile }) => {
    const users = readAuthDirectory();
    const result = upsertSocialUser(users, provider, profile);

    writeAuthDirectory(result.users);

    return createSessionPayload({
        user: result.user,
        users: result.users,
        provider,
        authMode: MOCK_AUTH_MODE,
    });
};

const migrateLegacyLoggedInSession = () => {
    if (readPersistedAuthState()) {
        return null;
    }

    const legacyAuthState = readLegacyAuthState();

    if (!legacyAuthState?.isLoggedIn || !legacyAuthState?.user) {
        return null;
    }

    const users = readAuthDirectory();
    const matchedUser =
        users.find((entry) => entry.id === legacyAuthState.user.id) || legacyAuthState.user;

    return createSessionPayload({
        user: matchedUser,
        users: users.length > 0 ? users : [matchedUser],
        provider: matchedUser.socialProvider || matchedUser.authMethod || 'password',
        authMode: MOCK_AUTH_MODE,
    });
};

const refreshSessionWithMock = async () => {
    if (!hasUsableRefreshToken()) {
        throw new Error('No refresh token is available.');
    }

    const currentUser = resolvePersistedCurrentUser();

    if (!currentUser) {
        clearAuthTokens();
        return null;
    }

    return createSessionPayload({
        user: currentUser,
        users: readAuthDirectory(),
        provider: currentUser.socialProvider || currentUser.authMethod || 'password',
        authMode: MOCK_AUTH_MODE,
    });
};

const restoreSessionWithMock = async () => {
    const currentUser = resolvePersistedCurrentUser();

    if (currentUser && hasValidAccessToken()) {
        return createSessionPayload({
            user: currentUser,
            users: readAuthDirectory(),
            provider: currentUser.socialProvider || currentUser.authMethod || 'password',
            tokens: readTokenState(),
            authMode: MOCK_AUTH_MODE,
        });
    }

    if (currentUser && hasUsableRefreshToken()) {
        return refreshSessionWithMock();
    }

    const migratedSession = migrateLegacyLoggedInSession();

    if (migratedSession) {
        return migratedSession;
    }

    return null;
};

const logoutWithMock = async () => {
    clearAuthTokens();
    return { success: true };
};

const updateProfileWithMock = async (profileData = {}) => {
    const currentUser = resolvePersistedCurrentUser();
    const users = readAuthDirectory();

    if (!currentUser) {
        throw new Error('A logged-in session is required.');
    }

    const currentUserRecord = users.find((entry) => entry.id === currentUser.id) || currentUser;
    const nextEmail = normalizeValue(profileData.email ?? currentUserRecord.email);
    const duplicatedEmail =
        nextEmail &&
        users.some(
            (entry) => entry.id !== currentUser.id && normalizeValue(entry.email) === nextEmail
        );

    if (duplicatedEmail) {
        throw new Error('This email is already in use.');
    }

    const updatedUser = {
        ...currentUserRecord,
        name: profileData.name?.trim() ?? currentUserRecord.name,
        email: nextEmail || currentUserRecord.email,
        verificationEmail: nextEmail || currentUserRecord.verificationEmail,
        phone: profileData.phone?.trim() ?? currentUserRecord.phone,
    };

    const nextUsers = users.map((entry) => (entry.id === currentUser.id ? updatedUser : entry));

    writeAuthDirectory(nextUsers);

    return createSessionPayload({
        user: updatedUser,
        users: nextUsers,
        provider: updatedUser.socialProvider || updatedUser.authMethod || 'password',
        tokens: hasValidAccessToken() || hasUsableRefreshToken() ? readTokenState() : null,
        authMode: MOCK_AUTH_MODE,
    });
};

const findAccountWithMock = async (identifier = '') => {
    const normalizedIdentifier = normalizeValue(identifier);
    const users = readAuthDirectory();

    return users.some(
        (user) =>
            normalizeValue(user.email) === normalizedIdentifier ||
            normalizeValue(user.userId) === normalizedIdentifier
    );
};

const ensureTestAccountWithMock = async (userData = {}) => {
    const users = readAuthDirectory();
    const normalizedUserId = sanitizeUserId(userData.userId);
    const normalizedEmail = normalizeValue(userData.email);
    const existingIndex = users.findIndex(
        (user) =>
            normalizeValue(user.userId) === normalizedUserId ||
            normalizeValue(user.email) === normalizedEmail
    );

    if (existingIndex === -1) {
        const nextUser = buildUserRecord(userData);
        const nextUsers = [...users, nextUser];

        writeAuthDirectory(nextUsers);

        return createSessionPayload({
            user: nextUser,
            users: nextUsers,
            provider: 'password',
            authMode: MOCK_AUTH_MODE,
        });
    }

    const existingUser = users[existingIndex];
    const updatedUser = buildUserRecord(userData, {
        id: existingUser.id,
        addresses: existingUser.addresses || [],
        createdAt: existingUser.createdAt,
    });
    const nextUsers = [...users];
    nextUsers[existingIndex] = updatedUser;

    writeAuthDirectory(nextUsers);

    return createSessionPayload({
        user: updatedUser,
        users: nextUsers,
        provider: 'password',
        authMode: MOCK_AUTH_MODE,
    });
};

const loginRemote = async (credentials = {}) => {
    const payload = await apiRequest(getAuthEndpoint('/login'), {
        method: 'POST',
        data: credentials,
        auth: false,
        retryOnAuthError: false,
    });

    return normalizeRemoteSessionPayload(payload, {
        users: [],
    });
};

const signupRemote = async (userData = {}) => {
    const payload = await apiRequest(getAuthEndpoint('/signup'), {
        method: 'POST',
        data: userData,
        auth: false,
        retryOnAuthError: false,
    });

    return normalizeRemoteSessionPayload(payload, {
        users: [],
    });
};

const completeSocialLoginRemote = async ({ provider, profile }) => {
    const payload = await apiRequest(getAuthEndpoint('/social/complete'), {
        method: 'POST',
        data: { provider, profile },
        auth: false,
        retryOnAuthError: false,
    });

    return normalizeRemoteSessionPayload(payload, {
        users: [],
    });
};

const restoreSessionRemote = async () => {
    if (!hasValidAccessToken() && !hasUsableRefreshToken()) {
        return null;
    }

    if (!hasValidAccessToken() && hasUsableRefreshToken()) {
        return refreshSessionRemote();
    }

    const payload = await apiRequest(getAuthEndpoint('/me'), {
        method: 'GET',
    });

    return normalizeRemoteSessionPayload(payload, {
        tokens: readTokenState(),
        users: [],
    });
};

const refreshSessionRemote = async () => {
    if (!hasUsableRefreshToken()) {
        throw new Error('No refresh token is available.');
    }

    const payload = await apiRequest(getAuthEndpoint('/refresh'), {
        method: 'POST',
        data: getRefreshToken() ? { refreshToken: getRefreshToken() } : {},
        auth: false,
        retryOnAuthError: false,
    });

    return normalizeRemoteSessionPayload(payload, {
        tokens: readTokenState(),
        user: readPersistedAuthState()?.user || null,
        users: [],
    });
};

const logoutRemote = async () => {
    try {
        await apiRequest(getAuthEndpoint('/logout'), {
            method: 'POST',
            data: getRefreshToken() ? { refreshToken: getRefreshToken() } : {},
            retryOnAuthError: false,
        });
    } finally {
        clearAuthTokens();
    }

    return { success: true };
};

const updateProfileRemote = async (profileData = {}) => {
    const payload = await apiRequest(getAuthEndpoint('/profile'), {
        method: 'PATCH',
        data: profileData,
    });

    return normalizeRemoteSessionPayload(payload, {
        tokens: readTokenState(),
        users: [],
    });
};

const findAccountRemote = async (identifier = '') => {
    const payload = await apiRequest(getAuthEndpoint('/find-account'), {
        method: 'POST',
        data: { identifier },
        auth: false,
        retryOnAuthError: false,
    });

    return Boolean(payload?.found ?? payload?.exists ?? payload?.success);
};

const ensureTestAccountRemote = async (userData = {}) => {
    try {
        return await loginRemote({
            identifier: userData.userId || userData.email,
            password: userData.password,
        });
    } catch {
        return signupRemote(userData);
    }
};

export const login = (credentials) =>
    getAuthMode() === REMOTE_AUTH_MODE ? loginRemote(credentials) : loginWithMock(credentials);

export const signup = (userData) =>
    getAuthMode() === REMOTE_AUTH_MODE ? signupRemote(userData) : signupWithMock(userData);

export const completeSocialLogin = (params) =>
    getAuthMode() === REMOTE_AUTH_MODE
        ? completeSocialLoginRemote(params)
        : completeSocialLoginWithMock(params);

export const restoreSession = () =>
    getAuthMode() === REMOTE_AUTH_MODE ? restoreSessionRemote() : restoreSessionWithMock();

export const refreshSession = () =>
    getAuthMode() === REMOTE_AUTH_MODE ? refreshSessionRemote() : refreshSessionWithMock();

export const logout = () =>
    getAuthMode() === REMOTE_AUTH_MODE ? logoutRemote() : logoutWithMock();

export const updateProfile = (profileData) =>
    getAuthMode() === REMOTE_AUTH_MODE
        ? updateProfileRemote(profileData)
        : updateProfileWithMock(profileData);

export const findAccount = (identifier) =>
    getAuthMode() === REMOTE_AUTH_MODE ? findAccountRemote(identifier) : findAccountWithMock(identifier);

export const ensureTestAccount = (userData) =>
    getAuthMode() === REMOTE_AUTH_MODE
        ? ensureTestAccountRemote(userData)
        : ensureTestAccountWithMock(userData);
