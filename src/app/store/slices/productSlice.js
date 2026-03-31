import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import productsData from '../../../data/products.json';
import { getProductCatalog, getProductDetail } from '../../../lib/api/products';

const DEFAULT_PRODUCT_PAGE_SIZE = 20;

const getErrorMessage = (error, fallbackMessage) =>
    error instanceof Error ? error.message : fallbackMessage;

const buildCatalogRequestKey = (params = {}) =>
    JSON.stringify({
        category: params.category ?? '',
        q: params.q ?? '',
        sort: params.sort ?? 'default',
        limit: params.limit ?? DEFAULT_PRODUCT_PAGE_SIZE,
    });

const mergeProductsById = (currentItems = [], nextItems = []) => {
    const seenKeys = new Set();
    const mergedItems = [];

    [...currentItems, ...nextItems].forEach((product) => {
        const key =
            product.id ||
            product.detailKey ||
            product.slug ||
            product.sourceId ||
            product.name;

        if (!key || seenKeys.has(key)) {
            return;
        }

        seenKeys.add(key);
        mergedItems.push(product);
    });

    return mergedItems;
};

export const fetchProductCatalog = createAsyncThunk(
    'product/fetchProductCatalog',
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getProductCatalog({
                page: params.page ?? 1,
                limit: params.limit ?? DEFAULT_PRODUCT_PAGE_SIZE,
                category: params.category ?? '',
                q: params.q ?? '',
                sort: params.sort ?? 'default',
                fetchAllPages: params.fetchAllPages ?? false,
            });
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to load products.'));
        }
    },
    {
        condition: (params = {}, { getState }) => {
            const productState = getState().product;
            const nextPage = params.page ?? 1;
            const isAppendRequest = Boolean(params.append);
            const requestKey = buildCatalogRequestKey(params);
            const matchesCurrentCatalog = productState.catalogRequestKey === requestKey;

            if (isAppendRequest) {
                if (!matchesCurrentCatalog) {
                    return false;
                }

                if (productState.isAppending || productState.status === 'loading') {
                    return false;
                }

                if (productState.loadedPages.includes(nextPage)) {
                    return false;
                }
            }

            if (!isAppendRequest && productState.status === 'loading' && matchesCurrentCatalog) {
                return false;
            }

            return true;
        },
    }
);

export const fetchProductReferenceCatalog = createAsyncThunk(
    'product/fetchProductReferenceCatalog',
    async (_, { rejectWithValue }) => {
        try {
            return await getProductCatalog({
                page: 1,
                limit: DEFAULT_PRODUCT_PAGE_SIZE,
                fetchAllPages: true,
            });
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to load product metadata.'));
        }
    },
    {
        condition: (_, { getState }) => {
            const { product } = getState();

            return !(
                product.referenceStatus === 'loading' ||
                (product.referenceStatus === 'succeeded' && product.referenceItems.length > 0)
            );
        },
    }
);

export const fetchProductDetail = createAsyncThunk(
    'product/fetchProductDetail',
    async (identifier, { rejectWithValue }) => {
        try {
            return await getProductDetail(identifier);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to load the product.'));
        }
    }
);

export const productInitialState = {
    status: 'idle',
    referenceStatus: 'idle',
    currentProductStatus: 'idle',
    error: null,
    appendError: null,
    referenceError: null,
    currentProductError: null,
    isAppending: false,
    items: [],
    referenceItems: [],
    currentProduct: null,
    giftFilters: Array.isArray(productsData.giftFilters) ? productsData.giftFilters : [],
    recentlyViewed: [],
    query: {
        page: 1,
        limit: DEFAULT_PRODUCT_PAGE_SIZE,
        category: '',
        q: '',
        sort: 'default',
    },
    pagination: {
        page: 1,
        pageSize: DEFAULT_PRODUCT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
    },
    loadedPages: [],
    catalogRequestKey: buildCatalogRequestKey(),
    activeCatalogRequestId: null,
    activeAppendRequestId: null,
};

const productSlice = createSlice({
    name: 'product',
    initialState: productInitialState,
    reducers: {
        setGiftFilters: (state, action) => {
            state.giftFilters = Array.isArray(action.payload) ? action.payload : [];
        },
        addRecentlyViewed: (state, action) => {
            const productName = action.payload;

            if (!productName) {
                return;
            }

            const filtered = state.recentlyViewed.filter((name) => name !== productName);
            state.recentlyViewed = [productName, ...filtered].slice(0, 10);
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
            state.currentProductStatus = 'idle';
            state.currentProductError = null;
        },
        resetProductState: () => productInitialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductCatalog.pending, (state, action) => {
                const isAppendRequest = Boolean(action.meta.arg?.append);
                const requestKey = buildCatalogRequestKey(action.meta.arg);

                if (isAppendRequest) {
                    state.isAppending = true;
                    state.appendError = null;
                    state.activeAppendRequestId = action.meta.requestId;
                    return;
                }

                state.status = 'loading';
                state.error = null;
                state.appendError = null;
                state.isAppending = false;
                state.activeCatalogRequestId = action.meta.requestId;
                state.items = [];
                state.loadedPages = [];
                state.catalogRequestKey = requestKey;
                state.query = {
                    ...state.query,
                    page: action.meta.arg?.page ?? 1,
                    limit: action.meta.arg?.limit ?? DEFAULT_PRODUCT_PAGE_SIZE,
                    category: action.meta.arg?.category ?? '',
                    q: action.meta.arg?.q ?? '',
                    sort: action.meta.arg?.sort ?? 'default',
                };
                state.pagination = {
                    ...productInitialState.pagination,
                    page: 1,
                    pageSize: action.meta.arg?.limit ?? DEFAULT_PRODUCT_PAGE_SIZE,
                    hasNextPage: true,
                };
            })
            .addCase(fetchProductCatalog.fulfilled, (state, action) => {
                const isAppendRequest = Boolean(action.meta.arg?.append);
                const nextItems = Array.isArray(action.payload?.items) ? action.payload.items : [];

                if (
                    (isAppendRequest && state.activeAppendRequestId !== action.meta.requestId) ||
                    (!isAppendRequest && state.activeCatalogRequestId !== action.meta.requestId)
                ) {
                    return;
                }

                state.status = 'succeeded';
                state.error = null;
                state.isAppending = false;
                state.appendError = null;
                state.activeCatalogRequestId = isAppendRequest ? state.activeCatalogRequestId : null;
                state.activeAppendRequestId = isAppendRequest ? null : state.activeAppendRequestId;
                state.catalogRequestKey = buildCatalogRequestKey(action.meta.arg);
                state.items = isAppendRequest
                    ? mergeProductsById(state.items, nextItems)
                    : nextItems;
                state.query = {
                    ...state.query,
                    ...(action.payload?.query || {}),
                };
                state.pagination = {
                    ...state.pagination,
                    ...(action.payload?.pagination || {}),
                };
                state.loadedPages = isAppendRequest
                    ? [...new Set([...state.loadedPages, action.payload?.query?.page || 1])]
                    : [action.payload?.query?.page || 1];
            })
            .addCase(fetchProductCatalog.rejected, (state, action) => {
                const isAppendRequest = Boolean(action.meta.arg?.append);

                if (
                    (isAppendRequest && state.activeAppendRequestId !== action.meta.requestId) ||
                    (!isAppendRequest && state.activeCatalogRequestId !== action.meta.requestId)
                ) {
                    return;
                }

                state.isAppending = false;
                state.activeAppendRequestId = isAppendRequest ? null : state.activeAppendRequestId;
                state.activeCatalogRequestId = isAppendRequest ? state.activeCatalogRequestId : null;

                if (isAppendRequest) {
                    state.appendError =
                        action.payload || action.error.message || 'Failed to load more products.';
                    return;
                }

                state.status = 'failed';
                state.error = action.payload || action.error.message || 'Failed to load products.';
            })
            .addCase(fetchProductReferenceCatalog.pending, (state) => {
                state.referenceStatus = 'loading';
                state.referenceError = null;
            })
            .addCase(fetchProductReferenceCatalog.fulfilled, (state, action) => {
                state.referenceStatus = 'succeeded';
                state.referenceError = null;
                state.referenceItems = Array.isArray(action.payload?.items)
                    ? action.payload.items
                    : [];
            })
            .addCase(fetchProductReferenceCatalog.rejected, (state, action) => {
                state.referenceStatus = 'failed';
                state.referenceError =
                    action.payload || action.error.message || 'Failed to load product metadata.';
            })
            .addCase(fetchProductDetail.pending, (state) => {
                state.currentProductStatus = 'loading';
                state.currentProductError = null;
            })
            .addCase(fetchProductDetail.fulfilled, (state, action) => {
                state.currentProductStatus = 'succeeded';
                state.currentProductError = null;
                state.currentProduct = action.payload || null;
            })
            .addCase(fetchProductDetail.rejected, (state, action) => {
                state.currentProductStatus = 'failed';
                state.currentProductError =
                    action.payload || action.error.message || 'Failed to load the product.';
                state.currentProduct = null;
            });
    },
});

export const {
    addRecentlyViewed,
    clearCurrentProduct,
    resetProductState,
    setGiftFilters,
} = productSlice.actions;

export default productSlice.reducer;
