import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import pnavHairShaving from '../../../assets/pnav_hair_shaving.png';
import pnavHandBody from '../../../assets/pnav_hand_body.png';
import pnavHomeLiving from '../../../assets/pnav_home_living.png';
import pnavKits from '../../../assets/pnav_kits.png';
import pnavPerfume from '../../../assets/pnav_perfume.png';
import pnavSkincare from '../../../assets/pnav_skincare.png';
import { PRODUCT_CATEGORY_CONFIG } from '../../../data/productCategories';
import './ProductNavigatorSection.scss';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_BREAKPOINT = 1024;
const SCROLL_STEP = 220;
const SECTION_DESCRIPTION =
    '피부와 손길, 향과 공간에 이르기까지, 이솝의 다양한 제품군을 천천히 살펴보세요.';

const CATEGORY_DATA = [
    {
        id: 'skincare',
        label: PRODUCT_CATEGORY_CONFIG.skincare.label,
        centerLabel: PRODUCT_CATEGORY_CONFIG.skincare.label,
        link: '/products/skincare',
        bgImage: pnavSkincare,
    },
    {
        id: 'body',
        label: PRODUCT_CATEGORY_CONFIG.body.label,
        centerLabel: PRODUCT_CATEGORY_CONFIG.body.label,
        link: '/products/body',
        bgImage: pnavHandBody,
    },
    {
        id: 'fragrance',
        label: PRODUCT_CATEGORY_CONFIG.fragrance.label.toUpperCase(),
        centerLabel: PRODUCT_CATEGORY_CONFIG.fragrance.label.toUpperCase(),
        link: '/products/fragrance',
        bgImage: pnavPerfume,
    },
    {
        id: 'home',
        label: PRODUCT_CATEGORY_CONFIG.home.label,
        centerLabel: PRODUCT_CATEGORY_CONFIG.home.label,
        link: '/products/home',
        bgImage: pnavHomeLiving,
    },
    {
        id: 'hair',
        label: PRODUCT_CATEGORY_CONFIG.hair.label,
        centerLabel: PRODUCT_CATEGORY_CONFIG.hair.label,
        link: '/products/hair',
        bgImage: pnavHairShaving,
    },
    {
        id: 'kits',
        label: PRODUCT_CATEGORY_CONFIG.kits.label,
        centerLabel: PRODUCT_CATEGORY_CONFIG.kits.label,
        link: '/products/kits',
        bgImage: pnavKits,
    },
];

const getCategoryButtonClassName = (isActive) =>
    `pnav__cat-btn ${isActive ? 'optima-40 active' : 'optima-20'}`;

const ProductNavigatorSection = () => {
    const sectionRef = useRef(null);
    const bgCurrentRef = useRef(null);
    const bgPrevRef = useRef(null);
    const centerRef = useRef(null);
    const menuRefs = useRef([]);
    const activeIndexRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [prevBgImage, setPrevBgImage] = useState(null);
    const activeData = CATEGORY_DATA[activeIndex];
    const scrollLength = (CATEGORY_DATA.length - 1) * SCROLL_STEP;

    const setMenuRef = (index) => (element) => {
        menuRefs.current[index] = element;
    };

    const updateActiveIndex = (nextIndex) => {
        const currentIndex = activeIndexRef.current;

        if (currentIndex === nextIndex) {
            return;
        }

        setPrevBgImage(CATEGORY_DATA[currentIndex].bgImage);
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.pnav__header, .pnav__menu, .pnav__center',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out',
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add(`(min-width: ${DESKTOP_BREAKPOINT}px)`, () => {
            const maxIndex = CATEGORY_DATA.length - 1;
            const trigger = ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.2,
                snap: maxIndex > 0 ? 1 / maxIndex : false,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const nextIndex = Math.round(self.progress * maxIndex);
                    updateActiveIndex(nextIndex);
                },
                onLeaveBack: () => {
                    updateActiveIndex(0);
                },
            });

            return () => trigger.kill();
        });

        mm.add(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`, () => {
            updateActiveIndex(0);
        });

        return () => mm.revert();
    }, []);

    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    useLayoutEffect(() => {
        if (!sectionRef.current) {
            return undefined;
        }

        const ctx = gsap.context(() => {
            const activeItem = menuRefs.current[activeIndex];
            const centerLabel = centerRef.current;
            const timeline = gsap.timeline({
                defaults: {
                    duration: 0.72,
                    ease: 'power3.out',
                },
                onComplete: () => {
                    setPrevBgImage(null);
                },
            });

            if (bgCurrentRef.current) {
                timeline.fromTo(
                    bgCurrentRef.current,
                    {
                        autoAlpha: prevBgImage ? 0.68 : 1,
                        scale: prevBgImage ? 1.02 : 1,
                    },
                    {
                        autoAlpha: 1,
                        scale: 1,
                    },
                    0
                );
            }

            if (bgPrevRef.current && prevBgImage) {
                timeline.to(
                    bgPrevRef.current,
                    {
                        autoAlpha: 0,
                        scale: 1.03,
                    },
                    0
                );
            }

            if (centerLabel) {
                timeline.fromTo(
                    centerLabel,
                    {
                        autoAlpha: 0,
                        yPercent: 18,
                    },
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                    },
                    0.08
                );
            }

            if (activeItem) {
                timeline.fromTo(
                    activeItem,
                    {
                        autoAlpha: 0.55,
                        x: -18,
                    },
                    {
                        autoAlpha: 1,
                        x: 0,
                    },
                    0.12
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [activeIndex]);

    const handleCategorySelect = (nextIndex) => {
        if (nextIndex === activeIndex) {
            return;
        }

        updateActiveIndex(nextIndex);

        if (window.innerWidth < DESKTOP_BREAKPOINT || !sectionRef.current) {
            return;
        }

        const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        const targetTop = sectionTop + nextIndex * SCROLL_STEP;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth',
        });
    };

    return (
        <section
            className="pnav"
            ref={sectionRef}
            style={{ '--pnav-scroll-length': `${scrollLength}px` }}
        >
            <div className="pnav__stage">
                {prevBgImage ? (
                    <div
                        ref={bgPrevRef}
                        className="pnav__bg pnav__bg--previous"
                        style={{ backgroundImage: `url(${prevBgImage})` }}
                    />
                ) : null}
                <div
                    ref={bgCurrentRef}
                    className="pnav__bg pnav__bg--current"
                    style={{ backgroundImage: `url(${activeData.bgImage})` }}
                />
                <div className="pnav__overlay" />

                <div className="pnav__inner">
                    <div className="pnav__header">
                        <h2 className="pnav__title montage-220">Product</h2>
                        <p className="pnav__desc suit-20-l">{SECTION_DESCRIPTION}</p>
                    </div>

                    <div className="pnav__menu pnav__menu--left">
                        <ul className="pnav__cat-list pnav__cat-list--left">
                            {CATEGORY_DATA.map((category, categoryIndex) => {
                                const isActive = categoryIndex === activeIndex;

                                return (
                                    <li
                                        key={`left-${category.id}`}
                                        ref={setMenuRef(categoryIndex)}
                                        className={`pnav__cat-item ${isActive ? 'is-active' : ''}`}
                                    >
                                        <span className="pnav__diamond" aria-hidden="true" />
                                        <button
                                            type="button"
                                            className={getCategoryButtonClassName(isActive)}
                                            onClick={() => handleCategorySelect(categoryIndex)}
                                            aria-pressed={isActive}
                                        >
                                            {category.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="pnav__center">
                        <Link
                            key={activeData.id}
                            ref={centerRef}
                            to={activeData.link}
                            className="pnav__center-cat optima-70"
                        >
                            {activeData.centerLabel}
                        </Link>
                    </div>

                    <div className="pnav__menu pnav__menu--right">
                        <ul className="pnav__cat-list pnav__cat-list--right">
                            {CATEGORY_DATA.map((category, categoryIndex) => {
                                const isActive = categoryIndex === activeIndex;

                                return (
                                    <li
                                        key={`right-${category.id}`}
                                        className={`pnav__cat-item ${isActive ? 'is-active' : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className={getCategoryButtonClassName(isActive)}
                                            onClick={() => handleCategorySelect(categoryIndex)}
                                            aria-pressed={isActive}
                                        >
                                            {category.label}
                                        </button>
                                        <span className="pnav__diamond" aria-hidden="true" />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductNavigatorSection;
