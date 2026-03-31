import React, { useState } from 'react';
import { Check, Lock, Package, RotateCcw, Shield, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { selectCurrentUser } from '../../app/store/selectors/authSelectors';
import {
    selectCartShippingFee,
    selectCartSubtotal,
    selectCartTotalAmount,
    selectCheckedCartItems,
    selectSelectedSamples,
} from '../../app/store/selectors/cartSelectors';
import { clearSamples, removeOrderedItems } from '../../app/store/slices/cartSlice';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/Select';
import SampleSelector from '../../components/features/checkout/SampleSelector';
import useOrderStore from '../../store/useOrderStore';
import './Checkout.scss';

const CHECKOUT_STEPS = ['장바구니', '배송정보', '결제'];
const SHIPPING_MEMO_OPTIONS = [
    '배송 메모를 선택해 주세요',
    '문 앞에 놓아주세요',
    '경비실에 맡겨주세요',
    '배송 전 연락 바랍니다',
    '부재 시 연락주세요',
    '직접 입력',
];
const BANK_OPTIONS = ['국민은행', '신한은행', '우리은행', '하나은행', '기업은행'];
const INSTALLMENT_OPTIONS = ['일시불', '2개월', '3개월', '6개월', '12개월'];
const PAYMENT_METHODS = [
    { value: 'card', label: '신용 / 체크카드' },
    { value: 'kakao', label: '카카오페이' },
    { value: 'naver', label: '네이버페이' },
    { value: 'virtual', label: '가상계좌' },
    { value: 'transfer', label: '계좌이체' },
];
const AGREEMENT_ITEMS = [
    { key: 'terms', label: '이용약관 동의' },
    { key: 'privacy', label: '개인정보 수집 및 이용 동의' },
    { key: 'refund', label: '환불 및 취소 정책 동의' },
];

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const checkedItems = useAppSelector(selectCheckedCartItems);
    const subtotal = useAppSelector(selectCartSubtotal);
    const shippingFee = useAppSelector(selectCartShippingFee);
    const total = useAppSelector(selectCartTotalAmount);
    const selectedSamples = useAppSelector(selectSelectedSamples);
    const user = useAppSelector(selectCurrentUser);
    const createOrder = useOrderStore((state) => state.createOrder);

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        postcode: '',
        address: '',
        addressDetail: '',
        memo: SHIPPING_MEMO_OPTIONS[0],
        memoDetail: '',
        giftWrap: false,
        giftMessage: '',
        payment: 'card',
        saveCard: false,
        bank: BANK_OPTIONS[0],
        installment: INSTALLMENT_OPTIONS[0],
        cardOwner: user?.name || '',
        cardNumber: ['', '', '', ''],
        expiry: '',
        cvc: '',
    });
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        refund: false,
    });

    const currentStep = 2;
    const allAgreed = Object.values(agreements).every(Boolean);
    const formatPrice = (value) => `${value.toLocaleString()}원`;

    const handleFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectFieldChange = (name) => (value) => {
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleCardNumberChange = (index, value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        setForm((current) => {
            const nextCardNumber = [...current.cardNumber];
            nextCardNumber[index] = digits;
            return { ...current, cardNumber: nextCardNumber };
        });
    };

    const handleExpiryChange = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
        setForm((current) => ({ ...current, expiry: formatted }));
    };

    const handleAgreementToggle = (key) => {
        setAgreements((current) => ({ ...current, [key]: !current[key] }));
    };

    const handleToggleAllAgreements = () => {
        const nextValue = !allAgreed;
        setAgreements({ terms: nextValue, privacy: nextValue, refund: nextValue });
    };

    const handlePaymentMethodChange = (value) => {
        setForm((current) => ({ ...current, payment: value }));
    };

    const handleAddressLookup = () => {
        alert('현재 주소 검색 기능은 준비 중입니다. 주소를 직접 입력해 주세요.');
    };

    const handleOrder = (event) => {
        event.preventDefault();

        if (checkedItems.length === 0) {
            alert('주문할 상품을 먼저 선택해 주세요.');
            navigate('/cart');
            return;
        }

        if (!form.name || !form.phone || !form.email || !form.address) {
            alert('받는 분 정보와 배송지를 모두 입력해 주세요.');
            return;
        }

        if (form.payment === 'card') {
            const isCardFormIncomplete =
                form.cardNumber.some((segment) => segment.length !== 4) ||
                form.expiry.length !== 5 ||
                form.cvc.length !== 3 ||
                !form.cardOwner.trim();

            if (isCardFormIncomplete) {
                alert('카드 결제 정보를 모두 입력해 주세요.');
                return;
            }
        }

        if (!allAgreed) {
            alert('주문을 진행하려면 필수 약관에 동의해 주세요.');
            return;
        }

        const shippingMemo =
            form.memo === '직접 입력'
                ? form.memoDetail.trim()
                : form.memo === SHIPPING_MEMO_OPTIONS[0]
                  ? ''
                  : form.memo;

        const order = createOrder({
            userId: user?.id,
            items: checkedItems,
            selectedSamples,
            shipping: {
                ...form,
                memo: shippingMemo,
                cardNumber: form.cardNumber.join('-'),
            },
            subtotal,
            shippingFee,
            total,
        });

        dispatch(removeOrderedItems(checkedItems.map((item) => item.cartId)));
        dispatch(clearSamples());
    };

    if (checkedItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-page__header-space" />
                <div className="checkout-page__inner">
                    <div className="checkout-page__empty">
                        <p className="optima-16 checkout-page__eyebrow">Checkout</p>
                        <h1 className="montage-48 checkout-page__title">결제할 상품이 없습니다</h1>
                        <p className="suit-18-r checkout-page__empty-copy">
                            장바구니에서 주문할 상품을 선택한 뒤 다시 결제를 진행해 주세요.
                        </p>
                        <button
                            type="button"
                            className="checkout-page__secondary-button optima-16"
                            onClick={() => navigate('/cart')}
                        >
                            장바구니로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-page__header-space" />

            <div className="checkout-page__inner">
                <div className="checkout-page__frame-header">
                    <div className="checkout-page__brand">
                        <div className="checkout-page__brand-mark">
                            <Package size={18} />
                        </div>
                        <div className="checkout-page__brand-copy">
                            <p className="optima-16">Aesop Commerce</p>
                            <p className="suit-12-r">Secure Checkout</p>
                        </div>
                    </div>

                    <div className="checkout-page__step-track" aria-label="Checkout steps">
                        {CHECKOUT_STEPS.map((step, index) => (
                            <React.Fragment key={step}>
                                <div
                                    className={`checkout-page__step ${
                                        index < currentStep ? 'checkout-page__step--completed' : ''
                                    } ${index === currentStep ? 'checkout-page__step--active' : ''}`}
                                >
                                    <div className="checkout-page__step-index suit-12-r">
                                        {index < currentStep ? <Check size={12} /> : index + 1}
                                    </div>
                                    <span className="suit-14-m">{step}</span>
                                </div>
                                {index < CHECKOUT_STEPS.length - 1 ? (
                                    <span className="checkout-page__step-divider" aria-hidden="true" />
                                ) : null}
                            </React.Fragment>
                        ))}
                    </div>

                </div>

                <form className="checkout-page__form" onSubmit={handleOrder}>
                    <div className="checkout-page__main">
                        <section className="checkout-page__section">
                            <div className="checkout-page__section-head">
                                <div className="checkout-page__section-title-wrap">
                                    <div className="checkout-page__section-icon">
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <h2 className="optima-20 checkout-page__section-title">
                                            배송 정보
                                        </h2>
                                        <p className="suit-14-m checkout-page__section-copy">
                                            정확한 배송을 위해 필수 정보를 입력해 주세요.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-page__field-grid">
                                <div className="checkout-page__field">
                                    <label htmlFor="checkout-name">받는 분 이름</label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFieldChange}
                                        placeholder="이름을 입력해 주세요"
                                    />
                                </div>

                                <div className="checkout-page__field">
                                    <label htmlFor="checkout-phone">연락처</label>
                                    <input
                                        id="checkout-phone"
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFieldChange}
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                <div className="checkout-page__field checkout-page__field--full">
                                    <label htmlFor="checkout-email">이메일</label>
                                    <input
                                        id="checkout-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleFieldChange}
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className="checkout-page__field checkout-page__field--full">
                                    <label htmlFor="checkout-postcode">주소</label>
                                    <div className="checkout-page__address-row">
                                        <input
                                            id="checkout-postcode"
                                            type="text"
                                            name="postcode"
                                            value={form.postcode}
                                            onChange={handleFieldChange}
                                            placeholder="우편번호"
                                        />
                                        <button
                                            type="button"
                                            className="checkout-page__lookup-button optima-16"
                                            onClick={handleAddressLookup}
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleFieldChange}
                                        placeholder="기본 주소를 입력해 주세요"
                                    />
                                    <input
                                        type="text"
                                        name="addressDetail"
                                        value={form.addressDetail}
                                        onChange={handleFieldChange}
                                        placeholder="상세 주소를 입력해 주세요"
                                    />
                                </div>

                                <div className="checkout-page__field checkout-page__field--full">
                                    <label htmlFor="checkout-memo">배송 메모</label>
                                    <div className="checkout-page__select-wrap">
                                        <Select
                                            value={form.memo}
                                            onValueChange={handleSelectFieldChange('memo')}
                                        >
                                            <SelectTrigger
                                                id="checkout-memo"
                                                className="checkout-page__select-trigger suit-16-r"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="checkout-page__select-content">
                                                {SHIPPING_MEMO_OPTIONS.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {form.memo === '직접 입력' ? (
                                        <textarea
                                            name="memoDetail"
                                            value={form.memoDetail}
                                            onChange={handleFieldChange}
                                            placeholder="요청 사항을 입력해 주세요"
                                            rows={3}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        <SampleSelector />

                        <section className="checkout-page__section">
                            <div className="checkout-page__section-head">
                                <div className="checkout-page__section-title-wrap">
                                    <div className="checkout-page__section-icon">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <h2 className="optima-20 checkout-page__section-title">
                                            결제 수단
                                        </h2>
                                        <p className="suit-14-m checkout-page__section-copy">
                                            원하는 방식으로 안전하게 결제할 수 있습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-page__payment-methods">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        className={`checkout-page__payment-button ${
                                            form.payment === method.value
                                                ? 'checkout-page__payment-button--active'
                                                : ''
                                        }`}
                                        onClick={() => handlePaymentMethodChange(method.value)}
                                    >
                                        <span className="suit-14-m">{method.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="checkout-page__payment-panel">
                                {form.payment === 'card' ? (
                                    <div className="checkout-page__payment-fields">
                                        <div className="checkout-page__field checkout-page__field--full">
                                            <label>카드 번호</label>
                                            <div className="checkout-page__card-number">
                                                {form.cardNumber.map((segment, index) => (
                                                    <input
                                                        key={`${index + 1}`}
                                                        type={index > 1 ? 'password' : 'text'}
                                                        value={segment}
                                                        onChange={(event) =>
                                                            handleCardNumberChange(
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                        maxLength={4}
                                                        placeholder="0000"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="checkout-page__field-grid checkout-page__field-grid--compact">
                                            <div className="checkout-page__field">
                                                <label htmlFor="checkout-expiry">유효기간</label>
                                                <input
                                                    id="checkout-expiry"
                                                    type="text"
                                                    value={form.expiry}
                                                    onChange={(event) =>
                                                        handleExpiryChange(event.target.value)
                                                    }
                                                    maxLength={5}
                                                    placeholder="MM/YY"
                                                />
                                            </div>

                                            <div className="checkout-page__field">
                                                <label htmlFor="checkout-cvc">CVC</label>
                                                <input
                                                    id="checkout-cvc"
                                                    type="password"
                                                    name="cvc"
                                                    value={form.cvc}
                                                    onChange={(event) =>
                                                        setForm((current) => ({
                                                            ...current,
                                                            cvc: event.target.value
                                                                .replace(/\D/g, '')
                                                                .slice(0, 3),
                                                        }))
                                                    }
                                                    maxLength={3}
                                                    placeholder="000"
                                                />
                                            </div>

                                            <div className="checkout-page__field">
                                                <label htmlFor="checkout-installment">할부</label>
                                                <div className="checkout-page__select-wrap">
                                                    <Select
                                                        value={form.installment}
                                                        onValueChange={handleSelectFieldChange('installment')}
                                                    >
                                                        <SelectTrigger
                                                            id="checkout-installment"
                                                            className="checkout-page__select-trigger suit-16-r"
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="checkout-page__select-content">
                                                            {INSTALLMENT_OPTIONS.map((option) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="checkout-page__field">
                                            <label htmlFor="checkout-card-owner">카드 소유자 이름</label>
                                            <input
                                                id="checkout-card-owner"
                                                type="text"
                                                name="cardOwner"
                                                value={form.cardOwner}
                                                onChange={handleFieldChange}
                                                placeholder="카드에 표기된 이름"
                                            />
                                        </div>

                                        <label className="checkout-page__payment-check">
                                            <input
                                                type="checkbox"
                                                name="saveCard"
                                                checked={form.saveCard}
                                                onChange={handleFieldChange}
                                            />
                                            <span className="checkout-page__payment-check-box" />
                                            <span className="suit-14-m">이 카드 정보 저장하기</span>
                                        </label>
                                    </div>
                                ) : null}

                                {form.payment === 'kakao' ? (
                                    <div className="checkout-page__payment-brand">
                                        <div className="checkout-page__payment-brand-mark checkout-page__payment-brand-mark--kakao">
                                            <span className="optima-20">K</span>
                                        </div>
                                        <div className="checkout-page__payment-brand-copy">
                                            <p className="suit-18-r">카카오페이로 결제</p>
                                            <p className="suit-14-m">
                                                결제하기 버튼 클릭 시 카카오페이 앱으로 연결됩니다.
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                {form.payment === 'naver' ? (
                                    <div className="checkout-page__payment-brand">
                                        <div className="checkout-page__payment-brand-mark checkout-page__payment-brand-mark--naver">
                                            <span className="optima-20">N</span>
                                        </div>
                                        <div className="checkout-page__payment-brand-copy">
                                            <p className="suit-18-r">네이버페이로 결제</p>
                                            <p className="suit-14-m">
                                                네이버페이 포인트 및 간편결제를 사용할 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                {form.payment === 'virtual' ? (
                                    <div className="checkout-page__payment-fields">
                                        <div className="checkout-page__payment-note checkout-page__payment-note--soft">
                                            <p className="suit-14-m">가상계좌 안내</p>
                                            <p className="suit-14-m">
                                                발급된 계좌로 <strong>24시간 이내</strong> 입금해 주세요.
                                            </p>
                                        </div>
                                        <div className="checkout-page__field">
                                            <label htmlFor="checkout-virtual-bank">은행 선택</label>
                                            <div className="checkout-page__select-wrap">
                                                <Select
                                                    value={form.bank}
                                                    onValueChange={handleSelectFieldChange('bank')}
                                                >
                                                    <SelectTrigger
                                                        id="checkout-virtual-bank"
                                                        className="checkout-page__select-trigger suit-16-r"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="checkout-page__select-content">
                                                        {BANK_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {form.payment === 'transfer' ? (
                                    <div className="checkout-page__payment-fields">
                                        <div className="checkout-page__field">
                                            <label htmlFor="checkout-transfer-bank">은행 선택</label>
                                            <div className="checkout-page__select-wrap">
                                                <Select
                                                    value={form.bank}
                                                    onValueChange={handleSelectFieldChange('bank')}
                                                >
                                                    <SelectTrigger
                                                        id="checkout-transfer-bank"
                                                        className="checkout-page__select-trigger suit-16-r"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="checkout-page__select-content">
                                                        {BANK_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </section>

                        <section className="checkout-page__section">
                            <div className="checkout-page__section-head">
                                <div className="checkout-page__section-title-wrap">
                                    <div className="checkout-page__section-icon">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <h2 className="optima-20 checkout-page__section-title">
                                            약관 동의
                                        </h2>
                                        <p className="suit-14-m checkout-page__section-copy">
                                            주문 완료를 위해 아래 내용을 확인해 주세요.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`checkout-page__toggle-row checkout-page__agreement-all ${
                                    allAgreed ? 'is-active' : ''
                                }`}
                                onClick={handleToggleAllAgreements}
                            >
                                <span className="checkout-page__toggle-indicator">
                                    {allAgreed ? <Check size={12} /> : null}
                                </span>
                                <span className="checkout-page__toggle-copy">
                                    <span className="suit-16-r">아래 내용에 모두 동의합니다</span>
                                    <span className="suit-12-r">필수 약관 3개가 한 번에 선택됩니다.</span>
                                </span>
                            </button>

                            <div className="checkout-page__agreement-divider" />

                            <div className="checkout-page__agreement-list">
                                {AGREEMENT_ITEMS.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`checkout-page__agreement-row ${
                                            agreements[item.key] ? 'is-active' : ''
                                        }`}
                                        onClick={() => handleAgreementToggle(item.key)}
                                    >
                                        <span className="checkout-page__toggle-indicator">
                                            {agreements[item.key] ? <Check size={12} /> : null}
                                        </span>
                                        <span className="checkout-page__agreement-copy">
                                            <span className="suit-14-m">[필수] {item.label}</span>
                                            <span className="suit-12-r">내용을 확인하고 동의합니다.</span>
                                        </span>
                                        <span className="checkout-page__agreement-view suit-12-r">
                                            보기
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="checkout-page__summary">
                        <div className="checkout-page__summary-panel">
                            <div className="checkout-page__summary-header">
                                <h2 className="optima-20 checkout-page__summary-title">주문 상품</h2>
                                <span className="checkout-page__summary-count suit-12-r">
                                    {checkedItems.length}개
                                </span>
                            </div>

                            <div className="checkout-page__summary-items">
                                {checkedItems.map((item) => (
                                    <div key={item.cartId} className="checkout-page__summary-item">
                                        <div className="checkout-page__summary-item-image">
                                            <img src={item.image} alt={item.productName} />
                                        </div>
                                        <div className="checkout-page__summary-item-copy">
                                            <p className="suit-14-m">{item.productName}</p>
                                            <p className="suit-12-r">
                                                {item.variant || '기본 옵션'} · {item.quantity}개
                                            </p>
                                            <p className="suit-16-r">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="checkout-page__summary-panel checkout-page__summary-panel--amount">
                            <div className="checkout-page__summary-totals">
                                <div className="checkout-page__summary-row suit-16-r">
                                    <span>상품 금액</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="checkout-page__summary-row suit-16-r">
                                    <span>배송비</span>
                                    <span>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
                                </div>
                                {shippingFee > 0 ? (
                                    <p className="checkout-page__free-shipping suit-12-r">
                                        {(50000 - subtotal).toLocaleString()}원 추가 구매 시 무료 배송이
                                        적용됩니다.
                                    </p>
                                ) : null}
                                <div className="checkout-page__summary-total suit-24-sb">
                                    <span>최종 결제 금액</span>
                                    <span>{total.toLocaleString()}원</span>
                                </div>
                            </div>

                            <button type="submit" className="checkout-page__submit suit-18-m">
                                <Lock size={16} />
                                <span>{formatPrice(total)} 결제하기</span>
                            </button>

                            <div className="checkout-page__benefits">
                                <div className="checkout-page__benefit">
                                    <Truck size={15} />
                                    <span className="suit-12-r">5만원 이상 주문 시 무료 배송</span>
                                </div>
                                <div className="checkout-page__benefit">
                                    <RotateCcw size={15} />
                                    <span className="suit-12-r">7일 이내 교환 및 반품 가능</span>
                                </div>
                                <div className="checkout-page__benefit">
                                    <Shield size={15} />
                                    <span className="suit-12-r">SSL 보안 결제를 지원합니다</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
