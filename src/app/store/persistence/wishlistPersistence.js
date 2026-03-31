export const WISHLIST_STORAGE_KEY = 'aesop-wishlist';

export const persistWishlistState = (wishlistState) => {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        state: {
            wishlist: Array.isArray(wishlistState?.wishlist) ? wishlistState.wishlist : [],
            wishlistByUser: wishlistState?.wishlistByUser || {},
        },
        version: 0,
    };

    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(payload));
};
