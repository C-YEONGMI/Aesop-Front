import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import MoreWhBox from '../../common/button/MoreWhBox';
import bestGiftL1 from '../../../assets/BestGift_L1.png';
import bestGiftL2 from '../../../assets/BestGift_L2.png';
import bestGiftL3 from '../../../assets/BestGift_L3.png';
import bestGiftM1 from '../../../assets/BestGift_M1.png';
import bestGiftM2 from '../../../assets/BestGift_M2.png';
import bestGiftM3 from '../../../assets/BestGift_M3.png';
import bestGiftR1 from '../../../assets/BestGift_R1.png';
import bestGiftR2 from '../../../assets/BestGift_R2.png';
import bestGiftR3 from '../../../assets/BestGift_R3.png';
import './BestGiftSection.scss';

gsap.registerPlugin(ScrollTrigger, Draggable);

const SLIDE_ITEMS = [
    {
        nameEng: 'Resurrection Duet',
        nameKr: '레저렉션 듀엣',
        desc: '지친 손을 깨끗하게 세정하고 영양을 공급해 부드럽게 가꿔주는 핸드 케어 세트',
        link: '/product/Resurrection%20Duet',
        images: {
            left: bestGiftL1,
            main: bestGiftM1,
            right: bestGiftR1,
        },
    },
    {
        nameEng: 'Party in the Greenhouse',
        nameKr: '파티 인 더 그린하우스',
        desc: '상쾌하고 생기 넘치는 그린 아로마를 담은 인기 아이템: 부드러운 바디 클렌저, 활력을 더하는 바디 스크럽, 영양 가득한 바디 밤',
        link: '/product/Party%20in%20the%20Greenhouse',
        images: {
            left: bestGiftL2,
            main: bestGiftM2,
            right: bestGiftR2,
        },
    },
    {
        nameEng: 'Shower Room Serenades',
        nameKr: '샤워 룸 세레나데',
        desc: '우디, 스파이시, 허브 향이 어우러진 아로마를 공유하는 부드러운 크림 타입의 바디 클렌저와 고보습 핸드 밤으로 구성된 듀오',
        link: '/product/Shower%20Room%20Serenades',
        images: {
            left: bestGiftL3,
            main: bestGiftM3,
            right: bestGiftR3,
        },
    },
];

const BestGiftSection = () => {
    const sectionRef = useRef(null);
    const dragProxyRef = useRef(null);
    const countTrackRef = useRef(null);
    const progressRef = useRef(null);
    const autoplayTimerRef = useRef(null);
    const activeIndexRef = useRef(0);
    const isTransitioningRef = useRef(false);
    const imageRefs = useRef({
        leftCurrent: null,
        leftPrev: null,
        mainCurrent: null,
        mainPrev: null,
        rightCurrent: null,
        rightPrev: null,
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(null);

    const setImageRef = (key) => (element) => {
        imageRefs.current[key] = element;
    };

    const clearAutoplay = () => {
        if (autoplayTimerRef.current) {
            window.clearTimeout(autoplayTimerRef.current);
            autoplayTimerRef.current = null;
        }
    };

    const queueAutoplay = () => {
        clearAutoplay();
        autoplayTimerRef.current = window.setTimeout(() => {
            if (isTransitioningRef.current) {
                queueAutoplay();
                return;
            }

            const nextIndex = (activeIndexRef.current + 1) % SLIDE_ITEMS.length;
            setPrevIndex(activeIndexRef.current);
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
        }, 4200);
    };

    const getCurrentImageNodes = () =>
        [
            imageRefs.current.leftCurrent,
            imageRefs.current.mainCurrent,
            imageRefs.current.rightCurrent,
        ].filter(Boolean);

    const resetDraggedImages = (duration = 0.35) => {
        const currentNodes = getCurrentImageNodes();

        if (!currentNodes.length) {
            return;
        }

        gsap.to(currentNodes, {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration,
            ease: 'power3.out',
            overwrite: true,
        });
    };

    const updateDraggedImages = (distance) => {
        const currentNodes = getCurrentImageNodes();
        const width = imageRefs.current.mainCurrent?.getBoundingClientRect().width || 1;
        const progress = Math.min(Math.abs(distance) / width, 1);

        if (imageRefs.current.mainCurrent) {
            gsap.set(imageRefs.current.mainCurrent, {
                x: distance,
                scale: 1 - progress * 0.025,
                autoAlpha: 1,
                overwrite: true,
            });
        }

        if (imageRefs.current.leftCurrent) {
            gsap.set(imageRefs.current.leftCurrent, {
                x: distance * 0.34,
                scale: 1 - progress * 0.05,
                autoAlpha: 1 - progress * 0.12,
                overwrite: true,
            });
        }

        if (imageRefs.current.rightCurrent) {
            gsap.set(imageRefs.current.rightCurrent, {
                x: distance * 0.42,
                y: progress * 8,
                scale: 1 - progress * 0.04,
                autoAlpha: 1 - progress * 0.12,
                overwrite: true,
            });
        }

        if (!currentNodes.length) {
            return 0;
        }

        return width * 0.18;
    };

    useEffect(() => {
        if (SLIDE_ITEMS.length <= 1) {
            return undefined;
        }

        queueAutoplay();

        return () => clearAutoplay();
    }, [activeIndex]);

    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    useLayoutEffect(() => {
        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {
            const animateTargets = (selector) => {
                gsap.fromTo(
                    sectionRef.current.querySelectorAll(selector),
                    { opacity: 0, y: 36 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        stagger: 0.12,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 72%',
                        },
                    }
                );
            };

            mm.add('(min-width: 768px)', () => {
                animateTargets('.best-gift__left, .best-gift__center, .best-gift__right');
            });

            mm.add('(max-width: 767px)', () => {
                animateTargets(
                    '.best-gift__left, .best-gift__center, .best-gift__img-point, .best-gift__text-box'
                );
            });
        }, sectionRef);

        return () => {
            ctx.revert();
            mm.revert();
        };
    }, []);

    useLayoutEffect(() => {
        if (!sectionRef.current) {
            return undefined;
        }

        const countTrack = countTrackRef.current;
        const progress = progressRef.current;
        const {
            leftCurrent,
            leftPrev,
            mainCurrent,
            mainPrev,
            rightCurrent,
            rightPrev,
        } = imageRefs.current;
        const textNodes = sectionRef.current.querySelectorAll(
            '.best-gift__title, .best-gift__info > *, .best-gift__desc, .best-gift__action'
        );
        const tl = gsap.timeline({
            defaults: {
                duration: 0.82,
                ease: 'power3.out',
            },
            onComplete: () => {
                isTransitioningRef.current = false;
                setPrevIndex(null);
            },
        });

        isTransitioningRef.current = true;

        if (countTrack?.firstElementChild) {
            const countHeight = countTrack.firstElementChild.getBoundingClientRect().height;
            tl.to(
                countTrack,
                {
                    y: -activeIndex * countHeight,
                    duration: 0.8,
                    ease: 'power2.inOut',
                },
                0
            );
        }

        if (progress) {
            gsap.killTweensOf(progress);
            gsap.set(progress, {
                scaleX: 0,
                transformOrigin: 'left center',
            });
            gsap.to(progress, {
                scaleX: 1,
                duration: 4.2,
                ease: 'none',
            });
        }

        if (leftPrev || mainPrev || rightPrev) {
            gsap.set([leftPrev, mainPrev, rightPrev].filter(Boolean), {
                autoAlpha: 1,
                zIndex: 1,
            });
        }

        if (leftCurrent || mainCurrent || rightCurrent) {
            gsap.set([leftCurrent, mainCurrent, rightCurrent].filter(Boolean), {
                autoAlpha: 1,
                zIndex: 2,
            });
        }

        if (mainPrev) {
            tl.to(
                mainPrev,
                {
                    xPercent: -100,
                    autoAlpha: 0,
                    duration: 0.92,
                    ease: 'power2.inOut',
                },
                0
            );
        }

        if (leftPrev) {
            tl.to(
                leftPrev,
                {
                    xPercent: -24,
                    autoAlpha: 0,
                    scale: 0.9,
                    duration: 0.74,
                    ease: 'power2.inOut',
                },
                0
            );
        }

        if (rightPrev) {
            tl.to(
                rightPrev,
                {
                    xPercent: -24,
                    autoAlpha: 0,
                    scale: 0.9,
                    duration: 0.74,
                    ease: 'power2.inOut',
                },
                0.04
            );
        }

        if (mainCurrent) {
            tl.fromTo(
                mainCurrent,
                {
                    xPercent: 100,
                    autoAlpha: 1,
                    scale: 1.03,
                },
                {
                    xPercent: 0,
                    scale: 1,
                    duration: 0.96,
                },
                0
            );
        }

        if (leftCurrent) {
            tl.fromTo(
                leftCurrent,
                {
                    autoAlpha: 0,
                    xPercent: 100,
                    scale: 1.05,
                },
                {
                    autoAlpha: 1,
                    xPercent: 0,
                    scale: 1,
                },
                0.08
            );
        }

        if (rightCurrent) {
            tl.fromTo(
                rightCurrent,
                {
                    autoAlpha: 0,
                    xPercent: 100,
                    yPercent: 6,
                    scale: 1.06,
                },
                {
                    autoAlpha: 1,
                    xPercent: 0,
                    yPercent: 0,
                    scale: 1,
                },
                0.12
            );
        }

        if (textNodes.length) {
            tl.fromTo(
                textNodes,
                {
                    autoAlpha: 0,
                    y: 30,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                },
                0.14
            );
        }

        return () => {
            tl.kill();
            isTransitioningRef.current = false;
            if (progress) {
                gsap.killTweensOf(progress);
            }
        };
    }, [activeIndex]);

    useEffect(() => {
        if (!sectionRef.current || !dragProxyRef.current) {
            return undefined;
        }

        const proxy = dragProxyRef.current;
        const getThreshold = () => {
            const width = imageRefs.current.mainCurrent?.getBoundingClientRect().width || sectionRef.current.offsetWidth || 1;
            return Math.min(Math.max(width * 0.18, 56), 120);
        };

        const dragger = Draggable.create(proxy, {
            type: 'x',
            trigger: sectionRef.current,
            minimumMovement: 10,
            dragClickables: false,
            allowNativeTouchScrolling: true,
            edgeResistance: 0.82,
            zIndexBoost: false,
            bounds: {
                minX: -sectionRef.current.offsetWidth,
                maxX: sectionRef.current.offsetWidth,
            },
            onPress() {
                if (isTransitioningRef.current) {
                    return;
                }

                clearAutoplay();
                gsap.killTweensOf(getCurrentImageNodes());
                gsap.set(proxy, { x: 0 });
            },
            onDrag() {
                if (isTransitioningRef.current) {
                    return;
                }

                updateDraggedImages(this.x);
            },
            onRelease() {
                if (isTransitioningRef.current) {
                    resetDraggedImages(0.2);
                    queueAutoplay();
                    return;
                }

                const threshold = getThreshold();
                const distance = this.x;

                if (Math.abs(distance) >= threshold) {
                    const direction = distance < 0 ? 1 : -1;
                    const nextIndex = (activeIndexRef.current + direction + SLIDE_ITEMS.length) % SLIDE_ITEMS.length;
                    const currentNodes = getCurrentImageNodes();
                    const exitX = distance < 0 ? -threshold * 1.45 : threshold * 1.45;

                    clearAutoplay();
                    isTransitioningRef.current = true;

                    gsap.to(currentNodes, {
                        x: (index) => (index === 0 ? exitX * 0.34 : index === 1 ? exitX : exitX * 0.42),
                        y: (index) => (index === 2 ? 8 : 0),
                        scale: (index) => (index === 1 ? 0.98 : 0.94),
                        autoAlpha: 0,
                        duration: 0.28,
                        ease: 'power2.in',
                        overwrite: true,
                        onComplete: () => {
                            gsap.set(currentNodes, {
                                x: 0,
                                y: 0,
                                scale: 1,
                                autoAlpha: 1,
                                clearProps: 'x,y,scale,autoAlpha',
                            });
                            setPrevIndex(activeIndexRef.current);
                            activeIndexRef.current = nextIndex;
                            setActiveIndex(nextIndex);
                            gsap.set(proxy, { x: 0 });
                        },
                    });

                    return;
                }

                resetDraggedImages();
                gsap.set(proxy, { x: 0 });
                queueAutoplay();
            },
        })[0];

        return () => {
            dragger.kill();
        };
    }, [activeIndex]);

    const currentItem = SLIDE_ITEMS[activeIndex];
    const prevItem = prevIndex !== null ? SLIDE_ITEMS[prevIndex] : null;
    const currentNum = String(activeIndex + 1).padStart(2, '0');
    const totalNum = String(SLIDE_ITEMS.length).padStart(2, '0');

    return (
        <section className="best-gift" ref={sectionRef}>
            <div className="best-gift__inner">
                <div className="best-gift__left">
                    <div
                        className="best-gift__pagination"
                        aria-label={`Slide ${currentNum} of ${totalNum}`}
                    >
                        <div className="best-gift__counter" aria-hidden="true">
                            <span className="best-gift__current">
                                <span className="best-gift__count-wrapper" ref={countTrackRef}>
                                    {SLIDE_ITEMS.map((_, index) => (
                                        <span className="best-gift__count montage-48" key={`count-${index}`}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    ))}
                                </span>
                            </span>
                            <span className="best-gift__slash montage-24">/</span>
                            <span className="best-gift__total montage-24">{totalNum}</span>
                        </div>
                        <div className="best-gift__progress" aria-hidden="true">
                            <span className="best-gift__progress-fill" ref={progressRef} />
                        </div>
                    </div>

                    <div className="best-gift__img-small">
                        {prevItem && prevIndex !== activeIndex && (
                            <img
                                key={`left-prev-${prevItem.nameEng}`}
                                ref={setImageRef('leftPrev')}
                                src={prevItem.images.left}
                                alt={`${prevItem.nameEng} left visual`}
                                className="best-gift__image-layer is-previous"
                            />
                        )}
                        <img
                            key={`left-current-${currentItem.nameEng}`}
                            ref={setImageRef('leftCurrent')}
                            src={currentItem.images.left}
                            alt={`${currentItem.nameEng} left visual`}
                            className="best-gift__image-layer is-current"
                        />
                    </div>
                </div>

                <div className="best-gift__center">
                    <div className="best-gift__img-arch">
                        {prevItem && prevIndex !== activeIndex && (
                            <img
                                key={`main-prev-${prevItem.nameEng}`}
                                ref={setImageRef('mainPrev')}
                                src={prevItem.images.main}
                                alt={`${prevItem.nameEng} main visual`}
                                className="best-gift__image-layer is-previous"
                            />
                        )}
                        <img
                            key={`main-current-${currentItem.nameEng}`}
                            ref={setImageRef('mainCurrent')}
                            src={currentItem.images.main}
                            alt={`${currentItem.nameEng} main visual`}
                            className="best-gift__image-layer is-current"
                        />
                    </div>
                </div>

                <div className="best-gift__right">
                    <div className="best-gift__img-point">
                        {prevItem && prevIndex !== activeIndex && (
                            <img
                                key={`right-prev-${prevItem.nameEng}`}
                                ref={setImageRef('rightPrev')}
                                src={prevItem.images.right}
                                alt={`${prevItem.nameEng} detail visual`}
                                className="best-gift__image-layer is-previous"
                            />
                        )}
                        <img
                            key={`right-current-${currentItem.nameEng}`}
                            ref={setImageRef('rightCurrent')}
                            src={currentItem.images.right}
                            alt={`${currentItem.nameEng} detail visual`}
                            className="best-gift__image-layer is-current"
                        />
                    </div>

                    <div className="best-gift__text-box" key={currentItem.nameEng}>
                        <h2 className="best-gift__title montage-48">Best Gift</h2>

                        <div className="best-gift__info">
                            <h3 className="best-gift__name-eng optima-40">{currentItem.nameEng}</h3>
                            <p className="best-gift__name-kr suit-20-l">{currentItem.nameKr}</p>
                        </div>

                        <p className="best-gift__desc suit-16-r">{currentItem.desc}</p>

                        <div className="best-gift__action">
                            <MoreWhBox to={currentItem.link} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="best-gift__drag-proxy" ref={dragProxyRef} aria-hidden="true" />
        </section>
    );
};

export default BestGiftSection;
