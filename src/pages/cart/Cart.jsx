import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import RollingNumber from '../../components/ui/RollingNumber';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
    selectAllCartItemsChecked,
    selectCartItems,
    selectCartShippingFee,
    selectCartSubtotal,
    selectCartTotalAmount,
    selectCheckedCartItems,
} from '../../app/store/selectors/cartSelectors';
import {
    removeChecked,
    removeItem,
    toggleAll,
    toggleCheck,
    updateQuantity,
} from '../../app/store/slices/cartSlice';
import { selectIsLoggedIn } from '../../app/store/selectors/authSelectors';
import { getCategoryLabelFromValue } from '../../data/productCategories';
import './Cart.scss';

const getEstimatedArrivalLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);

    return `지금 주문하시면 ${date.getMonth() + 1}/${date.getDate()} 이내 도착 예정`;
};

const fadeUpTransition = {
    duration: 0.42,
    ease: [0.22, 1, 0.36, 1],
};

const CartCheckbox = ({
    checked,
    onClick,
    children,
    className = '',
    ariaLabel,
}) => (
    <button
        type="button"
        className={`cart-page__checkbox ${checked ? 'is-checked' : ''} ${className}`.trim()}
        onClick={onClick}
        aria-pressed={checked}
        aria-label={ariaLabel}
    >
        <span className="cart-page__checkbox-box" aria-hidden="true">
            <svg viewBox="0 0 12 12">
                <path
                    d="M1.5 6L4.5 9L10.5 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
        {children ? <span className="cart-page__checkbox-label">{children}</span> : null}
    </button>
);

const PriceValue = ({ value, className = '' }) => (
    <span className={`cart-page__price-text ${className}`.trim()}>
        <RollingNumber value={value} />
        <span className="cart-page__currency" aria-hidden="true">원</span>
    </span>
);

const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const cartItems = useAppSelector(selectCartItems);
    const checkedItems = useAppSelector(selectCheckedCartItems);
    const subtotal = useAppSelector(selectCartSubtotal);
    const shipping = useAppSelector(selectCartShippingFee);
    const total = useAppSelector(selectCartTotalAmount);
    const allChecked = useAppSelector(selectAllCartItemsChecked);
    const estimatedArrivalLabel = getEstimatedArrivalLabel();

    const handleOrder = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (checkedItems.length === 0) {
            alert('주문할 상품을 선택해주세요.');
            return;
        }

        navigate('/checkout');
    };

    const handleDirectOrder = (cartId) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        dispatch(toggleAll(false));
        dispatch(toggleCheck(cartId));
        navigate('/checkout');
    };

    return (
        <div className="cart-page">
            <div className="cart-page__header-space" />

            <div className="cart-page__inner">
                <div className="cart-page__title-wrap">
                    <motion.h1
                        className="cart-page__title"
                        id="cart-page-title"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={fadeUpTransition}
                    >
                        장바구니
                    </motion.h1>

                </div>

                <AnimatePresence mode="wait">
                    {cartItems.length === 0 ? (
                        <motion.section
                            key="empty"
                            className="cart-page__empty"
                            aria-labelledby="cart-page-title"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={fadeUpTransition}
                        >
                            <motion.p
                                className="cart-page__empty-copy"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...fadeUpTransition, delay: 0.06 }}
                            >
                                장바구니에 담긴 상품이 없습니다.
                            </motion.p>
                            <Link to="/products" className="cart-page__empty-link">
                                상품 보러가기
                            </Link>
                        </motion.section>
                    ) : (
                        <motion.div
                            key="filled"
                            className="cart-page__content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={fadeUpTransition}
                        >
                            <section className="cart-page__table" aria-labelledby="cart-page-title">
                                <div className="cart-page__toolbar">
                                    <CartCheckbox
                                        checked={allChecked}
                                        onClick={() => dispatch(toggleAll(!allChecked))}
                                        ariaLabel="전체 선택"
                                    >
                                        전체 선택
                                    </CartCheckbox>

                                    <button
                                        type="button"
                                        className="cart-page__delete-selected"
                                        onClick={() => dispatch(removeChecked())}
                                        disabled={checkedItems.length === 0}
                                    >
                                        선택 삭제
                                    </button>
                                </div>

                                <div className="cart-page__columns" aria-hidden="true">
                                    <span />
                                    <span>상품 정보</span>
                                    <span>수량</span>
                                    <span>판매 금액</span>
                                    <span />
                                </div>

                                <div className="cart-page__items">
                                    <AnimatePresence mode="popLayout">
                                        {cartItems.map((item) => (
                                            <motion.article
                                                className="cart-page__item"
                                                key={item.cartId}
                                                layout
                                                initial={{ opacity: 0, y: 18 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -18 }}
                                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                <div className="cart-page__item-check-cell">
                                                    <CartCheckbox
                                                        checked={item.checked}
                                                        onClick={() => dispatch(toggleCheck(item.cartId))}
                                                        className="cart-page__checkbox--row"
                                                        ariaLabel={`${item.productName} 선택`}
                                                    />
                                                </div>

                                                <div className="cart-page__item-main">
                                                    <div className="cart-page__item-image">
                                                        <img
                                                            src={item.image}
                                                            alt={item.productName}
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    <div className="cart-page__item-copy">
                                                        <p className="cart-page__item-name">{item.productName}</p>
                                                        {item.variant ? (
                                                            <p className="cart-page__item-meta">
                                                                옵션 ({item.variant})
                                                            </p>
                                                        ) : null}
                                                        {item.category ? (
                                                            <p className="cart-page__item-meta">{getCategoryLabelFromValue(item.category)}</p>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="cart-page__item-quantity-cell">
                                                    <div className="cart-page__quantity-box">
                                                        <button
                                                            type="button"
                                                            className="cart-page__quantity-btn"
                                                            onClick={() =>
                                                                dispatch(
                                                                    updateQuantity({
                                                                        cartId: item.cartId,
                                                                        quantity: item.quantity - 1,
                                                                    })
                                                                )
                                                            }
                                                            aria-label={`${item.productName} 수량 줄이기`}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="cart-page__quantity-value">
                                                            <RollingNumber
                                                                value={item.quantity}
                                                                className="cart-page__quantity-number"
                                                            />
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="cart-page__quantity-btn"
                                                            onClick={() =>
                                                                dispatch(
                                                                    updateQuantity({
                                                                        cartId: item.cartId,
                                                                        quantity: item.quantity + 1,
                                                                    })
                                                                )
                                                            }
                                                            aria-label={`${item.productName} 수량 늘리기`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="cart-page__item-total">
                                                    <PriceValue
                                                        value={item.price * item.quantity}
                                                        className="cart-page__price-text--center"
                                                    />
                                                </p>

                                                <div className="cart-page__item-actions">
                                                    <button
                                                        type="button"
                                                        className="cart-page__buy-now"
                                                        onClick={() => handleDirectOrder(item.cartId)}
                                                    >
                                                        바로 구매
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="cart-page__delete-item"
                                                        onClick={() => dispatch(removeItem(item.cartId))}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>

                            <motion.aside
                                className="cart-page__aside"
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...fadeUpTransition, delay: 0.08 }}
                            >
                                <div className="cart-page__summary">
                                    <motion.h2
                                        className="cart-page__summary-title"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...fadeUpTransition, delay: 0.12 }}
                                    >
                                        주문정보
                                    </motion.h2>

                                    <div className="cart-page__summary-body">
                                        <div className="cart-page__summary-row">
                                            <span className="cart-page__summary-label">주문 금액</span>
                                            <PriceValue
                                                value={subtotal}
                                                className="cart-page__price-text--end cart-page__summary-value"
                                            />
                                        </div>

                                        <div className="cart-page__summary-row">
                                            <span className="cart-page__summary-label">배송비</span>
                                            <PriceValue
                                                value={shipping}
                                                className="cart-page__price-text--end cart-page__summary-value"
                                            />
                                        </div>

                                        <div className="cart-page__summary-divider" />

                                        <div className="cart-page__summary-total">
                                            <span>총 결제 금액</span>
                                            <strong>
                                                <PriceValue
                                                    value={total}
                                                    className="cart-page__price-text--end"
                                                />
                                            </strong>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="cart-page__checkout"
                                        onClick={handleOrder}
                                    >
                                        결제하기
                                    </button>
                                </div>

                                <motion.p
                                    className="cart-page__delivery-note"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...fadeUpTransition, delay: 0.16 }}
                                >
                                    {estimatedArrivalLabel}
                                </motion.p>
                            </motion.aside>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Cart;
