import { createSlice } from '@reduxjs/toolkit';

export const wishlistInitialState = {
    status: 'idle',
    error: null,
    activeUserId: null,
    wishlist: [],
    wishlistByUser: {},
};

const normalizeWishlistItems = (wishlist) =>
    Array.isArray(wishlist) ? [...new Set(wishlist.filter(Boolean))] : [];

const getUserWishlist = (wishlistByUser, userId) => {
    if (!userId) {
        return [];
    }

    const value = wishlistByUser?.[userId];
    return normalizeWishlistItems(value);
};

const mergeWishlistState = (state, payload = {}) => ({
    ...state,
    ...payload,
    wishlistByUser: {
        ...state.wishlistByUser,
        ...(payload.wishlistByUser || {}),
    },
});

const applyWishlistForActiveUser = (state, nextWishlist) => {
    const normalizedWishlist = normalizeWishlistItems(nextWishlist);
    state.wishlist = normalizedWishlist;

    if (state.activeUserId) {
        state.wishlistByUser = {
            ...state.wishlistByUser,
            [state.activeUserId]: normalizedWishlist,
        };
    }
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: wishlistInitialState,
    reducers: {
        hydrateWishlistState: (state, action) => mergeWishlistState(state, action.payload),
        setWishlistStatus: (state, action) => {
            state.status = action.payload;
        },
        setWishlistError: (state, action) => {
            state.error = action.payload;
        },
        setActiveWishlistUser: (state, action) => {
            const userId = action.payload || null;
            state.activeUserId = userId;
            state.wishlist = getUserWishlist(state.wishlistByUser, userId);
        },
        setWishlist: (state, action) => {
            applyWishlistForActiveUser(state, action.payload);
        },
        upsertWishlistForUser: (state, action) => {
            const { userId, wishlist = [] } = action.payload || {};

            if (!userId) {
                return;
            }

            state.wishlistByUser = {
                ...state.wishlistByUser,
                [userId]: normalizeWishlistItems(wishlist),
            };

            if (state.activeUserId === userId) {
                state.wishlist = normalizeWishlistItems(wishlist);
            }
        },
        addWishlistItem: (state, action) => {
            const productName = action.payload;

            if (!productName || state.wishlist.includes(productName)) {
                return;
            }

            applyWishlistForActiveUser(state, [...state.wishlist, productName]);
        },
        removeWishlistItem: (state, action) => {
            const productName = action.payload;

            if (!productName) {
                return;
            }

            applyWishlistForActiveUser(
                state,
                state.wishlist.filter((name) => name !== productName)
            );
        },
        toggleWishlistItem: (state, action) => {
            const productName = action.payload;

            if (!productName) {
                return;
            }

            const nextWishlist = state.wishlist.includes(productName)
                ? state.wishlist.filter((name) => name !== productName)
                : [...state.wishlist, productName];

            applyWishlistForActiveUser(state, nextWishlist);
        },
        clearWishlist: (state) => {
            applyWishlistForActiveUser(state, []);
        },
        syncFromLegacyWishlist: (state, action) => mergeWishlistState(state, action.payload),
        resetWishlistState: () => wishlistInitialState,
    },
});

export const {
    addWishlistItem,
    clearWishlist,
    hydrateWishlistState,
    removeWishlistItem,
    resetWishlistState,
    setActiveWishlistUser,
    setWishlist,
    setWishlistError,
    setWishlistStatus,
    syncFromLegacyWishlist,
    toggleWishlistItem,
    upsertWishlistForUser,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
