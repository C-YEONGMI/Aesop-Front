import protectiveLipBalmSpf30Image from '../../assets/Protective Lip Balm SPF30.png';
import { inferProductCategoryLabel } from '../../data/productCategories';

const BROKEN_IMAGE_URLS = new Map([
    [
        'https://kr.aesop.com/dw/image/v2/AARM_PRD/on/demandware.static/-/Sites-aesop-master-catalog/ko_KR/dw76bc2cc6/images/products/SK52/Aesop-Skin-Protective-Lip-Balm-SPF30-5-5g-large.png',
        'https://kr.aesop.com/dw/image/v2/AARM_PRD/on/demandware.static/-/Sites-aesop-master-catalog/ko_KR/dw76bc2cc6/images/products/SK52/Aesop-Skin-Protective-Lip-Balm-SPF30-5-5g-large.jpg?bgcolor=fffef2&q=70&sfrm=jpg&sh=430&sm=cut&sw=430',
    ],
    ['/src/assets/Protective Lip Balm SPF30.png', protectiveLipBalmSpf30Image],
]);

const normalizeImageUrl = (url = '') => BROKEN_IMAGE_URLS.get(url) || url;

const getNormalizedString = (value) => String(value || '').trim().toLowerCase();

export const getProductDetailKey = (product = {}) => {
    const preferredKey =
        product.slug ||
        product.id ||
        product.sourceId ||
        (product.newestId ? String(product.newestId) : '') ||
        (product.popularId ? String(product.popularId) : '') ||
        product.name ||
        '';

    return String(preferredKey || '');
};

export const getProductDetailPath = (product = {}) =>
    `/product/${encodeURIComponent(getProductDetailKey(product))}`;

export const getProductDetailCandidates = (product = {}) =>
    [
        product.slug,
        product.id,
        product.sourceId,
        product.newestId,
        product.popularId,
        product.name,
    ]
        .filter((value) => value !== undefined && value !== null && value !== '')
        .map((value) => String(value));

export const matchesProductDetailParam = (product = {}, detailParam = '') => {
    const decodedParam = decodeURIComponent(String(detailParam || ''));
    const normalizedParam = getNormalizedString(decodedParam);

    if (!normalizedParam) {
        return false;
    }

    return getProductDetailCandidates(product).some(
        (candidate) => getNormalizedString(candidate) === normalizedParam
    );
};

export const findProductByDetailParam = (products = [], detailParam = '') =>
    products.find((product) => matchesProductDetailParam(product, detailParam)) || null;

export const normalizeProduct = (product = {}) => ({
    ...product,
    category: inferProductCategoryLabel(product),
    badge: Array.isArray(product.badge)
        ? product.badge
        : Array.isArray(product.badges)
          ? product.badges
          : [],
    status: typeof product.status === 'boolean' ? product.status : product.status !== false,
    variants: Array.isArray(product.variants)
        ? product.variants.map((variant) => ({
              ...variant,
              image: normalizeImageUrl(variant.image),
          }))
        : [],
    detailKey: getProductDetailKey(product),
});

export const normalizeProductCollection = (products = []) =>
    (Array.isArray(products) ? products : []).map((product) => normalizeProduct(product));
