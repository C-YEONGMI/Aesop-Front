import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroVideo from '../../../assets/Hero_MP4.mp4';
import HeroAesop from '../../../assets/Hero_Aesop.svg?react';
import HeroRitual from '../../../assets/Hero_Ritual.svg?react';
import HeaderLogo from '../../../assets/GNB_Logo.svg?react';
import './Hero.scss';

gsap.registerPlugin(ScrollTrigger);

const HERO_LOGO_HANDOFF_STORAGE_KEY = 'hero-logo-handoff-complete';

const Hero = () => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const bgRef = useRef(null);
    const overlayRef = useRef(null);
    const heroVideoRef = useRef(null);
    const contentRef = useRef(null);
    const aesopRef = useRef(null);
    const ritualRef = useRef(null);
    const flightRef = useRef(null);
    const flightShellRef = useRef(null);
    const flightAesopRef = useRef(null);
    const flightLogoRef = useRef(null);
    const hasCompletedLogoHandoffRef = useRef(
        typeof window !== 'undefined' &&
            window.sessionStorage.getItem(HERO_LOGO_HANDOFF_STORAGE_KEY) === 'true'
    );
    const collapseDistanceRef = useRef(0);
    const [isHandoffComplete, setIsHandoffComplete] = useState(
        () =>
            typeof window !== 'undefined' &&
            window.sessionStorage.getItem(HERO_LOGO_HANDOFF_STORAGE_KEY) === 'true'
    );

    const pauseHeroVideo = useCallback(() => {
        heroVideoRef.current?.pause();
    }, []);

    const playHeroVideo = useCallback(() => {
        const videoElement = heroVideoRef.current;

        if (!videoElement) {
            return;
        }

        const playPromise = videoElement.play();
        playPromise?.catch(() => {});
    }, []);

    useEffect(() => {
        playHeroVideo();
        return undefined;
    }, [playHeroVideo]);

    useEffect(
        () => () => {
            pauseHeroVideo();
        },
        [pauseHeroVideo]
    );

    useLayoutEffect(() => {
        if (!isHandoffComplete) {
            return undefined;
        }

        const collapseDistance = collapseDistanceRef.current;

        if (collapseDistance > 0) {
            window.scrollTo({
                top: Math.max(window.scrollY - collapseDistance, 0),
                left: 0,
                behavior: 'auto',
            });
        }

        ScrollTrigger.refresh();
        collapseDistanceRef.current = 0;

        return undefined;
    }, [isHandoffComplete]);

    useLayoutEffect(() => {
        const headerElement = document.querySelector('#header');
        const headerLogo = document.querySelector('[data-header-logo]');

        if (hasCompletedLogoHandoffRef.current) {
            if (!headerElement || !headerLogo) {
                return undefined;
            }

            headerElement.setAttribute('data-hero-logo-visible', 'true');
            gsap.set(headerLogo, { clearProps: 'opacity' });
            return () => {
                gsap.set(headerLogo, { clearProps: 'opacity' });
            };
        }

        if (
            !headerElement ||
            !headerLogo ||
            !sectionRef.current ||
            !stageRef.current ||
            !contentRef.current ||
            !aesopRef.current ||
            !ritualRef.current ||
            !flightRef.current ||
            !flightShellRef.current ||
            !flightAesopRef.current ||
            !flightLogoRef.current
        ) {
            return undefined;
        }

        headerElement.removeAttribute('data-hero-logo-visible');

        let metrics = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
        };

        const measureFlightPath = () => {
            const stageRect = stageRef.current.getBoundingClientRect();
            const sourceRect = aesopRef.current.getBoundingClientRect();
            const targetRect = headerLogo.getBoundingClientRect();

            if (
                !sourceRect.width ||
                !sourceRect.height ||
                !targetRect.width ||
                !targetRect.height
            ) {
                return;
            }

            metrics = {
                top: sourceRect.top - stageRect.top,
                left: sourceRect.left - stageRect.left,
                width: sourceRect.width,
                height: sourceRect.height,
                x: targetRect.left - sourceRect.left,
                y: targetRect.top - sourceRect.top,
                scaleX: targetRect.width / sourceRect.width,
                scaleY: targetRect.height / sourceRect.height,
            };

            gsap.set(flightRef.current, {
                top: metrics.top,
                left: metrics.left,
                width: metrics.width,
                height: metrics.height,
            });
        };

        const ctx = gsap.context(() => {
            const holdState = { value: 0 };
            let heroFlightTimeline;

            measureFlightPath();

            gsap.set(headerLogo, { opacity: 0 });
            gsap.set(flightRef.current, {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 0,
                transformOrigin: 'top left',
                force3D: true,
            });
            gsap.set(flightShellRef.current, {
                borderRadius: 0,
                overflow: 'hidden',
            });
            gsap.set(flightAesopRef.current, {
                scale: 1,
                xPercent: 0,
                transformOrigin: 'center center',
                force3D: true,
            });
            gsap.set(flightLogoRef.current, {
                autoAlpha: 0,
                clipPath: 'inset(30% 46% 30% 46% round 999px)',
                scale: 0.92,
                xPercent: 2.5,
                transformOrigin: 'center center',
                force3D: true,
            });

            gsap.fromTo(
                contentRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1.1, ease: 'power2.out', delay: 0.35 }
            );

            const finalizeLogoHandoff = () => {
                if (hasCompletedLogoHandoffRef.current) {
                    return;
                }

                hasCompletedLogoHandoffRef.current = true;
                window.sessionStorage.setItem(HERO_LOGO_HANDOFF_STORAGE_KEY, 'true');
                window.dispatchEvent(new Event('hero-logo-handoff-complete'));
                collapseDistanceRef.current = Math.max(
                    sectionRef.current.offsetHeight - stageRef.current.offsetHeight,
                    0
                );
                heroFlightTimeline?.scrollTrigger?.kill();
                heroFlightTimeline?.kill();

                headerElement.setAttribute('data-hero-logo-visible', 'true');
                gsap.set(headerLogo, { clearProps: 'opacity' });
                gsap.set(aesopRef.current, { autoAlpha: 0 });
                gsap.set(ritualRef.current, { autoAlpha: 0 });
                gsap.set(flightRef.current, {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 0,
                });
                gsap.set(flightShellRef.current, { clearProps: 'borderRadius' });
                gsap.set(flightAesopRef.current, {
                    clearProps: 'scale,xPercent',
                });
                gsap.set(flightLogoRef.current, {
                    autoAlpha: 0,
                    clipPath: 'inset(30% 46% 30% 46% round 999px)',
                    scale: 0.92,
                    xPercent: 2.5,
                });
                setIsHandoffComplete(true);
            };

            heroFlightTimeline = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                    invalidateOnRefresh: true,
                    onRefreshInit: measureFlightPath,
                    onRefresh: measureFlightPath,
                    onLeave: finalizeLogoHandoff,
                },
            })
                .set(aesopRef.current, { opacity: 0 }, 0)
                .set(flightRef.current, { opacity: 1 }, 0)
                .to(
                    flightRef.current,
                    {
                        x: () => metrics.x,
                        y: () => metrics.y,
                        scaleX: () => metrics.scaleX,
                        scaleY: () => metrics.scaleY,
                        duration: 9.6,
                        ease: 'none',
                        force3D: true,
                    },
                    0.06
                )
                .to(
                    ritualRef.current,
                    {
                        opacity: 0,
                        duration: 9.86,
                        ease: 'none',
                    },
                    0.06
                )
                .to(
                    flightShellRef.current,
                    {
                        borderRadius: 999,
                        duration: 0.52,
                        ease: 'power2.inOut',
                    },
                    9.02
                )
                .to(
                    flightAesopRef.current,
                    {
                        scale: 0.985,
                        xPercent: -0.8,
                        duration: 0.46,
                        ease: 'power2.inOut',
                    },
                    9.04
                )
                .set(flightLogoRef.current, { autoAlpha: 1 }, 9.58)
                .to(
                    flightLogoRef.current,
                    {
                        clipPath: 'inset(0% 0% 0% 0% round 999px)',
                        scale: 1,
                        xPercent: 0,
                        duration: 0.16,
                        ease: 'power2.inOut',
                    },
                    9.58
                )
                .set(headerLogo, { opacity: 1 }, 9.74)
                .set(flightRef.current, { opacity: 0 }, 9.74)
                .to(holdState, { value: 1, duration: 1.4 }, 10.24);
        }, sectionRef);

        return () => {
            if (!hasCompletedLogoHandoffRef.current) {
                headerElement.removeAttribute('data-hero-logo-visible');
            }
            gsap.set(headerLogo, { clearProps: 'opacity' });
            ctx.revert();
        };
    }, []);

    return (
        <section
            className={`hero${isHandoffComplete ? ' hero--handoff-complete' : ''}`}
            ref={sectionRef}
        >
            <div className="hero__stage" ref={stageRef}>
                <div className="hero__bg" ref={bgRef}>
                    <video ref={heroVideoRef} muted loop playsInline preload="metadata" className="hero__video">
                        <source src={heroVideo} type="video/mp4" />
                    </video>
                    <div className="hero__overlay" ref={overlayRef} />
                </div>

                {!isHandoffComplete && (
                    <>
                        <div className="hero__content" ref={contentRef}>
                            <div className="hero__wordmark">
                                <span className="hero__wordmark-aesop" ref={aesopRef}>
                                    <HeroAesop aria-label="Aesop" />
                                </span>
                                <span className="hero__wordmark-ritual" ref={ritualRef}>
                                    <HeroRitual aria-label="Ritual" />
                                </span>
                            </div>
                        </div>

                        <div className="hero__wordmark-flight" ref={flightRef} aria-hidden="true">
                            <div className="hero__wordmark-flight-shell" ref={flightShellRef}>
                                <span className="hero__wordmark-flight-mark" ref={flightAesopRef}>
                                    <HeroAesop />
                                </span>
                                <span className="hero__wordmark-flight-mark hero__wordmark-flight-mark--logo" ref={flightLogoRef}>
                                    <HeaderLogo />
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Hero;
