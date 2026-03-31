import { createSelector } from '@reduxjs/toolkit';

export const CART_FREE_SHIPPING_AMOUNT = 50000;
export const CART_SHIPPING_FEE = 3000;

export const selectCartState = (state) => state.cart;

export const selectCartItems = createSelector(
    [selectCartState],
    (cartState) => cartState.cartItems
);

export const selectSelectedSamples = createSelector(
    [selectCartState],
    (cartState) => cartState.selectedSamples
);

export const selectCartDialogItem = createSelector(
    [selectCartState],
    (cartState) => cartState.cartDialogItem
);

export const selectIsCartDialogOpen = createSelector(
    [selectCartState],
    (cartState) => cartState.isCartDialogOpen
);

export const selectActiveCartUserId = createSelector(
    [selectCartState],
    (cartState) => cartState.activeUserId
);

export const selectCartItemCount = createSelector(
    [selectCartItems],
    (cartItems) => cartItems.length
);

export const selectCartTotalQuantity = createSelector(
    [selectCartItems],
    (cartItems) => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
);

export const selectCheckedCartItems = createSelector(
    [selectCartItems],
    (cartItems) => cartItems.filter((item) => item.checked)
);

export const selectCheckedCartItemCount = createSelector(
    [selectCheckedCartItems],
    (cartItems) => cartItems.length
);

export const selectCartSubtotal = createSelector(
    [selectCheckedCartItems],
    (cartItems) => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const selectCartShippingFee = createSelector([selectCartSubtotal], (subtotal) => {
    if (subtotal === 0) {
        return 0;
    }

    return subtotal >= CART_FREE_SHIPPING_AMOUNT ? 0 : CART_SHIPPING_FEE;
});

export const selectCartTotalAmount = createSelector(
    [selectCartSubtotal, selectCartShippingFee],
    (subtotal, shippingFee) => subtotal + shippingFee
);

export const selectAllCartItemsChecked = createSelector(
    [selectCartItems],
    (cartItems) => cartItems.length > 0 && cartItems.every((item) => item.checked)
);
