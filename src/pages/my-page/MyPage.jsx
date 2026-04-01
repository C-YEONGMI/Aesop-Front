import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Heart,
    LogOut,
    Package,
    ShoppingBag,
    Settings2,
    Truck,
    User,
} from 'lucide-react';
import Badge from '../../components/common/badge/Badge';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
    selectCurrentUser,
    selectIsLoggedIn,
} from '../../app/store/selectors/authSelectors';
import { addToCart } from '../../app/store/slices/cartSlice';
import {
    logoutUser,
    updateProfileThunk,
} from '../../app/store/slices/authSlice';
import { fetchProductReferenceCatalog } from '../../app/store/slices/productSlice';
import { selectProductsByNames } from '../../app/store/selectors/productSelectors';
import { selectWishlistItems } from '../../app/store/selectors/wishlistSelectors';
import useOrderStore from '../../store/useOrderStore';
import useRequireLoginAction from '../../hooks/useRequireLoginAction';
import { getProductDetailPath } from '../../lib/products/productShape';
import { getCategoryLabelFromValue } from '../../data/productCategories';
import './MyPage.scss';

const TABS = [
    { key: 'orders', label: '주문 내역', description: '최근 주문과 배송 흐름', icon: ShoppingBag },
    { key: 'wishlist', label: '저장한 상품', description: '다시 보고 싶은 제품', icon: Heart },
    { key: 'info', label: '회원 정보', description: '계정과 지원 정보', icon: User },
];

const ORDER_STAGE_CONFIG = [
    { key: 'paid', label: '결제완료', icon: CreditCard },
    { key: 'preparing', label: '상품준비중', icon: Package },
    { key: 'shipping', label: '배송중', icon: Truck },
    { key: 'delivered', label: '배송완료', icon: CheckCircle2 },
];
const ORDER_STAGE_KEYS = ORDER_STAGE_CONFIG.map((step) => step.key);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ko-KR') : '-');
const formatPrice = (value) => `${Number(value || 0).toLocaleString('ko-KR')}원`;
const getPrimaryVariant = (product) => product?.variants?.[0] ?? {};

const getOrderStageKey = (status = '') => {
    if (status.includes('배송완료')) return 'delivered';
    if (status.includes('배송중')) return 'shipping';
    if (status.includes('준비')) return 'preparing';
    return 'paid';
};

const getOrderBadgeMeta = (status = '') => {
    if (status.includes('환불') || status.includes('취소')) {
        return { label: '환불', variant: 'order-refund' };
    }

    if (status.includes('배송완료')) {
        return { label: '배송완료', variant: 'order-delivered' };
    }

    if (status.includes('배송중')) {
        return { label: '배송중', variant: 'order-shipping' };
    }

    return { label: '주문완료', variant: 'order-complete' };
};

const MyPage = () => {
    const navigate = useNavigate();
    const { tab } = useParams();
    const [searchParams] = useSearchParams();
    const ordersSectionRef = useRef(null);
    const activeTab = tab || 'orders';
    const isEditingInfo = activeTab === 'info' && searchParams.get('edit') === 'profile';
    const requestedOrderStage = searchParams.get('status');
    const activeOrderStageFilter =
        activeTab === 'orders' && ORDER_STAGE_KEYS.includes(requestedOrderStage)
            ? requestedOrderStage
            : 'all';

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const allOrders = useOrderStore((state) => state.orders);
    const wishlist = useAppSelector(selectWishlistItems);
    const wishlistProductsSelector = useMemo(
        () => selectProductsByNames(wishlist),
        [wishlist]
    );
    const wishlistProducts = useAppSelector(wishlistProductsSelector);
    const requireLoginAction = useRequireLoginAction();
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (!isLoggedIn) navigate('/login');
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        dispatch(fetchProductReferenceCatalog());
    }, [dispatch]);

    useEffect(() => {
        if (!user) return;

        setProfileForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        });
    }, [user]);

    const orders = useMemo(
        () => allOrders.filter((order) => order.userId === user?.id),
        [allOrders, user?.id]
    );
    const filteredOrders = useMemo(
        () =>
            activeOrderStageFilter === 'all'
                ? orders
                : orders.filter((order) => getOrderStageKey(order.status) === activeOrderStageFilter),
        [activeOrderStageFilter, orders]
    );
    if (!isLoggedIn || !user) return null;

    const stageCounts = orders.reduce(
        (accumulator, order) => {
            const stageKey = getOrderStageKey(order.status);
            accumulator[stageKey] += 1;
            return accumulator;
        },
        { paid: 0, preparing: 0, shipping: 0, delivered: 0 }
    );

    const shippingSteps = ORDER_STAGE_CONFIG.map((step) => ({
        ...step,
        count: stageCounts[step.key],
    }));

    const inProgressCount = shippingSteps
        .filter((step) => step.key !== 'delivered')
        .reduce((sum, step) => sum + step.count, 0);

    const latestOrder = orders[0] || null;
    const currentStageOrder =
        orders.find((order) => getOrderStageKey(order.status) !== 'delivered') || latestOrder;
    const currentStageKey = currentStageOrder ? getOrderStageKey(currentStageOrder.status) : null;
    const currentStageIndex = ORDER_STAGE_CONFIG.findIndex((step) => step.key === currentStageKey);
    const selectedStageConfig =
        activeOrderStageFilter === 'all'
            ? null
            : ORDER_STAGE_CONFIG.find((step) => step.key === activeOrderStageFilter) ?? null;
    const progressStageIndex = selectedStageConfig
        ? ORDER_STAGE_CONFIG.findIndex((step) => step.key === selectedStageConfig.key)
        : currentStageIndex;
    const userInitial = user.name?.trim()?.charAt(0) || 'A';
    const addressCount = user.addresses?.length || 0;
    const profileSummaryItems = [
        { label: '이메일', value: user.email },
        { label: '연락처', value: user.phone || '미등록' },
        { label: '배송지', value: `${addressCount}개 저장됨` },
        { label: '가입일', value: formatDate(user.createdAt) },
    ];
    const statusSummaryText = !orders.length
        ? '주문이 접수되면 이곳에서 배송 흐름을 한눈에 확인하실 수 있습니다.'
        : inProgressCount > 1 && currentStageOrder
            ? `현재 ${inProgressCount}건의 주문이 진행 중이며, 가장 최근 주문은 ${currentStageOrder.status}입니다.`
            : inProgressCount === 1 && currentStageOrder
                ? `현재 1건의 주문이 ${currentStageOrder.status}입니다.`
                : '최근 주문의 배송이 모두 완료되었습니다.';
    const filteredStatusSummaryText = !selectedStageConfig
        ? statusSummaryText
        : filteredOrders.length > 0
            ? `${selectedStageConfig.label} 상태 주문 ${filteredOrders.length}건을 보고 있습니다.`
            : `현재 ${selectedStageConfig.label} 상태 주문은 없습니다.`;

    useEffect(() => {
        if (activeTab !== 'orders' || activeOrderStageFilter === 'all' || !ordersSectionRef.current) {
            return;
        }

        ordersSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [activeOrderStageFilter, activeTab]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    const handleOrderStageSelect = (stageKey) => {
        if (activeTab === 'orders' && activeOrderStageFilter === stageKey) {
            ordersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        navigate(`/mypage/orders?status=${stageKey}`);
    };

    const clearOrderStageFilter = () => {
        if (activeTab === 'orders' && activeOrderStageFilter === 'all') {
            ordersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        navigate('/mypage/orders');
    };

    const openInfoEditor = () => {
        navigate('/mypage/info?edit=profile');
    };

    const closeInfoEditor = () => {
        setProfileForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        });
        navigate('/mypage/info');
    };

    const handleProfileChange = (field) => (event) => {
        setProfileForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        if (!profileForm.name.trim() || !profileForm.email.trim()) {
            alert('이름과 이메일을 입력해 주세요.');
            return;
        }

        try {
            await dispatch(updateProfileThunk(profileForm)).unwrap();
        } catch (error) {
            alert(error?.message || '회원정보를 저장하지 못했습니다.');
            return;
        }

        navigate('/mypage/info');
    };

    const handleWishlistAddToCart = (product) => {
        requireLoginAction(() => dispatch(addToCart({ product, variantIndex: 0 })));
    };

    const handleWishlistBuyNow = (product) => {
        requireLoginAction(() => {
            dispatch(
                addToCart({
                    product,
                    variantIndex: 0,
                    options: { showDialog: false },
                })
            );
            navigate('/cart');
        });
    };

    return (
        <div className="mypage">
            <div className="mypage__header-space" />
            <div className="mypage__inner">
                <section className="mypage__hero">
                    <div className="mypage__hero-copy">
                        <p className="optima-16 mypage__eyebrow">계정 리추얼</p>
                        <h1 className="optima-40 mypage__title">마이페이지</h1>
                        <p className="suit-20-l mypage__lede">
                            주문과 계정 정보를 한 자리에서 차분하게 살펴보고, 필요한 설정을 이어갈 수
                            있도록 정리했습니다.
                        </p>
                    </div>

                    <article className="mypage__profile-card">
                        <div className="mypage__profile-mark optima-20">{userInitial}</div>
                        <div className="mypage__profile-body">
                            <div className="mypage__profile-top">
                                <div>
                                    <p className="optima-16 mypage__profile-kicker">Aesop Member</p>
                                    <h2 className="optima-20 mypage__profile-name">{user.name}</h2>
                                </div>
                                <div className="mypage__profile-actions">
                                    <button
                                        type="button"
                                        className="mypage__settings"
                                        onClick={openInfoEditor}
                                        aria-label="회원정보 수정"
                                    >
                                        <Settings2 size={16} strokeWidth={1.8} />
                                    </button>
                                    <button type="button" className="mypage__logout suit-14-m" onClick={handleLogout}>
                                        <LogOut size={16} strokeWidth={1.8} />
                                        로그아웃
                                    </button>
                                </div>
                            </div>

                            <div className="mypage__profile-summary suit-16-r">
                                {profileSummaryItems.map((item) => (
                                    <div key={item.label} className="mypage__profile-meta">
                                        <span className="mypage__profile-label suit-12-r">{item.label}</span>
                                        <span className="mypage__profile-value" title={item.value}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mypage__overview" aria-label="주문 및 계정 개요">
                    <article className="mypage__overview-panel">
                        <div className="mypage__panel-head">
                            <div>
                                <p className="optima-16 mypage__panel-kicker">Order Status</p>
                                <h2 className="optima-20 mypage__panel-title">주문 및 배송 현황</h2>
                            </div>
                            <Truck size={18} strokeWidth={1.8} />
                        </div>

                        <div className="mypage__status-flow" aria-label="주문 단계 현황">
                            {shippingSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = progressStageIndex >= 0 && progressStageIndex >= index;
                                const isSelected = activeOrderStageFilter === step.key;
                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        className={`mypage__status-step ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                                        onClick={() => handleOrderStageSelect(step.key)}
                                        aria-controls="mypage-orders-section"
                                        aria-pressed={isSelected}
                                    >
                                        <div className="mypage__status-visual">
                                            <Icon size={18} strokeWidth={1.8} />
                                            {step.count > 0 && (
                                                <span className="mypage__status-badge suit-12-r">{step.count}</span>
                                            )}
                                        </div>
                                        <span className="suit-16-r mypage__status-label">{step.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mypage__status-progress" aria-hidden="true">
                            {ORDER_STAGE_CONFIG.map((step, index) => (
                                <span
                                    key={step.key}
                                    className={`mypage__status-segment ${progressStageIndex >= index ? 'is-active' : ''}`}
                                />
                            ))}
                        </div>

                        <p className="suit-14-m mypage__status-note">
                            {filteredStatusSummaryText}
                        </p>
                    </article>
                </section>

                <div className="mypage__layout">
                    <nav className="mypage__tabs" aria-label="마이페이지 탭">
                        {TABS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.key}
                                    to={`/mypage/${item.key}`}
                                    className={`mypage__tab ${activeTab === item.key ? 'active' : ''}`}
                                >
                                    <span className="mypage__tab-icon">
                                        <Icon size={17} strokeWidth={1.8} />
                                    </span>
                                    <span className="optima-16 mypage__tab-label">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mypage__content">
                        {activeTab === 'orders' && (
                            <section className="mypage__section" id="mypage-orders-section" ref={ordersSectionRef}>
                                <div className="mypage__section-head">
                                    <p className="optima-16 mypage__section-kicker">Orders</p>
                                    <h2 className="optima-20 mypage__section-title">주문 내역</h2>
                                    <p className="suit-16-r mypage__section-desc">
                                        최근 주문과 배송 흐름을 한눈에 확인할 수 있도록 정리했습니다.
                                    </p>
                                    {selectedStageConfig && (
                                        <div className="mypage__section-filter">
                                            <p className="mypage__section-filter-label suit-14-m">
                                                {selectedStageConfig.label} 상태 주문 {filteredOrders.length}건
                                            </p>
                                            <button
                                                type="button"
                                                className="mypage__filter-clear suit-14-m"
                                                onClick={clearOrderStageFilter}
                                            >
                                                전체 주문 보기
                                                <ChevronRight size={14} strokeWidth={1.8} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {orders.length === 0 ? (
                                    <div className="mypage__empty-card">
                                        <p className="suit-18-r">아직 주문 내역이 없습니다.</p>
                                        <p className="suit-14-m">
                                            제품을 둘러보고 지금의 루틴에 어울리는 구성을 살펴보세요.
                                        </p>
                                        <Link to="/products" className="mypage__empty-link suit-14-m">
                                            제품 보러 가기
                                            <ChevronRight size={14} strokeWidth={1.8} />
                                        </Link>
                                    </div>
                                ) : filteredOrders.length === 0 ? (
                                    <div className="mypage__empty-card">
                                        <p className="suit-18-r">{selectedStageConfig?.label} 상태 주문이 없습니다.</p>
                                        <p className="suit-14-m">
                                            다른 상태를 선택하거나 전체 주문 내역으로 다시 살펴보실 수 있습니다.
                                        </p>
                                        <button
                                            type="button"
                                            className="mypage__filter-clear mypage__filter-clear--empty suit-14-m"
                                            onClick={clearOrderStageFilter}
                                        >
                                            전체 주문 보기
                                            <ChevronRight size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mypage__order-list">
                                        {filteredOrders.map((order) => {
                                            const orderBadge = getOrderBadgeMeta(order.status);
                                            return (
                                                <article key={order.id} className="mypage__order-card">
                                                <div className="mypage__order-header">
                                                    <div className="mypage__order-headline">
                                                        <p className="suit-12-r mypage__order-date">{formatDate(order.createdAt)}</p>
                                                        <p className="suit-16-r mypage__order-id">{order.id}</p>
                                                    </div>
                                                    <Badge variant={orderBadge.variant} className="mypage__order-status">
                                                        {orderBadge.label}
                                                    </Badge>
                                                </div>
                                                <div className="mypage__order-items">
                                                    {order.items?.map((item, index) => (
                                                        <div key={`${order.id}-${index}`} className="mypage__order-item">
                                                            <div className="mypage__order-item-media">
                                                                <img src={item.image} alt={item.productName} />
                                                            </div>
                                                            <div className="mypage__order-item-copy">
                                                                <p className="suit-14-m">{item.productName}</p>
                                                                <p className="suit-14-m">{item.variant} · {item.quantity}개</p>
                                                            </div>
                                                            <div className="mypage__order-item-price suit-14-m">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mypage__order-footer">
                                                    <span className="suit-14-m">총 결제 금액</span>
                                                    <strong className="suit-18-r">{formatPrice(order.total)}</strong>
                                                </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'wishlist' && (
                            <section className="mypage__section">
                                <div className="mypage__section-head">
                                    <p className="optima-16 mypage__section-kicker">Wishlist</p>
                                    <h2 className="optima-20 mypage__section-title">저장한 상품</h2>
                                    <p className="suit-16-r mypage__section-desc">
                                        다시 보고 싶은 제품을 모아 두고, 다음 주문 전 비교해보실 수 있습니다.
                                    </p>
                                </div>

                                {wishlistProducts.length === 0 ? (
                                    <div className="mypage__empty-card">
                                        <p className="suit-18-r">저장한 상품이 없습니다.</p>
                                        <p className="suit-14-m">
                                            관심 있는 제품을 저장해두면 다음 방문 때 더 빠르게 이어볼 수 있습니다.
                                        </p>
                                        <Link to="/products" className="mypage__empty-link suit-14-m">
                                            제품 둘러보기
                                            <ChevronRight size={14} strokeWidth={1.8} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mypage__wish-grid">
                                        {wishlistProducts.map((product) => {
                                            const variant = getPrimaryVariant(product);
                                            const productPath = getProductDetailPath(product);
                                            return (
                                                <article key={product.name} className="mypage__wish-card">
                                                    <Link to={productPath} className="mypage__wish-media">
                                                        <img src={variant.image} alt={product.name} />
                                                    </Link>
                                                    <Link to={productPath} className="mypage__wish-copy">
                                                        <p className="optima-16 mypage__wish-category">{getCategoryLabelFromValue(product.category)}</p>
                                                        <p className="suit-18-r mypage__wish-name">{product.name}</p>
                                                        <p className="suit-14-m mypage__wish-meta">
                                                            {variant.capacity || '대표 구성'}
                                                        </p>
                                                    </Link>
                                                    <div className="mypage__wish-side">
                                                        <strong className="suit-18-r mypage__wish-price">
                                                            {formatPrice(variant.price)}
                                                        </strong>
                                                        <div className="mypage__wish-actions">
                                                            <button
                                                                type="button"
                                                                className="mypage__wish-button mypage__wish-button--secondary suit-14-m"
                                                                onClick={() => handleWishlistAddToCart(product)}
                                                            >
                                                                장바구니 담기
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="mypage__wish-button mypage__wish-button--primary suit-14-m"
                                                                onClick={() => handleWishlistBuyNow(product)}
                                                            >
                                                                바로 구매
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'info' && (
                            <section className="mypage__section">
                                <div className="mypage__section-head">
                                    <p className="optima-16 mypage__section-kicker">Profile</p>
                                    <h2 className="optima-20 mypage__section-title">회원 정보</h2>
                                    <p className="suit-16-r mypage__section-desc">
                                        계정 정보를 한 자리에서 확인하실 수 있습니다.
                                    </p>
                                </div>

                                <div className="mypage__info-grid">
                                    <article className="mypage__info-card">
                                        <div className="mypage__info-card-head">
                                            <div>
                                                <h3 className="optima-20 mypage__info-title">기본 정보</h3>
                                                <p className="suit-14-m mypage__info-desc">
                                                    계정과 연락처 정보를 확인하고, 필요한 경우 이곳에서 수정하실 수 있습니다.
                                                </p>
                                            </div>
                                            {!isEditingInfo && (
                                                <button
                                                    type="button"
                                                    className="mypage__info-edit suit-14-m"
                                                    onClick={openInfoEditor}
                                                >
                                                    회원정보 수정
                                                </button>
                                            )}
                                        </div>

                                        {!isEditingInfo ? (
                                            <div className="mypage__info-list suit-16-r">
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">이름</span>
                                                    <span className="mypage__info-value" title={user.name}>
                                                        {user.name}
                                                    </span>
                                                </div>
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">아이디</span>
                                                    <span className="mypage__info-value" title={user.userId || '-'}>
                                                        {user.userId || '-'}
                                                    </span>
                                                </div>
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">이메일</span>
                                                    <span className="mypage__info-value" title={user.email}>
                                                        {user.email}
                                                    </span>
                                                </div>
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">연락처</span>
                                                    <span>{user.phone || '미등록'}</span>
                                                </div>
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">가입일</span>
                                                    <span className="mypage__info-value" title={formatDate(user.createdAt)}>
                                                        {formatDate(user.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="mypage__info-item">
                                                    <span className="mypage__info-label suit-14-m">배송지</span>
                                                    <span>{addressCount}개 저장됨</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <form className="mypage__profile-editor mypage__profile-editor--info" onSubmit={handleProfileSubmit}>
                                                <div className="mypage__profile-editor-grid">
                                                    <label className="mypage__profile-field">
                                                        <span className="suit-12-r">이름</span>
                                                        <input
                                                            type="text"
                                                            value={profileForm.name}
                                                            onChange={handleProfileChange('name')}
                                                            className="suit-16-r"
                                                            placeholder="이름을 입력해 주세요"
                                                        />
                                                    </label>
                                                    <div className="mypage__info-item mypage__info-item--readonly">
                                                        <span className="mypage__info-label suit-14-m">아이디</span>
                                                        <span>{user.userId || '-'}</span>
                                                    </div>
                                                    <label className="mypage__profile-field">
                                                        <span className="suit-12-r">이메일</span>
                                                        <input
                                                            type="email"
                                                            value={profileForm.email}
                                                            onChange={handleProfileChange('email')}
                                                            className="suit-16-r"
                                                            placeholder="이메일을 입력해 주세요"
                                                        />
                                                    </label>
                                                    <label className="mypage__profile-field">
                                                        <span className="suit-12-r">연락처</span>
                                                        <input
                                                            type="text"
                                                            value={profileForm.phone}
                                                            onChange={handleProfileChange('phone')}
                                                            className="suit-16-r"
                                                            placeholder="연락처를 입력해 주세요"
                                                        />
                                                    </label>
                                                    <div className="mypage__info-item mypage__info-item--readonly">
                                                        <span className="mypage__info-label suit-14-m">가입일</span>
                                                        <span>{formatDate(user.createdAt)}</span>
                                                    </div>
                                                    <div className="mypage__info-item mypage__info-item--readonly">
                                                        <span className="mypage__info-label suit-14-m">배송지</span>
                                                        <span>{addressCount}개 저장됨</span>
                                                    </div>
                                                </div>
                                                <div className="mypage__profile-editor-actions">
                                                    <button
                                                        type="button"
                                                        className="mypage__profile-cancel suit-14-m"
                                                        onClick={closeInfoEditor}
                                                    >
                                                        취소
                                                    </button>
                                                    <button type="submit" className="mypage__profile-save suit-14-m">
                                                        저장하기
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </article>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
