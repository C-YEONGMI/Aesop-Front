export const selectWishlistState = (state) => state.wishlist;

export const selectWishlistItems = (state) => selectWishlistState(state).wishlist;

export const selectWishlistByUser = (state) => selectWishlistState(state).wishlistByUser;

export const selectActiveWishlistUserId = (state) => selectWishlistState(state).activeUserId;

export const selectWishlistCount = (state) => selectWishlistItems(state).length;

export const selectIsWishlisted = (productName) => (state) =>
    selectWishlistItems(state).includes(productName);
