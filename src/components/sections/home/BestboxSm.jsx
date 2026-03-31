import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store/hooks';
import { addToCart } from '../../../app/store/slices/cartSlice';
import Best from '../../common/badge/Best';
import New from '../../common/badge/New';
import Exclusive from '../../common/badge/Exclusive';
import AddToCartButton from '../../common/button/AddToCartButton';
import useRequireLoginAction from '../../../hooks/useRequireLoginAction';
import { getProductDetailPath } from '../../../lib/products/productShape';
import './BestboxSm.scss';

const FALLBACK_IMAGE = 'https://kr.aesop.com/dw/image/v2/AARM_PRD/on/demandware.static/-/Sites-aesop-master-catalog/default/dwd34d3c3d/images/products/SK67/4936968889721/4936968889721_1.png';
const DEFAULT_NAME = '\uC81C\uD488\uBA85 \uB4E4\uC5B4\uAC00\uB294 \uACF5\uAC04\uC785\uB2C8\uB2E4.';
const ADD_TO_CART_LABEL = '\uC7A5\uBC14\uAD6C\uB2C8 \uB2F4\uAE30';

const BestboxSm = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const requireLoginAction = useRequireLoginAction();
    const productData = product || {
        name: DEFAULT_NAME,
        badge: ['Best', 'New', 'Exclusive'],
        variants: [{ image: FALLBACK_IMAGE }],
    };

    const primaryVariant = productData.variants && productData.variants[0] ? productData.variants[0] : null;
    const imageUrl = primaryVariant ? primaryVariant.image : FALLBACK_IMAGE;
    const formattedPrice =
        primaryVariant && typeof primaryVariant.price === 'number'
            ? `${primaryVariant.price.toLocaleString('ko-KR')}\uC6D0`
            : '';

    const handleAddToCart = (event) => {
        event.stopPropagation();

        if (!product) {
            return;
        }

        requireLoginAction(() => dispatch(addToCart({ product, variantIndex: 0 })));
    };

    const handleCardClick = () => {
        if (!product) {
            return;
        }

        navigate(getProductDetailPath(product));
    };

    const handleCardKeyDown = (event) => {
        if (!product) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardClick();
        }
    };

    return (
        <div
            className="bestboxSm"
            role={product ? 'link' : undefined}
            tabIndex={product ? 0 : undefined}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            aria-label={product ? `${product.name} 상세보기` : undefined}
        >
            <div className="badges">
                {productData.badge.includes('Best') && <Best />}
                {productData.badge.includes('New') && <New />}
                {productData.badge.includes('Exclusive') && <Exclusive />}
            </div>
            <div className="imgs">
                <img src={imageUrl} alt={productData.name} />
            </div>
            <div className="info">
                <p className="product-name">{productData.name}</p>
                <p className="product-price">{formattedPrice}</p>
            </div>
            <AddToCartButton
                className="cart-cta"
                text={ADD_TO_CART_LABEL}
                width="100%"
                disabled={!product}
                onClick={handleAddToCart}
            />
        </div>
    );
};

export default BestboxSm;
