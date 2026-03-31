/**
 * GNB 메뉴 데이터 — Single Source of Truth
 *
 * type:
 *   "mega"   → MegaMenu (전체 너비 패널, 컬럼 그리드)
 *   "simple" → SimpleDropdown (좁은 드롭다운)
 *   "link"   → 드롭다운 없이 바로 페이지 이동
 *
 * 3depth의 classification:
 *   products.json의 classifications 필드와 정확히 일치하는 { category, subcategory } 쌍.
 *   Products 페이지에서 이 값으로 제품을 필터링한다.
 */

export const menuData = [
    {
        label: 'DISCOVER',
        type: 'simple',
        children: [
            { label: 'Gift finder', path: '/gift-guide' },
            { label: 'Fragrance finder', path: '/products/fragrance' },
        ],
    },
    {
        label: 'PRODUCTS',
        type: 'mega',
        path: '/products',
        children: [
            {
                label: 'SKIN CARE',
                path: '/products/skincare',
                children: [
                    { label: 'Cleansers', path: '/products/skincare/cleansers', classification: { category: 'Skin care', subcategory: 'Cleansers' } },
                    { label: 'Toners & mists', path: '/products/skincare/toners-mists', classification: { category: 'Skin care', subcategory: 'Toners & mists' } },
                    { label: 'Serums & masks', path: '/products/skincare/serums-masks', classification: { category: 'Skin care', subcategory: 'Serums & masks' } },
                    { label: 'Moisturisers', path: '/products/skincare/moisturisers', classification: { category: 'Skin care', subcategory: 'Moisturisers' } },
                    { label: 'Lip & eye care', path: '/products/skincare/lip-eye-care', classification: { category: 'Skin care', subcategory: 'Lip & eye care' } },
                    { label: 'Sun care', path: '/products/skincare/sun-care', classification: { category: 'Skin care', subcategory: 'Sun care' } },
                ],
            },
            {
                label: 'HAND & BODY',
                path: '/products/body',
                children: [
                    { label: 'Hand wash & balms', path: '/products/body/hand-wash-balms', classification: { category: 'Hand & body', subcategory: 'Hand wash & balms' } },
                    { label: 'Body cleansers', path: '/products/body/body-cleansers', classification: { category: 'Hand & body', subcategory: 'Body cleansers' } },
                    { label: 'Body balms & oils', path: '/products/body/body-balms-oils', classification: { category: 'Hand & body', subcategory: 'Body balms & oils' } },
                    { label: 'Deodorants', path: '/products/body/deodorants', classification: { category: 'Hand & body', subcategory: 'Deodorants' } },
                ],
            },
            {
                label: 'PERFUME',
                path: '/products/fragrance',
                children: [
                    { label: 'Floral', path: '/products/fragrance/floral', classification: { category: 'Fragrance', subcategory: 'Floral' } },
                    { label: 'Fresh', path: '/products/fragrance/fresh', classification: { category: 'Fragrance', subcategory: 'Fresh' } },
                    { label: 'Woody', path: '/products/fragrance/woody', classification: { category: 'Fragrance', subcategory: 'Woody' } },
                    { label: 'Opulent', path: '/products/fragrance/opulent', classification: { category: 'Fragrance', subcategory: 'Opulent' } },
                ],
            },
            {
                label: 'HOME & LIVING',
                path: '/products/home',
                children: [
                    { label: 'Room sprays', path: '/products/home/room-sprays', classification: { category: 'Home & living', subcategory: 'Room sprays' } },
                    { label: 'Incense & holders', path: '/products/home/incense-holders', classification: { category: 'Home & living', subcategory: 'Incense & holders' } },
                    { label: 'Oils & burners', path: '/products/home/oils-burners', classification: { category: 'Home & living', subcategory: 'Oils & burners' } },
                    { label: 'Candles', path: '/products/home/candles', classification: { category: 'Home & living', subcategory: 'Candles' } },
                    { label: 'Bathroom', path: '/products/home/bathroom', classification: { category: 'Home & living', subcategory: 'Bathroom' } },
                ],
            },
            {
                label: 'HAIR & SHAVING',
                path: '/products/hair',
                children: [
                    { label: 'Shampoos & conditioners', path: '/products/hair/shampoos-conditioners', classification: { category: 'Hair & shaving', subcategory: 'Shampoos & conditioners' } },
                    { label: 'Hair treatments', path: '/products/hair/hair-treatments', classification: { category: 'Hair & shaving', subcategory: 'Hair treatments' } },
                    { label: 'Hair styling', path: '/products/hair/hair-styling', classification: { category: 'Hair & shaving', subcategory: 'Hair styling' } },
                    { label: 'Shaving', path: '/products/hair/shaving', classification: { category: 'Hair & shaving', subcategory: 'Shaving' } },
                ],
            },
            {
                label: 'KITS',
                path: '/products/kits',
                children: [
                    { label: 'Skin care kits', path: '/products/kits/skin-care-kits', classification: { category: 'Kits', subcategory: 'Skin care kits' } },
                    { label: 'Hand & body kits', path: '/products/kits/hand-body-kits', classification: { category: 'Kits', subcategory: 'Hand & body kits' } },
                    { label: 'Fragrance kits', path: '/products/kits/fragrance-kits', classification: { category: 'Kits', subcategory: 'Fragrance kits' } },
                    { label: 'Travel kits', path: '/products/kits/travel-kits', classification: { category: 'Kits', subcategory: 'Travel kits' } },
                ],
            },
        ],
    },
    {
        label: 'BENEFITS',
        type: 'simple',
        children: [
            { label: 'Online exclusive', path: '/benefits/official' },
            { label: 'Korea exclusive', path: '/benefits/kr-exclusive' },
        ],
    },
    {
        label: 'OUR STORY',
        type: 'link',
        path: '/our-story',
    },
    {
        label: 'SUPPORT',
        type: 'simple',
        path: '/support',
        children: [
            { label: 'Notices', path: '/support/notices' },
            { label: 'FAQ', path: '/support/faq' },
            { label: 'Contact us', path: '/support/contact' },
            { label: 'Live chat', path: '/support/live-chat' },
            { label: 'Store locator', path: '/support/store-locator' },
        ],
    },
];

/**
 * URL slug → classification 매핑 조회
 * 예: getClassification('skincare', 'cleansers') → { category: 'Skin care', subcategory: 'Cleansers' }
 */
const buildSlugMap = () => {
    const map = {};
    const productsMenu = menuData.find((item) => item.label === 'PRODUCTS');

    if (!productsMenu?.children) return map;

    for (const depth2 of productsMenu.children) {
        if (!depth2.children) continue;

        for (const depth3 of depth2.children) {
            if (!depth3.classification) continue;

            // path: '/products/skincare/cleansers' → slugs: ['skincare', 'cleansers']
            const segments = depth3.path.split('/').filter(Boolean);
            const categorySlug = segments[1]; // 'skincare'
            const subSlug = segments[2]; // 'cleansers'

            if (categorySlug && subSlug) {
                map[`${categorySlug}/${subSlug}`] = depth3.classification;
            }
        }
    }

    return map;
};

const SLUG_TO_CLASSIFICATION = buildSlugMap();

export const getClassification = (categorySlug, subcategorySlug) =>
    SLUG_TO_CLASSIFICATION[`${categorySlug}/${subcategorySlug}`] || null;
