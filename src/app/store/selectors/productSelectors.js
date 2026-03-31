import { createSelector } from '@reduxjs/toolkit';
import { normalizeCategoryValue } from '../../../data/productCategories';
import { findProductByDetailParam } from '../../../lib/products/productShape';

export const selectProductState = (state) => state.product;

export const selectProductStatus = createSelector(
    [selectProductState],
    (productState) => productState.status
);

export const selectProductError = createSelector(
    [selectProductState],
    (productState) => productState.error
);

export const selectProductAppendError = createSelector(
    [selectProductState],
    (productState) => productState.appendError
);

export const selectIsProductAppending = createSelector(
    [selectProductState],
    (productState) => productState.isAppending
);

export const selectProductReferenceStatus = createSelector(
    [selectProductState],
    (productState) => productState.referenceStatus
);

export const selectProductReferenceError = createSelector(
    [selectProductState],
    (productState) => productState.referenceError
);

export const selectProducts = createSelector(
    [selectProductState],
    (productState) => productState.items
);

export const selectProductReferenceItems = createSelector(
    [selectProductState],
    (productState) => productState.referenceItems
);

export const selectProductCatalogItems = createSelector(
    [selectProductReferenceItems, selectProducts],
    (referenceItems, items) => (referenceItems.length > 0 ? referenceItems : items)
);

export const selectGiftFilters = createSelector(
    [selectProductState],
    (productState) => productState.giftFilters
);

export const selectRecentlyViewed = createSelector(
    [selectProductState],
    (productState) => productState.recentlyViewed
);

export const selectProductQuery = createSelector(
    [selectProductState],
    (productState) => productState.query
);

export const selectProductPagination = createSelector(
    [selectProductState],
    (productState) => productState.pagination
);

export const selectLoadedProductPages = createSelector(
    [selectProductState],
    (productState) => productState.loadedPages
);

export const selectHasNextProductPage = createSelector(
    [selectProductPagination],
    (pagination) => Boolean(pagination.hasNextPage)
);

export const selectCurrentProduct = createSelector(
    [selectProductState],
    (productState) => productState.currentProduct
);

export const selectCurrentProductStatus = createSelector(
    [selectProductState],
    (productState) => productState.currentProductStatus
);

export const selectCurrentProductError = createSelector(
    [selectProductState],
    (productState) => productState.currentProductError
);

export const selectProductsByCategory = (category) =>
    createSelector([selectProductCatalogItems], (products) =>
        products.filter(
            (product) =>
                normalizeCategoryValue(product.category) === normalizeCategoryValue(category)
        )
    );

export const selectProductByName = (productName = '') =>
    createSelector([selectProductCatalogItems], (products) => {
        if (!productName) {
            return null;
        }

        return products.find((product) => product.name === productName) || null;
    });

export const selectProductsByNames = (productNames = []) =>
    createSelector([selectProductCatalogItems], (products) => {
        if (!Array.isArray(productNames) || productNames.length === 0) {
            return [];
        }

        const productMap = new Map(products.map((product) => [product.name, product]));

        return productNames
            .map((productName) => productMap.get(productName))
            .filter(Boolean);
    });

export const selectProductByDetailParam = (detailParam = '') =>
    createSelector([selectProductCatalogItems], (products) =>
        findProductByDetailParam(products, detailParam)
    );

export const selectProductSearchResults = (query = '') =>
    createSelector([selectProductCatalogItems], (products) => {
        const normalizedQuery = String(query || '').trim().toLowerCase();

        if (!normalizedQuery) {
            return [];
        }

        return products.filter((product) =>
            [product.name, product.description, product.category]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        );
    });
