import React from 'react';
import './Badge.scss';

const Badge = ({ children, variant = '', className = '' }) => {
    const variantClass = variant ? `badge-${variant}` : '';
    return (
        <span className={['badge', variantClass, className].filter(Boolean).join(' ')}>
            {children}
        </span>
    );
};

export default Badge;
