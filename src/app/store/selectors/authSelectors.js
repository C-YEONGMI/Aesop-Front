import { createSelector } from '@reduxjs/toolkit';

export const selectAuthState = (state) => state.auth;

export const selectAuthStatus = createSelector(
    [selectAuthState],
    (authState) => authState.status
);

export const selectBootstrapStatus = createSelector(
    [selectAuthState],
    (authState) => authState.bootstrapStatus
);

export const selectAuthError = createSelector(
    [selectAuthState],
    (authState) => authState.error
);

export const selectIsLoggedIn = createSelector(
    [selectAuthState],
    (authState) => authState.isLoggedIn
);

export const selectCurrentUser = createSelector(
    [selectAuthState],
    (authState) => authState.user
);

export const selectAuthUsers = createSelector(
    [selectAuthState],
    (authState) => authState.users
);

export const selectAuthSession = createSelector(
    [selectAuthState],
    (authState) => authState.session
);

export const selectAuthReturnTo = createSelector(
    [selectAuthSession],
    (session) => session.returnTo
);

export const selectAuthMode = createSelector(
    [selectAuthState],
    (authState) => authState.meta.authMode
);

export const selectIsAuthInitialized = createSelector(
    [selectAuthState],
    (authState) => authState.meta.initialized
);
