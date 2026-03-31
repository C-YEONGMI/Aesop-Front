export const PRODUCT_STORAGE_KEY = 'aesop-products';

export const persistProductState = (productState) => {
    if (typeof window === 'undefined') {
        return;
    }

    const payload = {
        state: {
            recentlyViewed: Array.isArray(productState?.recentlyViewed)
                ? productState.recentlyViewed
                : [],
        },
        version: 0,
    };

    window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(payload));
};

export const initializeProductPersistence = (store) => {
    let previousPersistedSnapshot = null;

    return store.subscribe(() => {
        const productState = store.getState().product;
        const nextPersistedSnapshot = JSON.stringify({
            recentlyViewed: productState.recentlyViewed,
        });

        if (nextPersistedSnapshot === previousPersistedSnapshot) {
            return;
        }

        previousPersistedSnapshot = nextPersistedSnapshot;
        persistProductState(productState);
    });
};
