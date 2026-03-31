import React, { useState, useMemo } from 'react';
import products from '../../data/products.json';
import { getCategoryLabelFromValue } from '../../data/productCategories';
import './ProductList.css';

// 개별 제품 카드를 위한 컴포넌트 (용량 선택 기능 포함)
const ProductCard = ({ item }) => {
    // 각 카드마다 어떤 용량이 선택되었는지 관리합니다. (기본값: 첫 번째 용량)
    const [selectedVariant, setSelectedVariant] = useState(item.variants[0]);

    const formatPrice = (price) => {
        if (!price) return "가격 정보 없음";
        const num = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, ''), 10) : price;
        return isNaN(num) ? "가격 정보 없음" : `${num.toLocaleString()}원`;
    };

    return (
        <div className="product-card">
            <div className="image-box">
                {/* 선택된 용량에 따라 이미지가 바뀝니다. */}
                <img src={selectedVariant.image} alt={item.name} />
            </div>
            <div className="info-box">
                <span className="category-tag">{getCategoryLabelFromValue(item.category)}</span>
                <h3 className="name">{item.name}</h3>
                <p className="desc">{item.description}</p>

                {/* 용량 선택 버튼들 */}
                <div className="size-selector">
                    {item.variants.map((v, i) => (
                        <button
                            key={i}
                            className={`size-btn ${selectedVariant.capacity === v.capacity ? 'active' : ''}`}
                            onClick={() => setSelectedVariant(v)}
                        >
                            {v.capacity}
                        </button>
                    ))}
                </div>

                {/* 선택된 용량에 따라 가격이 바뀝니다. */}
                <p className="price">{formatPrice(selectedVariant.price)}</p>
            </div>
        </div>
    );
};

const ProductList = () => {
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map((p) => p.category)));
        return ['All', ...cats];
    }, []);

    const [activeCategory, setActiveCategory] = useState('All');

    const filteredProducts = useMemo(() => {
        const list = products;
        if (activeCategory === 'All') return list;
        return list.filter((p) => p.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="aesop-container">
            <header className="aesop-header">
                <h1>Aesop Collection</h1>
                <p>총 {filteredProducts.length}개의 제품</p>
            </header>

            <nav className="category-tabs">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat === 'All' ? cat : getCategoryLabelFromValue(cat)}
                    </button>
                ))}
            </nav>

            <div className="product-grid">
                {filteredProducts.map((item, index) => (
                    // 개별 컴포넌트로 호출하여 각자 용량 상태를 가지게 합니다.
                    <ProductCard key={index} item={item} />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
