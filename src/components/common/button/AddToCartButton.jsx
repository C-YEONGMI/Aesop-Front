import React from 'react';
import './AddToCartButton.scss';

const AddToCartButton = ({
    text = '장바구니 담기',
    className = '',
    type = 'button',
    width,
    style,
    ...props
}) => {
    const buttonClassName = className
        ? `add-to-cart-button ${className}`
        : 'add-to-cart-button';

    const buttonStyle = width
        ? {
            '--add-to-cart-button-width': typeof width === 'number' ? `${width}px` : width,
            ...style,
        }
        : style;

    return (
        <button type={type} className={buttonClassName} style={buttonStyle} {...props}>
            {text}
        </button>
    );
};

export default AddToCartButton;
