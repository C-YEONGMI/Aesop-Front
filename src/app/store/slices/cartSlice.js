import { createSlice } from '@reduxjs/toolkit';

export const cartInitialState = {
    status: 'idle',
    error: null,
    activeUserId: null,
    cartItems: [],
    cartItemsByUser: {},
    isCartDialogOpen: false,
    cartDialogItem: null,
    selectedSamples: [],
    selectedSamplesByUser: {},
};

const normalizeCartItems = (cartItems) =>
    Array.isArray(cartItems) ? cartItems.filter(Boolean) : [];

const normalizeSelectedSamples = (selectedSamples) =>
    Array.isArray(selectedSamples)
        ? [...new Set(selectedSamples.filter(Boolean))]
        : [];

const getUserCollection = (collection, userId, fallback = []) => {
    if (!userId) {
        return fallback;
    }

    const value = collection?.[userId];
    return Array.isArray(fallback)
        ? (Array.isArray(value) ? value : fallback)
        : fallback;
};

const buildNextUserCollection = (collection, userId, value) => {
    if (!userId) {
        return collection || {};
    }

    return {
        ...(collection || {}),
        [userId]: value,
    };
};

const mergeCartState = (state, payload = {}) => ({
    ...state,
    ...payload,
    cartItemsByUser: {
        ...state.cartItemsByUser,
        ...(payload.cartItemsByUser || {}),
    },
    selectedSamplesByUser: {
        ...state.selectedSamplesByUser,
        ...(payload.selectedSamplesByUser || {}),
    },
});

const applyCartItemsForActiveUser = (state, nextItems) => {
    const normalizedItems = normalizeCartItems(nextItems);
    state.cartItems = normalizedItems;
    state.cartItemsByUser = buildNextUserCollection(
        state.cartItemsByUser,
        state.activeUserId,
        normalizedItems
    );
};

const applySelectedSamplesForActiveUser = (state, nextSamples) => {
    const normalizedSamples = normalizeSelectedSamples(nextSamples);
    state.selectedSamples = normalizedSamples;
    state.selectedSamplesByUser = buildNextUserCollection(
        state.selectedSamplesByUser,
        state.activeUserId,
        normalizedSamples
    );
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: cartInitialState,
    reducers: {
        hydrateCartState: (state, action) => mergeCartState(state, action.payload),
        setCartStatus: (state, action) => {
            state.status = action.payload;
        },
        setCartError: (state, action) => {
            state.error = action.payload;
        },
        setActiveCartUser: (state, action) => {
            const userId = action.payload || null;
            state.activeUserId = userId;
            state.cartItems = normalizeCartItems(getUserCollection(state.cartItemsByUser, userId));
            state.selectedSamples = normalizeSelectedSamples(
                getUserCollection(state.selectedSamplesByUser, userId)
            );
            state.isCartDialogOpen = false;
            state.cartDialogItem = null;
        },
        setCartItems: (state, action) => {
            applyCartItemsForActiveUser(state, action.payload);
        },
        setSelectedSamples: (state, action) => {
            applySelectedSamplesForActiveUser(state, action.payload);
        },
        upsertCartForUser: (state, action) => {
            const { userId, cartItems = [] } = action.payload || {};

            if (!userId) {
                return;
            }

            state.cartItemsByUser = buildNextUserCollection(
                state.cartItemsByUser,
                userId,
                normalizeCartItems(cartItems)
            );

            if (state.activeUserId === userId) {
                state.cartItems = normalizeCartItems(cartItems);
            }
        },
        upsertSamplesForUser: (state, action) => {
            const { userId, selectedSamples = [] } = action.payload || {};

            if (!userId) {
                return;
            }

            state.selectedSamplesByUser = buildNextUserCollection(
                state.selectedSamplesByUser,
                userId,
                normalizeSelectedSamples(selectedSamples)
            );

            if (state.activeUserId === userId) {
                state.selectedSamples = normalizeSelectedSamples(selectedSamples);
            }
        },
        addToCart: (state, action) => {
            const { product, variantIndex = 0, options = {} } = action.payload || {};

            if (!product?.variants?.[variantIndex]) {
                return;
            }

            const { showDialog = true, preserveDialog = false } = options;
            const variant = product.variants[variantIndex];
            const cartId = `${product.name}-${variantIndex}`;
            const existing = state.cartItems.find((item) => item.cartId === cartId);
            const currentDialogState = {
                isCartDialogOpen: state.isCartDialogOpen,
                cartDialogItem: state.cartDialogItem,
            };
            const cartDialogItem = {
                cartId,
                productName: product.name,
                category: product.category,
                image: variant.image,
                variant: variant.capacity || '',
                price: variant.price,
            };
            const nextCartItems = existing
                ? state.cartItems.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
                : [
                    ...state.cartItems,
                    {
                        cartId,
                        productName: product.name,
                        category: product.category,
                        image: variant.image,
                        variant: variant.capacity || '',
                        quantity: 1,
                        price: variant.price,
                        checked: true,
                    },
                ];

            applyCartItemsForActiveUser(state, nextCartItems);
            state.isCartDialogOpen = preserveDialog
                ? currentDialogState.isCartDialogOpen
                : showDialog;
            state.cartDialogItem = preserveDialog
                ? currentDialogState.cartDialogItem
                : showDialog
                    ? cartDialogItem
                    : null;
        },
        openCartDialog: (state, action) => {
            state.isCartDialogOpen = true;
            state.cartDialogItem = action.payload || null;
        },
        closeCartDialog: (state) => {
            state.isCartDialogOpen = false;
            state.cartDialogItem = null;
        },
        updateQuantity: (state, action) => {
            const { cartId, quantity } = action.payload || {};

            if (!cartId || quantity < 1) {
                return;
            }

            applyCartItemsForActiveUser(
                state,
                state.cartItems.map((item) =>
                    item.cartId === cartId ? { ...item, quantity } : item
                )
            );
        },
        removeItem: (state, action) => {
            const cartId = action.payload;

            if (!cartId) {
                return;
            }

            applyCartItemsForActiveUser(
                state,
                state.cartItems.filter((item) => item.cartId !== cartId)
            );
        },
        toggleCheck: (state, action) => {
            const cartId = action.payload;

            if (!cartId) {
                return;
            }

            applyCartItemsForActiveUser(
                state,
                state.cartItems.map((item) =>
                    item.cartId === cartId ? { ...item, checked: !item.checked } : item
                )
            );
        },
        toggleAll: (state, action) => {
            const checked = Boolean(action.payload);

            applyCartItemsForActiveUser(
                state,
                state.cartItems.map((item) => ({ ...item, checked }))
            );
        },
        removeChecked: (state) => {
            applyCartItemsForActiveUser(
                state,
                state.cartItems.filter((item) => !item.checked)
            );
        },
        removeOrderedItems: (state, action) => {
            const cartIds = Array.isArray(action.payload) ? action.payload : [];

            applyCartItemsForActiveUser(
                state,
                state.cartItems.filter((item) => !cartIds.includes(item.cartId))
            );
        },
        toggleSample: (state, action) => {
            const sampleId = action.payload;

            if (!sampleId) {
                return;
            }

            const nextSamples = state.selectedSamples.includes(sampleId)
                ? state.selectedSamples.filter((id) => id !== sampleId)
                : [...state.selectedSamples, sampleId];

            applySelectedSamplesForActiveUser(state, nextSamples);
        },
        clearSamples: (state) => {
            applySelectedSamplesForActiveUser(state, []);
        },
        clearCart: (state) => {
            applyCartItemsForActiveUser(state, []);
            applySelectedSamplesForActiveUser(state, []);
        },
        syncFromLegacyCart: (state, action) => mergeCartState(state, action.payload),
        resetCartState: () => cartInitialState,
    },
});

export const {
    addToCart,
    clearCart,
    clearSamples,
    closeCartDialog,
    hydrateCartState,
    openCartDialog,
    removeChecked,
    removeItem,
    removeOrderedItems,
    resetCartState,
    setActiveCartUser,
    setCartError,
    setCartItems,
    setCartStatus,
    setSelectedSamples,
    syncFromLegacyCart,
    toggleAll,
    toggleCheck,
    toggleSample,
    updateQuantity,
    upsertCartForUser,
    upsertSamplesForUser,
} = cartSlice.actions;

export default cartSlice.reducer;
