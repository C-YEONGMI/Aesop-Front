import { authInitialState } from './slices/authSlice';
import { cartInitialState } from './slices/cartSlice';
import { productInitialState } from './slices/productSlice';
import { buildAuthHydrationState } from './persistence/authPersistence';
import { CART_STORAGE_KEY } from './persistence/cartPersistence';
import { PRODUCT_STORAGE_KEY } from './persistence/productPersistence';
import { wishlistInitialState } from './slices/wishlistSlice';
import { WISHLIST_STORAGE_KEY } from './persistence/wishlistPersistence';

const readPersistedState = (storageKey) => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(storageKey);

        if (!rawValue) {
            return null;
        }

        const parsedValue = JSON.parse(rawValue);
        return parsedValue?.state ?? null;
    } catch {
        return null;
    }
};

export const createPreloadedState = () => {
    const preloadedAuth = buildAuthHydrationState();
    const persistedCart = readPersistedState(CART_STORAGE_KEY);
    const persistedProductState = readPersistedState(PRODUCT_STORAGE_KEY);
    const persistedWishlist = readPersistedState(WISHLIST_STORAGE_KEY);
    const activeCartUserId = preloadedAuth?.user?.id || null;
    const cartItemsByUser = persistedCart?.cartItemsByUser || {};
    const selectedSamplesByUser = persistedCart?.selectedSamplesByUser || {};
    const activeUserCartItems = activeCartUserId ? cartItemsByUser[activeCartUserId] : [];
    const activeUserSelectedSamples = activeCartUserId
        ? selectedSamplesByUser[activeCartUserId]
        : [];
    const activeWishlistUserId = preloadedAuth?.user?.id || null;
    const wishlistByUser = persistedWishlist?.wishlistByUser || {};
    const activeUserWishlist = activeWishlistUserId
        ? wishlistByUser[activeWishlistUserId]
        : [];

    return {
        auth: {
            ...authInitialState,
            ...(preloadedAuth || {}),
            session: {
                ...authInitialState.session,
                ...(preloadedAuth?.session || {}),
                userId: preloadedAuth?.user?.id || preloadedAuth?.session?.userId || null,
            },
            oauth: {
                ...authInitialState.oauth,
                ...(preloadedAuth?.oauth || {}),
            },
            meta: {
                ...authInitialState.meta,
                ...(preloadedAuth?.meta || {}),
            },
        },
        product: {
            ...productInitialState,
            recentlyViewed: Array.isArray(persistedProductState?.recentlyViewed)
                ? persistedProductState.recentlyViewed
                : productInitialState.recentlyViewed,
        },
        cart: {
            ...cartInitialState,
            ...(persistedCart || {}),
            activeUserId: activeCartUserId,
            cartItems: Array.isArray(activeUserCartItems)
                ? activeUserCartItems
                : Array.isArray(persistedCart?.cartItems)
                    ? persistedCart.cartItems
                    : [],
            cartItemsByUser,
            selectedSamples: Array.isArray(activeUserSelectedSamples)
                ? activeUserSelectedSamples
                : Array.isArray(persistedCart?.selectedSamples)
                    ? persistedCart.selectedSamples
                    : [],
            selectedSamplesByUser,
        },
        wishlist: {
            ...wishlistInitialState,
            ...(persistedWishlist || {}),
            activeUserId: activeWishlistUserId,
            wishlist: Array.isArray(activeUserWishlist)
                ? activeUserWishlist
                : Array.isArray(persistedWishlist?.wishlist)
                    ? persistedWishlist.wishlist
                    : [],
            wishlistByUser,
        },
    };
};
