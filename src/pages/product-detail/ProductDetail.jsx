import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { addToCart } from '../../app/store/slices/cartSlice';
import {
    addRecentlyViewed,
    clearCurrentProduct,
    fetchProductDetail,
} from '../../app/store/slices/productSlice';
import {
    selectCurrentProduct,
    selectCurrentProductError,
    selectCurrentProductStatus,
} from '../../app/store/selectors/productSelectors';
import { selectWishlistItems } from '../../app/store/selectors/wishlistSelectors';
import { toggleWishlistItem } from '../../app/store/slices/wishlistSlice';
import useRequireLoginAction from '../../hooks/useRequireLoginAction';
import { getCategoryLabelFromValue, getCategoryRouteFromValue } from '../../data/productCategories';
import './ProductDetail.scss';

const TABS = [
    { key: 'detail', label: '제품 상세' },
    { key: 'review', label: '리뷰' },
    { key: 'qna', label: '문의' },
];

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const product = useAppSelector(selectCurrentProduct);
    const productStatus = useAppSelector(selectCurrentProductStatus);
    const productError = useAppSelector(selectCurrentProductError);
    const wishlist = useAppSelector(selectWishlistItems);
    const requireLoginAction = useRequireLoginAction();
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [activeTab, setActiveTab] = useState('detail');

    useEffect(() => {
        dispatch(clearCurrentProduct());

        if (id) {
            dispatch(fetchProductDetail(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        setSelectedVariant(0);
    }, [product?.id, product?.name]);

    useEffect(() => {
        if (product?.name) {
            dispatch(addRecentlyViewed(product.name));
        }
    }, [dispatch, product?.name]);

    const handleRetry = () => {
        if (id) {
            dispatch(fetchProductDetail(id));
        }
    };

    if (productStatus === 'loading' && !product) {
        return (
            <div className="product-detail__not-found">
                <div className="product-detail__header-space" />
                <p className="suit-18-r">제품을 불러오는 중입니다.</p>
            </div>
        );
    }

    if (productStatus === 'failed') {
        return (
            <div className="product-detail__not-found">
                <div className="product-detail__header-space" />
                <p className="suit-18-r">{productError || '제품을 불러오지 못했습니다.'}</p>
                <div className="product-detail__actions">
                    <button
                        type="button"
                        className="product-detail__add-btn suit-18-m"
                        onClick={handleRetry}
                    >
                        다시 시도
                    </button>
                    <Link to="/products" className="product-detail__buy-btn suit-18-m">
                        제품 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail__not-found">
                <div className="product-detail__header-space" />
                <p className="suit-18-r">상품을 찾을 수 없습니다.</p>
                <Link to="/products" className="optima-16">
                    제품 목록으로 돌아가기
                </Link>
            </div>
        );
    }

    const variant = product.variants[selectedVariant] || product.variants[0];
    const categoryPath = getCategoryRouteFromValue(product.category);
    const categoryLabel = getCategoryLabelFromValue(product.category);
    const isWished = wishlist.includes(product.name);

    const handleAddToCart = () => {
        requireLoginAction(() =>
            dispatch(addToCart({ product, variantIndex: selectedVariant }))
        );
    };

    const handleBuyNow = () => {
        requireLoginAction(() => {
            dispatch(
                addToCart({
                    product,
                    variantIndex: selectedVariant,
                    options: { showDialog: false },
                })
            );
            navigate('/cart');
        });
    };

    const handleWishlistToggle = () => {
        requireLoginAction(() => dispatch(toggleWishlistItem(product.name)));
    };

    return (
        <div className="product-detail">
            <div className="product-detail__header-space" />
            <div className="product-detail__inner">
                <nav className="product-detail__breadcrumb suit-14-m">
                    <Link to="/">Home</Link>
                    <span> / </span>
                    <Link to={categoryPath}>{categoryLabel}</Link>
                    <span> / </span>
                    <span>{product.name}</span>
                </nav>

                <div className="product-detail__main">
                    <div className="product-detail__gallery">
                        <div className="product-detail__img-wrap">
                            <img src={variant?.image} alt={product.name} />
                        </div>
                    </div>

                    <div className="product-detail__info">
                        {product.badge?.length > 0 ? (
                            <div className="product-detail__badges">
                                {product.badge.map((badge) => (
                                    <span
                                        key={badge}
                                        className={`badge badge-${badge.toLowerCase()} suit-12-r`}
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <p className="product-detail__category suit-14-m">{categoryLabel}</p>
                        <h1 className="product-detail__name optima-40">{product.name}</h1>
                        <p className="product-detail__desc suit-18-r">{product.description}</p>

                        <p className="product-detail__price suit-26-sb">
                            {variant?.price?.toLocaleString('ko-KR')}원
                        </p>

                        {product.variants.length > 1 ? (
                            <div className="product-detail__variants">
                                <p className="suit-14-m">용량</p>
                                <div className="product-detail__variant-list">
                                    {product.variants.map((item, index) => (
                                        <button
                                            key={`${item.capacity}-${index}`}
                                            type="button"
                                            className={`product-detail__variant-btn suit-14-m ${
                                                selectedVariant === index ? 'active' : ''
                                            }`}
                                            onClick={() => setSelectedVariant(index)}
                                        >
                                            {item.capacity} · {item.price?.toLocaleString('ko-KR')}원
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="product-detail__actions">
                            <button
                                type="button"
                                className="product-detail__add-btn suit-18-m"
                                onClick={handleAddToCart}
                                disabled={product.status === false}
                            >
                                {product.status === false ? '품절' : '장바구니 담기'}
                            </button>
                            <button
                                type="button"
                                className="product-detail__buy-btn suit-18-m"
                                onClick={handleBuyNow}
                                disabled={product.status === false}
                            >
                                {product.status === false ? '품절' : '바로 구매'}
                            </button>
                            <button
                                type="button"
                                className={`product-detail__wish-btn ${isWished ? 'active' : ''}`}
                                onClick={handleWishlistToggle}
                                aria-label="Toggle wishlist"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isWished ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        </div>

                        <div className="product-detail__benefits suit-14-m">
                            <p>조건에 따라 공식 샘플이 함께 제공될 수 있습니다.</p>
                            <p>시그니처 선물 포장을 선택하실 수 있습니다.</p>
                            <p>회원은 무료 배송 혜택을 받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>

                <div className="product-detail__tabs">
                    <div className="product-detail__tab-list">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`product-detail__tab-btn optima-16 ${
                                    activeTab === tab.key ? 'is-active' : ''
                                }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="product-detail__tab-content suit-16-r">
                        {activeTab === 'detail' ? (
                            <div className="product-detail__tab-detail">
                                <section className="product-detail__detail-block">
                                    <h2 className="product-detail__detail-title optima-20">
                                        제품 설명
                                    </h2>
                                    <p>{product.description}</p>
                                </section>

                                <section className="product-detail__detail-block">
                                    <h2 className="product-detail__detail-title optima-20">
                                        성분 정보
                                    </h2>
                                    <p>최신 성분 정보는 제품 패키지의 표기 사항을 확인해주세요.</p>
                                </section>

                                <section className="product-detail__detail-block">
                                    <h2 className="product-detail__detail-title optima-20">
                                        포장 안내
                                    </h2>
                                    <p>포장 구성은 제품과 용량 선택에 따라 달라질 수 있습니다.</p>
                                </section>

                                <section className="product-detail__detail-block">
                                    <h2 className="product-detail__detail-title optima-20">
                                        배송 및 반품
                                    </h2>
                                    <p>배송 예상 일정과 반품 정책은 결제 단계에서 확인하실 수 있습니다.</p>
                                </section>
                            </div>
                        ) : null}

                        {activeTab === 'review' ? (
                            <p className="product-detail__no-review">
                                리뷰가 등록되면 이곳에 표시됩니다.
                            </p>
                        ) : null}

                        {activeTab === 'qna' ? (
                            <div className="product-detail__qna-empty">
                                <h2 className="product-detail__detail-title optima-20">문의</h2>
                                <p>
                                    문의 기능이 연결되면 이곳에서 질문과 답변을 확인하실 수 있습니다.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
