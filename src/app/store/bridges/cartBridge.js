import { persistCartState } from '../persistence/cartPersistence';
import { selectActiveCartUserId } from '../selectors/cartSelectors';
import { setActiveCartUser } from '../slices/cartSlice';

const getCurrentAuthUserId = (store) => store.getState().auth.user?.id || null;

export const initializeCartBridge = (store) => {
    let previousPersistedSnapshot = null;
    let previousAuthUserId = getCurrentAuthUserId(store);

    store.dispatch(setActiveCartUser(previousAuthUserId));

    return store.subscribe(() => {
        const state = store.getState();
        const cartState = state.cart;
        const nextAuthUserId = getCurrentAuthUserId(store);

        if (selectActiveCartUserId(state) !== nextAuthUserId && previousAuthUserId !== nextAuthUserId) {
            previousAuthUserId = nextAuthUserId;
            store.dispatch(setActiveCartUser(nextAuthUserId));
            return;
        }

        const nextPersistedSnapshot = JSON.stringify({
            cartItems: cartState.cartItems,
            cartItemsByUser: cartState.cartItemsByUser,
            selectedSamples: cartState.selectedSamples,
            selectedSamplesByUser: cartState.selectedSamplesByUser,
        });

        if (nextPersistedSnapshot === previousPersistedSnapshot) {
            return;
        }

        previousPersistedSnapshot = nextPersistedSnapshot;
        persistCartState(cartState);
    });
};
