export const AUTH_STATE_STORAGE_KEY = 'aesop-auth-session';
export const AUTH_DIRECTORY_STORAGE_KEY = 'aesop-auth-users';
export const LEGACY_AUTH_STORAGE_KEY = 'aesop-auth';

const readStorageEnvelope = (storageKey) => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(storageKey);

        if (!rawValue) {
            return null;
        }

        const parsedValue = JSON.parse(rawValue);
        return parsedValue?.state ?? parsedValue ?? null;
    } catch {
        return null;
    }
};

const normalizeUsers = (users) =>
    Array.isArray(users)
        ? users.map((user) => {
              if (!user || typeof user !== 'object') {
                  return user;
              }

              const { password: _password, ...safeUser } = user;
              return safeUser;
          })
        : [];

const buildHydratedAuthState = (snapshot = {}) => ({
    isLoggedIn: Boolean(snapshot?.isLoggedIn && snapshot?.user),
    user: snapshot?.user ?? null,
    users: normalizeUsers(snapshot?.users),
    session: {
        provider: snapshot?.session?.provider || snapshot?.user?.socialProvider || null,
        userId: snapshot?.user?.id || snapshot?.session?.userId || null,
        returnTo: snapshot?.session?.returnTo || '/',
    },
    oauth: {
        activeProvider: snapshot?.oauth?.activeProvider || null,
        returnTo: snapshot?.oauth?.returnTo || '/mypage',
        error: snapshot?.oauth?.error || null,
    },
    meta: {
        initialized: Boolean(snapshot?.meta?.initialized || snapshot?.isLoggedIn || snapshot?.user),
        authMode: snapshot?.meta?.authMode || 'mock',
    },
});

export const readLegacyAuthState = () => readStorageEnvelope(LEGACY_AUTH_STORAGE_KEY);

export const readPersistedAuthState = () => readStorageEnvelope(AUTH_STATE_STORAGE_KEY);

export const buildAuthHydrationState = () => {
    const persistedAuthState = readPersistedAuthState();

    if (persistedAuthState) {
        return buildHydratedAuthState(persistedAuthState);
    }

    const legacyAuthState = readLegacyAuthState();

    if (legacyAuthState) {
        return buildHydratedAuthState(legacyAuthState);
    }

    return null;
};

export const persistAuthState = (authState) => {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        state: buildHydratedAuthState(authState),
        version: 0,
    };

    window.localStorage.setItem(AUTH_STATE_STORAGE_KEY, JSON.stringify(payload));
};

export const clearPersistedAuthState = () => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
};

export const clearLegacyAuthState = () => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
};

export const readAuthDirectory = () => {
    const persistedDirectory = readStorageEnvelope(AUTH_DIRECTORY_STORAGE_KEY);

    if (Array.isArray(persistedDirectory)) {
        return persistedDirectory;
    }

    const persistedAuthState = readPersistedAuthState();

    if (Array.isArray(persistedAuthState?.users) && persistedAuthState.users.length > 0) {
        return persistedAuthState.users;
    }

    const legacyAuthState = readLegacyAuthState();

    if (Array.isArray(legacyAuthState?.users) && legacyAuthState.users.length > 0) {
        return legacyAuthState.users;
    }

    return [];
};

export const writeAuthDirectory = (users) => {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        state: normalizeUsers(users),
        version: 0,
    };

    window.localStorage.setItem(AUTH_DIRECTORY_STORAGE_KEY, JSON.stringify(payload));
};
