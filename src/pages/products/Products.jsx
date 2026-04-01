import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import Grid from 'react-virtualized/dist/es/Grid';
import InfiniteLoader from 'react-virtualized/dist/es/InfiniteLoader';
import { ChevronDown } from 'lucide-react';
import AddToCartButton from '../../components/common/button/AddToCartButton';
import Best from '../../components/common/badge/Best';
import New from '../../components/common/badge/New';
import Exclusive from '../../components/common/badge/Exclusive';
import ProductFilterRail from '../../components/ui/ProductFilterRail';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { addToCart } from '../../app/store/slices/cartSlice';
import {
    fetchProductCatalog,
    fetchProductReferenceCatalog,
} from '../../app/store/slices/productSlice';
import {
    selectGiftFilters,
    selectHasNextProductPage,
    selectIsProductAppending,
    selectLoadedProductPages,
    selectProductAppendError,
    selectProductError,
    selectProductPagination,
    selectProductReferenceItems,
    selectProducts,
    selectProductStatus,
} from '../../app/store/selectors/productSelectors';
import { selectWishlistItems } from '../../app/store/selectors/wishlistSelectors';
import { toggleWishlistItem } from '../../app/store/slices/wishlistSlice';
import useRequireLoginAction from '../../hooks/useRequireLoginAction';
import { getProductDetailPath } from '../../lib/products/productShape';
import {
    PRODUCT_CATEGORY_CONFIG,
    getCategoryLabelFromValue,
    getCategorySlugFromValue,
} from '../../data/productCategories';
import { getClassification, menuData } from '../../components/layout/navigation/menuData';
import './Products.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const SORT_OPTIONS = [
    { value: 'default', label: '기본순' },
    { value: 'best', label: '인기순' },
    { value: 'new', label: '최신순' },
    { value: 'price-asc', label: '낮은 가격순' },
    { value: 'price-desc', label: '높은 가격순' },
];

const PRICE_RANGE_OPTIONS = [
    { value: 'under-50000', label: '5만원 이하', min: 0, max: 50000 },
    { value: '50000-100000', label: '5만원 - 10만원', min: 50000, max: 100000 },
    { value: '100000-200000', label: '10만원 - 20만원', min: 100000, max: 200000 },
    {
        value: '200000-plus',
        label: '20만원 이상',
        min: 200000,
        max: Number.POSITIVE_INFINITY,
    },
];

const formatBreadcrumbLabel = (value = '') =>
    value.replace(/[A-Za-z]+/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);

const formatCategoryDisplayLabel = (value = '') => value.replace(/\s*(?:&|·)\s*/g, ' · ');

const getCategorySlugFromPath = (path = '') => path.split('/').filter(Boolean)[1] || '';
const getSubcategorySlugFromPath = (path = '') => path.split('/').filter(Boolean)[2] || '';

const getViewportWidth = () => {
    if (typeof window === 'undefined') {
        return 1440;
    }

    return window.innerWidth;
};

const getColumnCount = (viewportWidth) => {
    if (viewportWidth > 1760) {
        return 4;
    }

    if (viewportWidth > 1439) {
        return 3;
    }

    return 2;
};

const getHorizontalGap = (viewportWidth) => (viewportWidth < 768 ? 10 : viewportWidth <= 1439 ? 12 : 16);
const getVerticalGap = (viewportWidth) => (viewportWidth < 768 ? 24 : viewportWidth <= 1760 ? 32 : 40);

const getRowHeight = (cardWidth, viewportWidth) => {
    const infoHeight = viewportWidth < 768 ? 178 : 194;
    return cardWidth + infoHeight + getVerticalGap(viewportWidth);
};

const toPositiveInteger = (value, fallbackValue) => {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
};

const matchesProductSearchQuery = (product, query = '') => {
    const normalizedQuery = String(query || '').trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [product?.name, product?.description, product?.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

const getWindowMetrics = (containerNode) => {
    if (typeof window === 'undefined') {
        return { height: 0, scrollTop: 0, viewportWidth: 1440 };
    }

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const windowScrollTop = window.pageYOffset || window.scrollY || 0;

    if (!containerNode) {
        return { height: viewportHeight, scrollTop: windowScrollTop, viewportWidth };
    }

    const containerOffsetTop =
        containerNode.getBoundingClientRect().top + windowScrollTop;

    return {
        height: viewportHeight,
        scrollTop: Math.max(0, windowScrollTop - containerOffsetTop),
        viewportWidth,
    };
};

const renderBadge = (badge) => {
    switch (badge) {
        case 'Best':
            return <Best key={badge} />;
        case 'New':
            return <New key={badge} />;
        case 'Exclusive':
            return <Exclusive key={badge} />;
        default:
            return (
                <span key={badge} className="badge">
                    {badge}
                </span>
            );
    }
};

const Products = () => {
    const { category, subcategory } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const products = useAppSelector(selectProducts);
    const referenceProducts = useAppSelector(selectProductReferenceItems);
    const giftFilters = useAppSelector(selectGiftFilters);
    const productStatus = useAppSelector(selectProductStatus);
    const productError = useAppSelector(selectProductError);
    const productAppendError = useAppSelector(selectProductAppendError);
    const productPagination = useAppSelector(selectProductPagination);
    const loadedPages = useAppSelector(selectLoadedProductPages);
    const hasNextPage = useAppSelector(selectHasNextProductPage);
    const isAppending = useAppSelector(selectIsProductAppending);
    const wishlist = useAppSelector(selectWishlistItems);
    const requireLoginAction = useRequireLoginAction();
    const skipRouteCategorySyncRef = useRef(false);
    const infiniteLoaderRef = useRef(null);
    const gridStageRef = useRef(null);
    const scrollFrameRef = useRef(null);
    const scrollIdleTimerRef = useRef(null);

    const [sort, setSort] = useState('default');
    const [activeCategories, setActiveCategories] = useState(() => (category ? [category] : []));
    const [activeGiftFilters, setActiveGiftFilters] = useState([]);
    const [activePriceRanges, setActivePriceRanges] = useState([]);
    const [windowMetrics, setWindowMetrics] = useState(() =>
        getWindowMetrics(gridStageRef.current)
    );
    const [isWindowScrolling, setIsWindowScrolling] = useState(false);

    const initialRequestedPage = toPositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
    const limit = toPositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);
    const q = searchParams.get('q')?.trim() || '';
    const categoryConfig = category ? PRODUCT_CATEGORY_CONFIG[category] : null;
    const routeCategorySlug = categoryConfig?.slug || '';
    const navigationProducts = referenceProducts.length > 0 ? referenceProducts : products;
    const catalogRequestKey = `${routeCategorySlug}|${q}|${sort}|${limit}`;

    useEffect(() => {
        dispatch(fetchProductReferenceCatalog());
    }, [dispatch]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const updateWindowMetrics = () => {
            scrollFrameRef.current = null;
            setWindowMetrics(getWindowMetrics(gridStageRef.current));
            setIsWindowScrolling(true);

            window.clearTimeout(scrollIdleTimerRef.current);
            scrollIdleTimerRef.current = window.setTimeout(() => {
                setIsWindowScrolling(false);
            }, 140);
        };

        const requestWindowMetricsUpdate = () => {
            if (scrollFrameRef.current !== null) {
                return;
            }

            scrollFrameRef.current = window.requestAnimationFrame(updateWindowMetrics);
        };

        requestWindowMetricsUpdate();
        window.addEventListener('scroll', requestWindowMetricsUpdate, { passive: true });
        window.addEventListener('resize', requestWindowMetricsUpdate);

        return () => {
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }

            window.clearTimeout(scrollIdleTimerRef.current);
            window.removeEventListener('scroll', requestWindowMetricsUpdate);
            window.removeEventListener('resize', requestWindowMetricsUpdate);
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        const bootstrapCatalog = async () => {
            try {
                await dispatch(
                    fetchProductCatalog({
                        page: 1,
                        limit,
                        category: routeCategorySlug,
                        q,
                        sort,
                    })
                ).unwrap();

                for (let nextPage = 2; isActive && nextPage <= initialRequestedPage; nextPage += 1) {
                    await dispatch(
                        fetchProductCatalog({
                            page: nextPage,
                            limit,
                            category: routeCategorySlug,
                            q,
                            sort,
                            append: true,
                        })
                    ).unwrap();
                }
            } catch {
                // Slice state handles errors.
            }
        };

        bootstrapCatalog();
        infiniteLoaderRef.current?.resetLoadMoreRowsCache?.(true);

        return () => {
            isActive = false;
        };
    }, [dispatch, initialRequestedPage, limit, q, routeCategorySlug, sort]);

    useEffect(() => {
        if (skipRouteCategorySyncRef.current) {
            skipRouteCategorySyncRef.current = false;
            return;
        }

        setActiveCategories(routeCategorySlug ? [routeCategorySlug] : []);
    }, [routeCategorySlug]);

    const classificationMatch =
        subcategory && category ? getClassification(category, subcategory) : null;

    const subcategoryFilteredProducts = useMemo(() => {
        if (!classificationMatch) {
            return null;
        }

        return products.filter((product) =>
            product.classifications?.some(
                (classification) =>
                    classification.category === classificationMatch.category &&
                    classification.subcategory === classificationMatch.subcategory
            )
        );
    }, [classificationMatch, products]);

    const categoryFilteredProducts = useMemo(() => {
        if (subcategoryFilteredProducts) {
            return subcategoryFilteredProducts;
        }

        if (activeCategories.length === 0) {
            return [...products];
        }

        return products.filter((product) =>
            activeCategories.includes(getCategorySlugFromValue(product.category))
        );
    }, [activeCategories, products, subcategoryFilteredProducts]);

    const selectedGiftProductNames = useMemo(() => {
        if (activeGiftFilters.length === 0) {
            return [];
        }

        return [
            ...new Set(
                activeGiftFilters.flatMap((filterId) => {
                    const selectedFilter = giftFilters.find((filter) => filter.filterId === filterId);
                    return selectedFilter?.recommendedProducts || [];
                })
            ),
        ];
    }, [activeGiftFilters, giftFilters]);

    const giftFilteredProducts = useMemo(() => {
        if (selectedGiftProductNames.length === 0) {
            return categoryFilteredProducts;
        }

        return categoryFilteredProducts.filter((product) =>
            selectedGiftProductNames.includes(product.name)
        );
    }, [categoryFilteredProducts, selectedGiftProductNames]);

    const productNavigationCategories = useMemo(() => {
        const productsMenu = menuData.find((item) => item.label === 'PRODUCTS');

        return (productsMenu?.children || []).map((item) => {
            const slug = getCategorySlugFromPath(item.path);

            return {
                slug,
                label: item.label,
                displayLabel: formatCategoryDisplayLabel(item.label),
                path: item.path,
                count: navigationProducts.filter(
                    (product) => getCategorySlugFromValue(product.category) === slug
                ).length,
                children: (item.children || []).map((child) => ({
                    ...child,
                    slug: getSubcategorySlugFromPath(child.path),
                    displayLabel: formatCategoryDisplayLabel(child.label),
                })),
            };
        });
    }, [navigationProducts]);

    const categoryOptions = useMemo(
        () => [
            { slug: 'all', label: 'ALL PRODUCTS', count: navigationProducts.length },
            ...Object.values(PRODUCT_CATEGORY_CONFIG).map((item) => ({
                slug: item.slug,
                label: item.label,
                count: navigationProducts.filter(
                    (product) => getCategorySlugFromValue(product.category) === item.slug
                ).length,
            })),
        ],
        [navigationProducts]
    );

    const activeCategorySlug = routeCategorySlug || activeCategories[0] || '';
    const activeNavigationCategory = useMemo(
        () => productNavigationCategories.find((item) => item.slug === activeCategorySlug) || null,
        [activeCategorySlug, productNavigationCategories]
    );

    const activeCategoryLabels = useMemo(
        () =>
            activeCategories
                .map(
                    (slug) =>
                        productNavigationCategories.find((item) => item.slug === slug)?.displayLabel ||
                        formatCategoryDisplayLabel(PRODUCT_CATEGORY_CONFIG[slug]?.label || '')
                )
                .filter(Boolean),
        [activeCategories, productNavigationCategories]
    );

    const pageTitle = classificationMatch
        ? formatCategoryDisplayLabel(classificationMatch.subcategory)
        : activeCategoryLabels.length === 1
          ? activeCategoryLabels[0]
          : '제품';

    const isSubcategoryView = Boolean(classificationMatch);
    const breadcrumbLabel = classificationMatch
        ? formatCategoryDisplayLabel(classificationMatch.subcategory)
        : activeCategoryLabels.length === 1
          ? activeCategoryLabels[0]
          : '전체 제품';

    const filtered = useMemo(() => {
        let list = [...giftFilteredProducts];

        if (activePriceRanges.length > 0) {
            list = list.filter((product) => {
                const price = product.variants[0]?.price || 0;

                return activePriceRanges.some((rangeValue) => {
                    const selectedRange = PRICE_RANGE_OPTIONS.find((range) => range.value === rangeValue);

                    if (!selectedRange) {
                        return false;
                    }

                    const isAboveMin = price >= selectedRange.min;
                    const isBelowMax = selectedRange.max === Number.POSITIVE_INFINITY
                        ? true
                        : price <= selectedRange.max;

                    return isAboveMin && isBelowMax;
                });
            });
        }

        switch (sort) {
            case 'best':
                return [...list].sort((left, right) => left.popularId - right.popularId);
            case 'new':
                return [...list].sort((left, right) => left.newestId - right.newestId);
            case 'price-asc':
                return [...list].sort((left, right) => (left.variants[0]?.price || 0) - (right.variants[0]?.price || 0));
            case 'price-desc':
                return [...list].sort((left, right) => (right.variants[0]?.price || 0) - (left.variants[0]?.price || 0));
            default:
                return list;
        }
    }, [activePriceRanges, giftFilteredProducts, sort]);

    const exactFilteredCount = useMemo(() => {
        const sourceProducts = referenceProducts.length > 0 ? referenceProducts : products;
        let list = [...sourceProducts];

        if (classificationMatch) {
            list = list.filter((product) =>
                product.classifications?.some(
                    (classification) =>
                        classification.category === classificationMatch.category &&
                        classification.subcategory === classificationMatch.subcategory
                )
            );
        } else if (activeCategories.length > 0) {
            list = list.filter((product) =>
                activeCategories.includes(getCategorySlugFromValue(product.category))
            );
        }

        if (q) {
            list = list.filter((product) => matchesProductSearchQuery(product, q));
        }

        if (selectedGiftProductNames.length > 0) {
            list = list.filter((product) => selectedGiftProductNames.includes(product.name));
        }

        if (activePriceRanges.length > 0) {
            list = list.filter((product) => {
                const price = product.variants?.[0]?.price || 0;

                return activePriceRanges.some((rangeValue) => {
                    const selectedRange = PRICE_RANGE_OPTIONS.find((range) => range.value === rangeValue);

                    if (!selectedRange) {
                        return false;
                    }

                    const isAboveMin = price >= selectedRange.min;
                    const isBelowMax =
                        selectedRange.max === Number.POSITIVE_INFINITY
                            ? true
                            : price <= selectedRange.max;

                    return isAboveMin && isBelowMax;
                });
            });
        }

        return list.length;
    }, [
        activeCategories,
        activePriceRanges,
        classificationMatch,
        products,
        q,
        referenceProducts,
        selectedGiftProductNames,
    ]);

    const hasClientOnlyFilters =
        Boolean(classificationMatch) ||
        activeGiftFilters.length > 0 ||
        activePriceRanges.length > 0;
    const isAllProductsView = !classificationMatch && activeCategoryLabels.length !== 1;
    const displayPageTitle = isAllProductsView ? 'Products' : pageTitle;
    const displayBreadcrumbLabel = isAllProductsView
        ? 'All Products'
        : formatBreadcrumbLabel(breadcrumbLabel);

    const loadNextPage = useCallback(async () => {
        if (!hasNextPage || isAppending || productStatus === 'loading' || productAppendError) {
            return;
        }

        const nextPage = (productPagination.page || 1) + 1;

        if (loadedPages.includes(nextPage)) {
            return;
        }

        try {
            await dispatch(
                fetchProductCatalog({
                    page: nextPage,
                    limit,
                    category: routeCategorySlug,
                    q,
                    sort,
                    append: true,
                })
            ).unwrap();
        } catch {
            // Slice state handles errors.
        }
    }, [
        dispatch,
        hasNextPage,
        isAppending,
        limit,
        loadedPages,
        productAppendError,
        productPagination.page,
        productStatus,
        q,
        routeCategorySlug,
        sort,
    ]);

    const handleLoadMoreRetry = () => {
        const nextPage = (productPagination.page || 1) + 1;

        if (loadedPages.includes(nextPage)) {
            return;
        }

        void dispatch(
            fetchProductCatalog({
                page: nextPage,
                limit,
                category: routeCategorySlug,
                q,
                sort,
                append: true,
            })
        );
    };

    useEffect(() => {
        if (
            hasClientOnlyFilters &&
            hasNextPage &&
            !isAppending &&
            productStatus !== 'loading' &&
            products.length > 0 &&
            filtered.length === 0
        ) {
            void loadNextPage();
        }
    }, [
        filtered.length,
        hasClientOnlyFilters,
        hasNextPage,
        isAppending,
        loadNextPage,
        productStatus,
        products.length,
    ]);

    useEffect(() => {
        setWindowMetrics(getWindowMetrics(gridStageRef.current));
    }, [
        activeGiftFilters,
        activePriceRanges,
        catalogRequestKey,
        filtered.length,
        subcategory,
    ]);

    const syncRouteForCategories = (nextCategories) => {
        const nextPath = nextCategories.length === 1 ? `/products/${nextCategories[0]}` : '/products';

        if (location.pathname === nextPath) {
            return;
        }

        skipRouteCategorySyncRef.current = true;
        navigate(nextPath, {
            state: { preserveScroll: true },
        });
    };

    const handleCategorySelect = (categorySlug) => {
        const nextCategories = categorySlug ? [categorySlug] : [];
        setActiveCategories(nextCategories);
        syncRouteForCategories(nextCategories);
    };

    const handleCategoryToggle = (categorySlug) => {
        const nextCategories = activeCategories.includes(categorySlug) ? [] : [categorySlug];
        setActiveCategories(nextCategories);
        syncRouteForCategories(nextCategories);
    };

    const handlePriceRangeToggle = (rangeValue) => {
        setActivePriceRanges((current) =>
            current.includes(rangeValue)
                ? current.filter((value) => value !== rangeValue)
                : [...current, rangeValue]
        );
    };

    const handleGiftFilterToggle = (filterId) => {
        setActiveGiftFilters((current) =>
            current.includes(filterId)
                ? current.filter((value) => value !== filterId)
                : [...current, filterId]
        );
    };

    const handleClearAllFilters = () => {
        setActiveCategories([]);
        setActiveGiftFilters([]);
        setActivePriceRanges([]);
        syncRouteForCategories([]);
    };

    const handleWishlistToggle = (productName) => {
        requireLoginAction(() => dispatch(toggleWishlistItem(productName)));
    };

    const handleAddToCart = (product) => {
        requireLoginAction(() => dispatch(addToCart({ product, variantIndex: 0 })));
    };

    const handleRetry = () => {
        dispatch(
            fetchProductCatalog({
                page: 1,
                limit,
                category: routeCategorySlug,
                q,
                sort,
            })
        );
    };

    const renderProductCard = useCallback(
        (product) => {
            const isWishlisted = wishlist.includes(product.name);
            const isSoldOut = product.status === false;

            return (
                <div className={`products-page__card${isSoldOut ? ' is-sold-out' : ''}`}>
                    {isSoldOut ? <div className="products-page__sold-out-overlay" /> : null}
                    <div className="products-page__card-img-wrap">
                        <div className="products-page__card-overlay">
                            <div className="products-page__card-badges">
                                {(product.badge || []).map((badge) => renderBadge(badge))}
                            </div>
                            <button
                                type="button"
                                className={`products-page__wish-btn ${isWishlisted ? 'active' : ''}`}
                                onClick={() => handleWishlistToggle(product.name)}
                                aria-label="위시리스트 토글"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        </div>
                        <Link to={getProductDetailPath(product)} className="products-page__card-img-link">
                            <img src={product.variants[0]?.image} alt={product.name} className="products-page__card-img" />
                        </Link>
                    </div>
                    <div className="products-page__card-info">
                        <div className="products-page__card-copy">
                            <div className="products-page__card-copy-inner">
                                <p className="products-page__card-category suit-12-r">
                                    {formatCategoryDisplayLabel(getCategoryLabelFromValue(product.category))}
                                </p>
                                <p className="products-page__card-name suit-18-m">{product.name}</p>
                                <p className="products-page__card-desc suit-14-m">{product.description}</p>
                                <p className="products-page__card-price suit-16-r">
                                    {product.variants[0]?.price?.toLocaleString('ko-KR')}원
                                </p>
                            </div>
                        </div>
                        <div className="products-page__card-actions">
                            <div className="products-page__card-actions-inner">
                                <AddToCartButton
                                    className="products-page__add-btn"
                                    text={product.status === false ? '품절' : '장바구니 담기'}
                                    width="100%"
                                    disabled={product.status === false}
                                    onClick={() => handleAddToCart(product)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
        [handleAddToCart, wishlist]
    );

    const isInitialLoading = productStatus === 'loading' && products.length === 0;
    const hasError = productStatus === 'failed' && products.length === 0;
    const hasVisibleProducts = filtered.length > 0;
    const countLabel = exactFilteredCount.toLocaleString('ko-KR');
    const virtualizedKey = `${catalogRequestKey}|${subcategory || ''}|${activeGiftFilters.join(',')}|${activePriceRanges.join(',')}`;
    return (
        <div className="products-page">
            <div className="products-page__header-space" />

            <div className="products-page__shell">
                <div className="products-page__inner">
                    <div className="products-page__title-area">
                        <nav className="products-page__breadcrumb suit-14-m">
                            <Link to="/">Home</Link>
                            <span> / </span>
                            {classificationMatch && category ? (
                                <>
                                    <Link to={`/products/${category}`}>
                                        {formatCategoryDisplayLabel(
                                            formatBreadcrumbLabel(PRODUCT_CATEGORY_CONFIG[category]?.label || category)
                                        )}
                                    </Link>
                                    <span> / </span>
                                    <span>{displayBreadcrumbLabel}</span>
                                </>
                            ) : (
                                <span>{displayBreadcrumbLabel}</span>
                            )}
                        </nav>
                        <h1 className="montage-80">{displayPageTitle}</h1>
                    </div>

                    <div className="products-page__body">
                        <div className="products-page__rail">
                            <ProductFilterRail
                                categories={categoryOptions}
                                activeCategories={activeCategories}
                                onCategoryToggle={handleCategoryToggle}
                                giftFilterOptions={giftFilters}
                                activeGiftFilters={activeGiftFilters}
                                onGiftFilterToggle={handleGiftFilterToggle}
                                priceRangeOptions={PRICE_RANGE_OPTIONS}
                                activePriceRanges={activePriceRanges}
                                onPriceRangeToggle={handlePriceRangeToggle}
                                onClearAllFilters={handleClearAllFilters}
                                showCategorySection={false}
                                includeCategorySummary={false}
                            />
                        </div>

                        <div className="products-page__content">
                            <section
                                className={`products-page__category-nav ${
                                    isSubcategoryView ? 'products-page__category-nav--subcategory' : ''
                                }`}
                                aria-label="제품 카테고리 내비게이션"
                            >
                                <div className="products-page__category-tabs">
                                    <button
                                        type="button"
                                        className={`products-page__category-tab suit-14-m ${
                                            activeCategories.length === 0 ? 'is-active' : ''
                                        }`}
                                        onClick={() => handleCategorySelect('')}
                                    >
                                        전체
                                    </button>

                                    {productNavigationCategories.map((item) => (
                                        <button
                                            key={item.slug}
                                            type="button"
                                            className={`products-page__category-tab suit-14-m ${
                                                activeCategorySlug === item.slug ? 'is-active' : ''
                                            }`}
                                            onClick={() => handleCategorySelect(item.slug)}
                                        >
                                            {item.displayLabel}
                                        </button>
                                    ))}
                                </div>

                                {activeNavigationCategory?.children?.length ? (
                                    <div
                                        className={`products-page__subcategory-links ${
                                            isSubcategoryView
                                                ? 'products-page__subcategory-links--subcategory'
                                                : ''
                                        }`}
                                    >
                                        {activeNavigationCategory.children.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                state={{ preserveScroll: true }}
                                                className={`products-page__subcategory-link suit-16-r ${
                                                    subcategory === item.slug ? 'is-active' : ''
                                                } ${isSubcategoryView ? 'is-subcategory-view' : ''}`}
                                            >
                                                {item.displayLabel}
                                            </Link>
                                        ))}
                                    </div>
                                ) : null}
                            </section>

                            <div className="products-page__toolbar">
                                <div className="products-page__toolbar-copy">
                                    <p className="suit-16-r products-page__count">상품 {countLabel}개</p>
                                </div>

                                <div className="products-page__sort-wrap">
                                    <select
                                        className="products-page__sort-trigger suit-14-m"
                                        value={sort}
                                        onChange={(event) => setSort(event.target.value)}
                                        aria-label="상품 정렬"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="products-page__sort-icon" size={16} strokeWidth={1.8} />
                                </div>
                            </div>

                            {isInitialLoading ? (
                                <div className="products-page__empty suit-18-r">제품을 불러오는 중입니다.</div>
                            ) : hasError ? (
                                <div className="products-page__empty suit-18-r">
                                    <p>{productError || '제품을 불러오지 못했습니다.'}</p>
                                    <button
                                        type="button"
                                        className="products-page__category-tab suit-14-m"
                                        onClick={handleRetry}
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            ) : !hasVisibleProducts && !hasNextPage ? (
                                <div className="products-page__empty suit-18-r">
                                    선택한 조건에 맞는 제품이 없습니다.
                                </div>
                            ) : (
                                <div className="products-page__grid-stage" ref={gridStageRef}>
                                    <AutoSizer disableHeight>
                                        {({ width }) => {
                                            const viewportWidth = windowMetrics.viewportWidth || getViewportWidth();
                                            const columnCount = getColumnCount(viewportWidth);
                                            const horizontalGap = getHorizontalGap(viewportWidth);
                                            const verticalGap = getVerticalGap(viewportWidth);
                                            const cardWidth = Math.max(
                                                Math.floor((width - horizontalGap * (columnCount - 1)) / columnCount),
                                                0
                                            );
                                            const loadingRowWidth =
                                                cardWidth * columnCount +
                                                horizontalGap * Math.max(columnCount - 1, 0);
                                            const rowHeight = getRowHeight(cardWidth, viewportWidth);
                                            const actualRowCount = Math.ceil(filtered.length / columnCount);
                                            const rowCount = hasNextPage ? actualRowCount + 1 : actualRowCount;

                                            return (
                                                <InfiniteLoader
                                                    key={`${virtualizedKey}-${columnCount}`}
                                                    ref={infiniteLoaderRef}
                                                    isRowLoaded={({ index }) =>
                                                        !hasNextPage || index < actualRowCount
                                                    }
                                                    loadMoreRows={loadNextPage}
                                                    minimumBatchSize={1}
                                                    rowCount={Math.max(rowCount, 1)}
                                                    threshold={2}
                                                >
                                                    {({ onRowsRendered, registerChild }) => (
                                                        <Grid
                                                            key={`${virtualizedKey}-${columnCount}-grid`}
                                                            ref={(grid) => {
                                                                registerChild(grid);
                                                            }}
                                                            autoHeight
                                                            className="products-page__virtualized-grid"
                                                            columnCount={columnCount}
                                                            columnWidth={({ index }) =>
                                                                index === columnCount - 1
                                                                    ? cardWidth
                                                                    : cardWidth + horizontalGap
                                                            }
                                                            height={windowMetrics.height}
                                                            width={width}
                                                            rowCount={Math.max(rowCount, 1)}
                                                            rowHeight={rowHeight}
                                                            isScrolling={isWindowScrolling}
                                                            scrollTop={windowMetrics.scrollTop}
                                                            overscanRowCount={2}
                                                            onSectionRendered={({ rowStartIndex, rowStopIndex }) =>
                                                                onRowsRendered({
                                                                    startIndex: rowStartIndex,
                                                                    stopIndex: rowStopIndex,
                                                                })
                                                            }
                                                            cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                                                                const itemIndex = rowIndex * columnCount + columnIndex;
                                                                const isLoadingRow = rowIndex === actualRowCount && hasNextPage;

                                                                if (isLoadingRow) {
                                                                    if (columnIndex > 0) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <div
                                                                            key={key}
                                                                            style={{
                                                                                ...style,
                                                                                width: loadingRowWidth,
                                                                                paddingBottom: verticalGap,
                                                                                boxSizing: 'border-box',
                                                                            }}
                                                                            className="products-page__virtualized-cell"
                                                                        >
                                                                            <div className="products-page__loading-more suit-14-m">
                                                                                {productAppendError ? (
                                                                                    <>
                                                                                        <span>{productAppendError}</span>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="products-page__loading-more-action"
                                                                                            onClick={handleLoadMoreRetry}
                                                                                        >
                                                                                            다시 불러오기
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    '상품을 더 불러오는 중입니다...'
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                const product = filtered[itemIndex];

                                                                if (!product) {
                                                                    return null;
                                                                }

                                                                return (
                                                                    <div
                                                                        key={key}
                                                                        style={{
                                                                            ...style,
                                                                            width: cardWidth,
                                                                            paddingBottom: verticalGap,
                                                                            boxSizing: 'border-box',
                                                                        }}
                                                                        className="products-page__virtualized-cell"
                                                                    >
                                                                        {renderProductCard(product)}
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </InfiniteLoader>
                                            );
                                        }}
                                    </AutoSizer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
