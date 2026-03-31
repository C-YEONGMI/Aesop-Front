import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import officialProductImage from '../../../assets/official_product.png';
import bodyCleanserImage from '../../../assets/Configuration_bodycleanser.png';
import perfumeImage from '../../../assets/Configuration_Perfume.png';
import sampleImage from '../../../assets/sample_img.png';
import soapImage from '../../../assets/Configuration_soap.png';
import giftCardImage from '../../../assets/Configuration_GiftCard.png';
import storeImage01 from '../../../assets/about_shop04.png';
import storeImage02 from '../../../assets/about_shop06.png';
import storeImage03 from '../../../assets/about_shop08.png';
import storeImage04 from '../../../assets/about_shop11.png';
import storeImage05 from '../../../assets/Main_store.png';
import OfficialBenefitsIntroTransition from './OfficialBenefitsIntroTransition';
import MoreBox from '../../common/button/MoreBox';
import './OfficialBenefitsSequence.scss';

gsap.registerPlugin(ScrollTrigger);

const BENEFIT_CARDS = [
    {
        id: '01',
        title: 'DELIVERY & RETURNS',
        lines: [
            '주문하신 제품은 영업일 기준 3~5일 이내에 무료 배송되며,',
            '보다 편안한 온라인 경험을 위해 미개봉 제품은 구매 후 7일 이내 무료 반품이 가능합니다.',
        ],
        image: bodyCleanserImage,
        imageAlt: '배송 및 반품 서비스를 상징하는 이솝 제품 이미지',
        theme: 'dark',
        summaryTitle: 'Delivery & Returns',
        summaryImage: storeImage01,
        summaryImageAlt: 'Delivery and returns card background',
    },
    {
        id: '02',
        title: 'SAMPLE EXPERIENCE',
        lines: [
            '주문과 함께 샘플을 선택해 새로운 제품을 집에서도 경험할 수 있습니다.',
            '아직 만나보지 못한 제품까지 천천히 경험해 보세요.',
        ],
        image: sampleImage,
        imageAlt: '샘플 경험을 상징하는 이솝 샘플 이미지',
        theme: 'sand',
        summaryTitle: 'Sample Experience',
        summaryImage: storeImage02,
        summaryImageAlt: 'Sample experience card background',
    },
    {
        id: '03',
        title: 'CORPORATE GIFTING',
        lines: [
            '기업과 단체, 그리고 중요한 자리를 위한 기프트를 제안해 드립니다.',
            '목적과 규모에 맞는 구성으로 보다 정돈된 경험을 완성할 수 있습니다.',
        ],
        image: giftCardImage,
        imageAlt: '기업 기프팅 서비스를 상징하는 기프트 카드 이미지',
        theme: 'oatmeal',
        summaryTitle: 'Corporate Gifting',
        summaryImage: storeImage03,
        summaryImageAlt: 'Corporate gifting card background',
    },
    {
        id: '04',
        title: 'GIFT GUIDE',
        lines: [
            '제품과 주문에 관한 안내는 물론, 선물 선택에 필요한 제안까지 집에서도 받아보실 수 있습니다.',
            '공식 온라인 몰에서만 이어지는 배려를 편안한 방식으로 경험해 보세요.',
        ],
        image: soapImage,
        imageAlt: '기프트 가이드를 상징하는 이솝 제품 이미지',
        theme: 'sand',
        summaryTitle: 'Gift Guide',
        summaryImage: storeImage04,
        summaryImageAlt: 'Gift guide card background',
    },
    {
        id: '05',
        title: 'CONSULT WITH US',
        lines: [
            '제품이나 선물 선택이 고민될 때 온라인에서도 상담을 받아보실 수 있습니다.',
            '매장에서 이어지던 세심한 안내를 새로운 환경에서도 경험하실 수 있습니다.',
        ],
        image: perfumeImage,
        imageAlt: '온라인 상담을 상징하는 이솝 향수 이미지',
        theme: 'oatmeal',
        summaryTitle: 'Consult With Us',
        summaryImage: storeImage05,
        summaryImageAlt: 'Consult with us card background',
    },
];

const OfficialBenefitsSequence = () => {
    const rootRef = useRef(null);
    const reelSectionRef = useRef(null);
    const reelTrackRef = useRef(null);
    const summaryRef = useRef(null);
    const summaryCopyRef = useRef(null);

    useLayoutEffect(() => {
        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {
            mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
                const reelTrack = reelTrackRef.current;
                const reelSection = reelSectionRef.current;
                const summary = summaryRef.current;
                const summaryCards = gsap.utils.toArray(
                    '.official-benefits-sequence__summary-card',
                    summary
                );
                const slides = gsap.utils.toArray('.official-benefits-sequence__slide', reelTrack);

                const getTravelDistance = () =>
                    Math.max(0, reelTrack.scrollWidth - reelSection.clientWidth);

                gsap.set(summary, { autoAlpha: 0, y: 56 });
                gsap.set(summaryCards, { autoAlpha: 0, y: 24, scale: 1.03 });
                gsap.set(summaryCopyRef.current, { autoAlpha: 0, y: 36 });

                const slideMotionStart = 0.05;
                const slideMotionDuration = 2.15;
                const reelExitStart = 2.32;
                const summaryStart = 2.38;
                const summaryCardsStart = 2.42;
                const summaryCopyStart = 2.48;

                const reelTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: reelSection,
                        start: 'top top',
                        end: () => `+=${getTravelDistance() + window.innerWidth * 1.45}`,
                        pin: true,
                        scrub: 1,
                        snap: {
                            snapTo: 'labelsDirectional',
                            duration: { min: 0.24, max: 0.52 },
                            delay: 0.04,
                            ease: 'power3.out',
                        },
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                reelTimeline.addLabel('reel-start', 0);
                slides.forEach((_, index) => {
                    const stopTime =
                        slideMotionStart +
                        (slideMotionDuration * index) / Math.max(slides.length - 1, 1);
                    reelTimeline.addLabel(`card-${index + 1}`, stopTime);
                });
                reelTimeline.addLabel('reel-summary', summaryStart);

                reelTimeline
                    .fromTo(
                        slides,
                        { y: 26 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.34,
                            stagger: 0.05,
                            ease: 'power2.out',
                        },
                        0
                    )
                    .to(
                        reelTrack,
                        {
                            x: () => -getTravelDistance(),
                            duration: 2.15,
                            ease: 'none',
                        },
                        0.05
                    )
                    .to(
                        reelTrack,
                        {
                            autoAlpha: 0,
                            scale: 0.9,
                            y: -56,
                            duration: 0.32,
                            ease: 'power2.inOut',
                        },
                        reelExitStart
                    )
                    .to(
                        summary,
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.28,
                            ease: 'power2.out',
                        },
                        summaryStart
                    )
                    .to(
                        summaryCards,
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.04,
                            duration: 0.22,
                            ease: 'power2.out',
                        },
                        summaryCardsStart
                    )
                    .to(
                        summaryCopyRef.current,
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.24,
                            ease: 'power2.out',
                        },
                        summaryCopyStart
                    );
            });

            mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
                gsap.utils.toArray('.official-benefits-sequence__slide').forEach((slide) => {
                    gsap.fromTo(
                        slide,
                        { autoAlpha: 0, y: 28 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: slide,
                                start: 'top 84%',
                                once: true,
                            },
                        }
                    );
                });

                gsap.fromTo(
                    summaryRef.current,
                    { autoAlpha: 0, y: 36 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.72,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: summaryRef.current,
                            start: 'top 84%',
                            once: true,
                        },
                    }
                );
            });
        }, rootRef);

        return () => {
            ctx.revert();
            mm.revert();
        };
    }, []);

    return (
        <div className="official-benefits-sequence" ref={rootRef}>
            <OfficialBenefitsIntroTransition
                heroTitleLines={['Exclusive Services at the', 'Official Online Store']}
                secondaryTitleLines={[
                    'The official online store extends',
                    "Aesop's thoughtful service online.",
                ]}
                productImage={officialProductImage}
                productAlt="공식 온라인 몰 서비스를 상징하는 이솝 제품 이미지"
            />

            <section className="official-benefits-sequence__reel" ref={reelSectionRef}>
                <div className="official-benefits-sequence__reel-pin">
                    <div className="official-benefits-sequence__track-shell">
                        <div className="official-benefits-sequence__track" ref={reelTrackRef}>
                            {BENEFIT_CARDS.map((card) => (
                                <article
                                    className={`official-benefits-sequence__slide official-benefits-sequence__slide--${card.theme}`}
                                    key={card.id}
                                >
                                    <div className="official-benefits-sequence__slide-visual">
                                        <div className="official-benefits-sequence__visual-board">
                                            <img
                                                className="official-benefits-sequence__visual-product"
                                                src={card.image}
                                                alt={card.imageAlt}
                                            />
                                        </div>
                                    </div>

                                    <div className="official-benefits-sequence__slide-copy">
                                        <div className="official-benefits-sequence__slide-heading">
                                            <h3 className="official-benefits-sequence__slide-title optima-48">
                                                {card.title}
                                            </h3>
                                            <span className="official-benefits-sequence__slide-rule" />
                                        </div>

                                        <p className="official-benefits-sequence__slide-index optima-16">
                                            <span className="official-benefits-sequence__slide-index-current">
                                                {card.id}
                                            </span>
                                            <span className="official-benefits-sequence__slide-index-total">
                                                {' '}
                                                / 05
                                            </span>
                                        </p>

                                        <div className="official-benefits-sequence__slide-body suit-18-r">
                                            {card.lines.map((line) => (
                                                <p key={line}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="official-benefits-sequence__summary" ref={summaryRef}>
                        <div className="official-benefits-sequence__summary-row">
                            {BENEFIT_CARDS.map((card) => (
                                <article
                                    className="official-benefits-sequence__summary-card"
                                    key={`summary-${card.id}`}
                                >
                                    <img
                                        className="official-benefits-sequence__summary-card-image"
                                        src={card.summaryImage}
                                        alt={card.summaryImageAlt}
                                    />
                                    <div className="official-benefits-sequence__summary-card-overlay" />
                                    <div className="official-benefits-sequence__summary-card-content">
                                        <p className="official-benefits-sequence__summary-card-title optima-20">
                                            {card.summaryTitle}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="official-benefits-sequence__summary-copy" ref={summaryCopyRef}>
                            <h2 className="official-benefits-sequence__summary-heading montage-80">
                                Aesop&apos;s thoughtful service,
                                <br />
                                now online
                            </h2>
                            <p className="official-benefits-sequence__summary-body suit-18-r">
                                이솝의 세심한 서비스는 온라인까지 이어집니다.
                            </p>
                            <div className="official-benefits-sequence__summary-actions">
                                <MoreBox text="View Product" to="/products" />
                                <MoreBox text="Veiw Main" to="/" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OfficialBenefitsSequence;
