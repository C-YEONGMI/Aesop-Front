import React from 'react';
import './Btn.scss';

const CartButton = ({
    text = '장바구니 담기',
    className = '',
    type = 'button',
    ...props
}) => {
    const buttonClassName = className
        ? `btn-cart ${className}`
        : 'btn-cart';

    return (
        <button type={type} className={buttonClassName} {...props}>
            {text}
        </button>
    );
};

export default CartButton;
