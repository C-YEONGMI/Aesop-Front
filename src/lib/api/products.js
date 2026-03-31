import { ApiError, apiRequest } from './client';
import {
    findProductByDetailParam,
    normalizeProduct,
    normalizeProductCollection,
} from '../products/productShape';

const API_MAX_PAGE_SIZE = 100;

const PRODUCT_SORT_MAP = {
    default: '',
    best: 'popular',
    new: 'newest',
    'price-asc': 'price_asc',
    'price-desc': 'price_desc',
};

const PRODUCT_CATEGORY_MAP = {
    skincare: 'SKIN CARE',
    fragrance: 'Perfume',
    home: 'HOME & LIVING',
    hair: 'HAIR & SHAVING',
    body: 'HAND & BODY',
    kits: 'KITS',
};

const toPositiveInteger = (value, fallbackValue) => {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
};

const toApiSortValue = (value = 'default') => PRODUCT_SORT_MAP[value] || '';

const toApiCategoryValue = (value = '') => PRODUCT_CATEGORY_MAP[value] || value || '';

const buildProductsQueryString = ({ page, limit, category, q, sort }) => {
    const searchParams = new URLSearchParams();

    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));

    if (category) {
        searchParams.set('category', category);
    }

    if (q) {
        searchParams.set('q', q);
    }

    if (sort) {
        searchParams.set('sort', sort);
    }

    return searchParams.toString();
};

const fetchProductPage = async ({
    page = 1,
    limit = API_MAX_PAGE_SIZE,
    category = '',
    q = '',
    sort = 'default',
}) => {
    const queryString = buildProductsQueryString({
        page,
        limit: Math.min(API_MAX_PAGE_SIZE, toPositiveInteger(limit, API_MAX_PAGE_SIZE)),
        category: toApiCategoryValue(category),
        q: String(q || '').trim(),
        sort: toApiSortValue(sort),
    });

    return apiRequest(`/products?${queryString}`, {
        auth: false,
        retryOnAuthError: false,
    });
};

export const getProductCatalog = async ({
    page = 1,
    limit = API_MAX_PAGE_SIZE,
    category = '',
    q = '',
    sort = 'default',
    fetchAllPages = false,
} = {}) => {
    const requestedPage = toPositiveInteger(page, 1);
    const requestedLimit = toPositiveInteger(limit, API_MAX_PAGE_SIZE);
    const safeLimit = Math.min(API_MAX_PAGE_SIZE, requestedLimit);
    const baseParams = {
        category,
        q,
        sort,
        limit: safeLimit,
    };

    const firstPage = await fetchProductPage({
        ...baseParams,
        page: requestedPage,
    });

    let items = normalizeProductCollection(firstPage?.items);

    if (fetchAllPages && firstPage?.totalPages > requestedPage) {
        for (let nextPage = requestedPage + 1; nextPage <= firstPage.totalPages; nextPage += 1) {
            const nextResponse = await fetchProductPage({
                ...baseParams,
                page: nextPage,
            });

            items = items.concat(normalizeProductCollection(nextResponse?.items));
        }
    }

    return {
        items,
        pagination: {
            page: firstPage?.page || requestedPage,
            pageSize: firstPage?.limit || safeLimit,
            total: firstPage?.total || items.length,
            totalPages: firstPage?.totalPages || 1,
            hasNextPage: Boolean(firstPage?.hasNextPage),
        },
        query: {
            page: requestedPage,
            limit: requestedLimit,
            category,
            q: String(q || '').trim(),
            sort,
        },
    };
};

const findProductByNameFallback = async (identifier = '') => {
    const decodedIdentifier = decodeURIComponent(String(identifier || '')).trim();

    if (!decodedIdentifier) {
        return null;
    }

    const catalog = await getProductCatalog({
        q: decodedIdentifier,
        limit: API_MAX_PAGE_SIZE,
        fetchAllPages: true,
    });

    return findProductByDetailParam(catalog.items, decodedIdentifier);
};

export const getProductDetail = async (identifier) => {
    try {
        const payload = await apiRequest(`/products/${encodeURIComponent(identifier)}`, {
            auth: false,
            retryOnAuthError: false,
        });

        return normalizeProduct(payload);
    } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
            throw error;
        }

        const matchedProduct = await findProductByNameFallback(identifier);

        if (matchedProduct) {
            return matchedProduct;
        }

        throw error;
    }
};
