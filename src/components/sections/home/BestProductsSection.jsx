import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BestboxSm from './BestboxSm';
import BestpdLg from './BestpdLg';
import More from '../../common/button/more';
import { BEST_PRODUCT_NAMES } from '../../../data/mainPageContent';
import productsData from '../../../data/products.json';
import './BestProductsSection.scss';

gsap.registerPlugin(ScrollTrigger);

// 베스트 상품을 고정 3개로 큐레이션하여 소형-대형-소형 레이아웃으로 노출
// ⚠️ Math.random() 기반 랜덤 진열 사용 금지 (가이드 기준)
const BestProductsSection = () => {
    const sectionRef = useRef(null);
    const products = Array.isArray(productsData?.products) ? productsData.products : [];

    // mainPageContent.js의 고정 상품명 기준으로 필터링
    const bestProducts = BEST_PRODUCT_NAMES.map((name) =>
        products.find((product) => product.name === name)
    ).filter(Boolean);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                sectionRef.current.querySelectorAll('.best__card'),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section className="best-products" ref={sectionRef}>
            {/* 섹션 헤더: 타이틀 + 더보기 */}
            <div className="best-products__header">
                <h2 className="best-products__title montage-32">BEST PRODUCTS</h2>
                <More to="/products" />
            </div>

            {/* 상품 카드: 소형 1 - 대형 1 - 소형 1 */}
            <div className="best-products__gallery">
                {bestProducts.length >= 3 ? (
                    <>
                        <div className="best__card best__card--sm">
                            <BestboxSm product={bestProducts[0]} />
                        </div>
                        <div className="best__card best__card--lg">
                            <BestpdLg product={bestProducts[1]} />
                        </div>
                        <div className="best__card best__card--sm">
                            <BestboxSm product={bestProducts[2]} />
                        </div>
                    </>
                ) : (
                    <p className="best-products__empty suit-16-r">
                        베스트 상품을 불러오는 중입니다.
                    </p>
                )}
            </div>
        </section>
    );
};

export default BestProductsSection;
