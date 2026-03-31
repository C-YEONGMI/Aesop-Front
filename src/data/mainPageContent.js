// 메인페이지 전용 콘텐츠 데이터
// 카피, 문구, 큐레이션 상품명 등을 관리합니다.

// ────────────────────────────────────────────────────────────
// 베스트 상품 고정 큐레이션 (3개 직접 지정 - 랜덤 금지)
// ────────────────────────────────────────────────────────────
export const BEST_PRODUCT_NAMES = [
    "파슬리 씨드 안티 옥시던트 페이셜 토너",   // 소형(좌)
    "루센트 페이셜 나이트 마스크",              // 대형(중앙)
    "카모마일 컨센트레이트 안티 블레미쉬 마스크", // 소형(우)
];

// ────────────────────────────────────────────────────────────
// Intro Copy 섹션
// ────────────────────────────────────────────────────────────
export const introCopyContent = {
    mainCopy: "시간이 지나도 변함없는 가치. 세심하게 조제되어\n모든 시간 꾸준히 사랑받아 온 이솝의 대표 제품들을 소개합니다.",
    subCopy: "A value that remains over time. Carefully formulated and\nquietly beloved, these are some of\nAesop’s most enduring favourites.",
};

// ────────────────────────────────────────────────────────────
// Official Online Exclusive 섹션
// ────────────────────────────────────────────────────────────
export const officialExclusiveContent = {
    title: "Official Online Exclusive",
    description: "이솝 공식몰에서만 만날 수 있는\n특별한 구성과 혜택을 경험하세요.",
    items: [
        "공식몰 단독 세트 구성",
        "샘플 증정 혜택",
        "선물 포장 서비스",
        "온라인 단독 에디션",
    ],
};

// ────────────────────────────────────────────────────────────
// Best Gift 섹션
// ────────────────────────────────────────────────────────────
export const bestGiftContent = {
    label: "이솝의 베스트 기프트",
    title: "Best Gift",
    description: "Receive a Complimentary\nGift Set",
    subDescription: "소중한 사람에게 전하는 가장 섬세한 선물.\n정성스러운 패키징과 함께 마음을 전하세요.",
    ctaText: "선물 보러가기",
    ctaLink: "/gift-guide",
};

// ────────────────────────────────────────────────────────────
// Korea Exclusive 섹션
// ────────────────────────────────────────────────────────────
export const koreaExclusiveContent = {
    label: "한국 단독 구성",
    title: "Korea Exclusive",
    description: "한국 시장을 위해 특별히 기획된\n이솝의 한정 에디션을 만나보세요.\n지역성과 브랜드 철학이 어우러진 특별한 구성입니다.",
    ctaText: "더 보기",
    ctaLink: "/benefits/kr-exclusive",
};

// ────────────────────────────────────────────────────────────
// About Teaser 섹션
// ────────────────────────────────────────────────────────────
export const aboutTeaserContent = {
    wordmark: "About",
    description: "1987년 호주 멜버른에서 시작된\n이솝의 이야기",
    ctaText: "브랜드 스토리",
    ctaLink: "/our-story",
};

// ────────────────────────────────────────────────────────────
// New Arrival 섹션
// ────────────────────────────────────────────────────────────
export const newArrivalContent = {
    label: "New Arrival",
    title: "새롭게 선보이는\n이솝의 제품",
    description: "익숙한 이솝의 철학 위에\n새로운 제안을 더했습니다.",
    ctaText: "신제품 보기",
    ctaLink: "/products",
    // 신제품으로 보여줄 상품명 (New 배지 기준)
    productName: "루센트 페이셜 나이트 마스크",
};

// ────────────────────────────────────────────────────────────
// Product Navigator 섹션
// ────────────────────────────────────────────────────────────
export const productNavigatorContent = {
    title: "Product",
    centerCategory: "Skincare",
    leftCategories: [
        { label: "스킨케어", link: "/products/skincare" },
        { label: "핸드 & 바디", link: "/products/body" },
        { label: "퍼퓸", link: "/products/fragrance" },
        { label: "홈 & 리빙", link: "/products/home" },
    ],
    rightCategories: [
        { label: "헤어 & 쉐이빙", link: "/products/hair" },
        { label: "기프트", link: "/gift-guide" },
        { label: "키트", link: "/products/kits" },
    ],
};
