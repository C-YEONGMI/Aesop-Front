import React from 'react';
import GiftGuideFlow from '../../components/features/gift-guide/GiftGuideFlow';
import './GiftGuide.scss';

const GiftGuide = () => {
    return (
        <div className="gift-guide-page">
            <div className="gift-guide-page__header-space" />
            <div className="gift-guide-page__inner">
<GiftGuideFlow />
            </div>
        </div>
    );
};

export default GiftGuide;
