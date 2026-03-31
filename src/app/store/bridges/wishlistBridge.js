import { persistWishlistState } from '../persistence/wishlistPersistence';
import { selectActiveWishlistUserId } from '../selectors/wishlistSelectors';
import { setActiveWishlistUser } from '../slices/wishlistSlice';

const getCurrentAuthUserId = (store) => store.getState().auth.user?.id || null;

export const initializeWishlistBridge = (store) => {
    let previousPersistedSnapshot = null;
    let previousAuthUserId = getCurrentAuthUserId(store);

    store.dispatch(setActiveWishlistUser(previousAuthUserId));

    return store.subscribe(() => {
        const state = store.getState();
        const wishlistState = state.wishlist;
        const nextAuthUserId = getCurrentAuthUserId(store);

        if (selectActiveWishlistUserId(state) !== nextAuthUserId && previousAuthUserId !== nextAuthUserId) {
            previousAuthUserId = nextAuthUserId;
            store.dispatch(setActiveWishlistUser(nextAuthUserId));
            return;
        }

        const nextPersistedSnapshot = JSON.stringify({
            wishlist: wishlistState.wishlist,
            wishlistByUser: wishlistState.wishlistByUser,
        });

        if (nextPersistedSnapshot === previousPersistedSnapshot) {
            return;
        }

        previousPersistedSnapshot = nextPersistedSnapshot;
        persistWishlistState(wishlistState);
    });
};
