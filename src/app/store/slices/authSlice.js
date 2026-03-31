import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    clearLegacyAuthState,
    clearPersistedAuthState,
    persistAuthState,
} from '../persistence/authPersistence';
import {
    completeSocialLogin,
    ensureTestAccount,
    findAccount,
    getAuthMode,
    login,
    logout,
    refreshSession,
    restoreSession,
    signup,
    updateProfile,
} from '../../../lib/api/auth';
import { clearAuthTokens } from '../../../lib/auth/tokenStorage';

export const authInitialState = {
    status: 'idle',
    bootstrapStatus: 'idle',
    error: null,
    isLoggedIn: false,
    user: null,
    users: [],
    session: {
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        provider: null,
        userId: null,
        returnTo: '/',
    },
    oauth: {
        activeProvider: null,
        returnTo: '/mypage',
        error: null,
    },
    meta: {
        initialized: false,
        authMode: getAuthMode(),
    },
};

const getErrorMessage = (error, fallbackMessage) =>
    error instanceof Error ? error.message : fallbackMessage;

const persistResolvedAuthState = (authState) => {
    persistAuthState(authState);
    return authState;
};

const resolveLoggedOutUsers = (state, usersOverride) =>
    state.meta.authMode === 'remote' ? [] : Array.isArray(usersOverride) ? usersOverride : state.users;

export const bootstrapAuthSession = createAsyncThunk(
    'auth/bootstrapAuthSession',
    async (_, { rejectWithValue }) => {
        try {
            const restoredState = await restoreSession();

            if (!restoredState) {
                clearPersistedAuthState();
                return null;
            }

            return persistResolvedAuthState(restoredState);
        } catch (error) {
            clearPersistedAuthState();
            clearAuthTokens();
            return rejectWithValue(getErrorMessage(error, 'Failed to restore the session.'));
        }
    }
);

export const loginWithPassword = createAsyncThunk(
    'auth/loginWithPassword',
    async (credentials, { rejectWithValue }) => {
        try {
            return persistResolvedAuthState(await login(credentials));
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Login failed.'));
        }
    }
);

export const signupWithPassword = createAsyncThunk(
    'auth/signupWithPassword',
    async (userData, { rejectWithValue }) => {
        try {
            return persistResolvedAuthState(await signup(userData));
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Signup failed.'));
        }
    }
);

export const loginWithSocialProfile = createAsyncThunk(
    'auth/loginWithSocialProfile',
    async ({ provider, profile }, { rejectWithValue }) => {
        try {
            return persistResolvedAuthState(await completeSocialLogin({ provider, profile }));
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Social login failed.'));
        }
    }
);

export const refreshAuthSession = createAsyncThunk(
    'auth/refreshAuthSession',
    async (_, { rejectWithValue }) => {
        try {
            const refreshedState = await refreshSession();

            if (!refreshedState) {
                clearPersistedAuthState();
                clearAuthTokens();
                return null;
            }

            return persistResolvedAuthState(refreshedState);
        } catch (error) {
            clearPersistedAuthState();
            clearAuthTokens();
            return rejectWithValue(getErrorMessage(error, 'Session refresh failed.'));
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { getState, rejectWithValue }) => {
        try {
            await logout();
            clearLegacyAuthState();
            clearPersistedAuthState();
            return {
                users: getState().auth.users,
            };
        } catch (error) {
            clearLegacyAuthState();
            clearPersistedAuthState();
            clearAuthTokens();
            return rejectWithValue(getErrorMessage(error, 'Logout failed.'));
        }
    }
);

export const updateProfileThunk = createAsyncThunk(
    'auth/updateProfileThunk',
    async (profileData, { rejectWithValue }) => {
        try {
            return persistResolvedAuthState(await updateProfile(profileData));
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Profile update failed.'));
        }
    }
);

export const checkAccountExists = createAsyncThunk(
    'auth/checkAccountExists',
    async (identifier, { rejectWithValue }) => {
        try {
            const found = await findAccount(identifier);
            return {
                identifier,
                found,
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Account lookup failed.'));
        }
    }
);

export const loginWithTestAccount = createAsyncThunk(
    'auth/loginWithTestAccount',
    async (userData, { rejectWithValue }) => {
        try {
            return persistResolvedAuthState(await ensureTestAccount(userData));
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Test login failed.'));
        }
    }
);

const applyAuthenticatedSession = (state, payload = {}) => {
    state.isLoggedIn = Boolean(payload.user);
    state.user = payload.user || null;
    state.users = Array.isArray(payload.users) ? payload.users : state.users;
    state.error = null;
    state.session = {
        ...state.session,
        ...(payload.session || {}),
        userId: payload.user?.id || payload.session?.userId || null,
    };
    state.meta = {
        ...state.meta,
        ...(payload.meta || {}),
        initialized: true,
    };
};

const applyLoggedOutState = (state, options = {}) => {
    state.isLoggedIn = false;
    state.user = null;
    state.error = options.error ?? null;
    state.users = Array.isArray(options.users) ? options.users : state.users;
    state.session = {
        ...authInitialState.session,
    };
    state.oauth = {
        ...state.oauth,
        error: null,
    };
    state.meta = {
        ...state.meta,
        initialized: true,
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: authInitialState,
    reducers: {
        setSessionContext: (state, action) => {
            state.session = {
                ...state.session,
                ...(action.payload || {}),
            };
        },
        clearSessionContext: (state) => {
            state.session = {
                ...authInitialState.session,
            };
        },
        setOAuthContext: (state, action) => {
            state.oauth = {
                ...state.oauth,
                ...(action.payload || {}),
            };
        },
        clearOAuthContext: (state) => {
            state.oauth = {
                ...authInitialState.oauth,
            };
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(bootstrapAuthSession.pending, (state) => {
                state.bootstrapStatus = 'loading';
                state.error = null;
            })
            .addCase(bootstrapAuthSession.fulfilled, (state, action) => {
                state.bootstrapStatus = 'succeeded';

                if (!action.payload) {
                    applyLoggedOutState(state, {
                        users: resolveLoggedOutUsers(state),
                    });
                    return;
                }

                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(bootstrapAuthSession.rejected, (state, action) => {
                state.bootstrapStatus = 'failed';
                applyLoggedOutState(state, {
                    users: resolveLoggedOutUsers(state),
                    error: action.payload || action.error.message || 'Failed to restore the session.',
                });
            })
            .addCase(loginWithPassword.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginWithPassword.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(loginWithPassword.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Login failed.';
            })
            .addCase(signupWithPassword.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(signupWithPassword.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(signupWithPassword.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Signup failed.';
            })
            .addCase(loginWithSocialProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginWithSocialProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(loginWithSocialProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Social login failed.';
            })
            .addCase(refreshAuthSession.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(refreshAuthSession.fulfilled, (state, action) => {
                if (!action.payload) {
                    state.status = 'idle';
                    applyLoggedOutState(state, {
                        users: resolveLoggedOutUsers(state),
                    });
                    return;
                }

                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(refreshAuthSession.rejected, (state, action) => {
                state.status = 'failed';
                applyLoggedOutState(state, {
                    users: resolveLoggedOutUsers(state),
                    error: action.payload || action.error.message || 'Session refresh failed.',
                });
            })
            .addCase(logoutUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.status = 'idle';
                applyLoggedOutState(state, {
                    users: resolveLoggedOutUsers(state, action.payload?.users),
                });
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = 'idle';
                applyLoggedOutState(state, {
                    users: resolveLoggedOutUsers(state),
                    error: action.payload || action.error.message || 'Logout failed.',
                });
            })
            .addCase(updateProfileThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Profile update failed.';
            })
            .addCase(checkAccountExists.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(checkAccountExists.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(checkAccountExists.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Account lookup failed.';
            })
            .addCase(loginWithTestAccount.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginWithTestAccount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                applyAuthenticatedSession(state, action.payload);
            })
            .addCase(loginWithTestAccount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Test login failed.';
            });
    },
});

export const {
    clearAuthError,
    clearOAuthContext,
    clearSessionContext,
    setOAuthContext,
    setSessionContext,
} = authSlice.actions;

export default authSlice.reducer;
