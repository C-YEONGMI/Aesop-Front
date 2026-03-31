import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import wishlistReducer from './slices/wishlistSlice';
import { createPreloadedState } from './preloadedState';
import { initializeCartBridge } from './bridges/cartBridge';
import { initializeWishlistBridge } from './bridges/wishlistBridge';
import { initializeProductPersistence } from './persistence/productPersistence';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        product: productReducer,
        wishlist: wishlistReducer,
    },
    preloadedState: createPreloadedState(),
});

// These subscribers are now RTK runtime bridges:
// - persist cart/wishlist state
// - switch user-scoped cart/wishlist slices when auth user changes
initializeCartBridge(store);
initializeWishlistBridge(store);
initializeProductPersistence(store);

export default store;
