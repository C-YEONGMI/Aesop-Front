export const CART_STORAGE_KEY = 'aesop-cart';

export const persistCartState = (cartState) => {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        state: {
            cartItems: Array.isArray(cartState?.cartItems) ? cartState.cartItems : [],
            cartItemsByUser: cartState?.cartItemsByUser || {},
            selectedSamples: Array.isArray(cartState?.selectedSamples)
                ? cartState.selectedSamples
                : [],
            selectedSamplesByUser: cartState?.selectedSamplesByUser || {},
        },
        version: 0,
    };

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
};
