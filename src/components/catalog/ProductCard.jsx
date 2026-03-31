import React, { useState } from 'react';
import { getCategoryLabelFromValue } from '../../data/productCategories';

const ProductCard = ({ product }) => {
    // 2. 현재 선택된 용량 정보를 상태로 관리합니다. (기본값: 첫 번째 용량)
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

    // 3. (중요) '더보기' 상태 정의: isExpanded 상태가 없어서 오류가 났습니다.
    const [isExpanded, setIsExpanded] = useState(false);

    // 4. (중요) 이미지 주소 보정: 상대 경로('/dw/image/...')면 도메인을 붙여줍니다. 엑박 문제의 주원인입니다.
    const getFullImageUrl = (url) => {
        if (!url) return '';
        // 이미 주소에 http가 포함되어 있다면 그대로 사용, 아니면 도메인을 앞에 붙여줍니다.
        if (url.startsWith('http') || url.startsWith('/')) {
            return url;
        }
        return `https://kr.aesop.com${url}`;
    };

    // 가격 포맷팅 함수 (숫자일 경우 콤마 추가)
    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) : price;
        return num.toLocaleString();
    };

    const isSoldOut = product.status === false;

    return (
        <div className={`product-card${isSoldOut ? ' sold-out' : ''}`}>
            <div className="product-image-section">
                {isSoldOut && <span className="sold-out-badge">품절</span>}
                {/* 5. 보정된 이미지 주소(getFullImageUrl)를 src에 넣어줍니다. */}
                <img
                    src={getFullImageUrl(selectedVariant.image)}
                    alt={product.name}
                    className="product-main-img"
                />
            </div>

            <div className="product-info-section">
                <span className="category-label">{getCategoryLabelFromValue(product.category)}</span>
                <h3 className="product-title">{product.name}</h3>

                {/* 6. 설명 및 더보기 기능: props로 받은 데이터는 product인데 item으로 잘못 쓰인 곳을 수정했습니다. */}
                <div className="description-box">
                    <p className={`product-description ${isExpanded ? 'expanded' : ''}`}>
                        {product.description}
                    </p>
                    {/* 설명이 길 때만 더보기 버튼 노출 (선택 사항) */}
                    {product.description && (
                        <button
                            className="more-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? '간략히 보기' : '더보기'}
                        </button>
                    )}
                </div>

                {/* 7. 용량 선택 버튼 리스트 */}
                <div className="variant-selector">
                    {product.variants.map((v, index) => (
                        <button
                            key={index}
                            className={`variant-button ${selectedVariant.capacity === v.capacity ? 'active' : ''}`}
                            onClick={() => setSelectedVariant(v)}
                        >
                            {v.capacity}
                        </button>
                    ))}
                </div>

                {/* 8. 선택된 용량의 가격 표시 */}
                <div className="product-price">
                    ₩{formatPrice(selectedVariant.price)}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
