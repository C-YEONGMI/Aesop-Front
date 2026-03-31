import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NewArrivalGif from '../../../assets/New_R.gif';
import NewArrivalThumb1 from '../../../assets/New_S1.png';
import NewArrivalThumb2 from '../../../assets/New_S2.png';
import productsData from '../../../data/products.json';
import { getProductDetailPath } from '../../../lib/products/productShape';
import More from '../../common/button/more';
import './NewArrivalSection.scss';

gsap.registerPlugin(ScrollTrigger);

const NEW_ARRIVAL_PRODUCT =
    productsData.products?.find((product) =>
        product.variants?.some((variant) => variant.image?.includes('Above_Us_Steorra'))
    ) || null;

const NEW_ARRIVAL_PRODUCT_LINK = NEW_ARRIVAL_PRODUCT
    ? getProductDetailPath(NEW_ARRIVAL_PRODUCT)
    : '/products/fragrance';

const NewArrivalSection = () => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);
    const visualRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 42 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 72%',
                    },
                }
            );

            gsap.fromTo(
                visualRef.current,
                { opacity: 0, scale: 0.96 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 72%',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="new-arrival" ref={sectionRef} data-name="new arrival" data-node-id="530:1772">
            <div className="new-arrival__inner">
                <div className="new-arrival__content" ref={contentRef}>
                    <div className="new-arrival__header" data-node-id="530:1783">
                        <h2 className="new-arrival__title montage-48" data-node-id="530:1784">
                            New Arrival
                        </h2>
                        <div className="new-arrival__more-wrapper" data-node-id="530:1785">
                            <More text="more" to={NEW_ARRIVAL_PRODUCT_LINK} />
                        </div>
                    </div>

                    <div className="new-arrival__thumb-strip" data-node-id="530:1775">
                        <div className="new-arrival__thumb" data-node-id="530:1776">
                            <img
                                src={NewArrivalThumb1}
                                alt="Above Us, Steorra bottle detail"
                                className="new-arrival__thumb-image"
                            />
                        </div>
                        <div className="new-arrival__thumb" data-node-id="530:1777">
                            <img
                                src={NewArrivalThumb2}
                                alt="Above Us, Steorra in-situ fragrance image"
                                className="new-arrival__thumb-image"
                            />
                        </div>
                    </div>

                    <div className="new-arrival__info" data-node-id="530:1778">
                        <div className="new-arrival__info-head" data-node-id="530:1779">
                            <h3 className="new-arrival__name montage-30" data-node-id="530:1780">
                                Above Us, Steorra
                            </h3>
                            <p className="new-arrival__type montage-24" data-node-id="530:1781">
                                Eau de Parfum
                            </p>
                        </div>
                        <p className="new-arrival__desc suit-18-r" data-node-id="530:1782">
                            프랑킨센스와 밝은 우디 노트가 어우러져 깊고 또렷한 인상을 남기고,
                            <br />
                            차갑게 반짝이는 스파이스 향이 선명한 균형을 이루는 향수
                        </p>
                    </div>
                </div>

                <div className="new-arrival__visual" ref={visualRef} data-node-id="530:1773">
                    <img
                        src={NewArrivalGif}
                        alt="Above Us, Steorra fragrance campaign animation"
                        className="new-arrival__visual-media"
                    />
                </div>
            </div>
        </section>
    );
};

export default NewArrivalSection;
