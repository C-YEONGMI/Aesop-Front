import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AboutTeaserVideo from '../../../assets/AboutTeaser.mp4';
import AboutTeaserImg1 from '../../../assets/AboutTeaser_img1.png';
import AboutTeaserImg2 from '../../../assets/AboutTeaser_img2.png';
import AboutTeaserImg3 from '../../../assets/AboutTeaser_img3.png';
import MainAbout from '../../../assets/Main_About.svg?react';
import './AboutTeaserSection.scss';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_SCROLL_DISTANCE = 2200;

const PILLARS = [
    {
        title: 'Vegan & Cruelty-free',
        subtitle: '전 제품 동물성 원료 무첨가 및 동물 실험 금지',
        modifier: 'vegan',
        image: AboutTeaserImg1,
        alt: 'About teaser visual 1',
    },
    {
        title: 'Recycled Materials',
        subtitle: '재활용 소재 사용',
        modifier: 'recycled',
        image: AboutTeaserImg2,
        alt: 'About teaser visual 2',
    },
    {
        title: 'Responsible Sourcing',
        subtitle: '책임감 있는 조달 정책',
        modifier: 'sourcing',
        image: AboutTeaserImg3,
        alt: 'About teaser visual 3',
    },
];

const AboutTeaserSection = () => {
    const sectionRef = useRef(null);
    const innerRef = useRef(null);
    const videoBoxRef = useRef(null);
    const videoRef = useRef(null);
    const hasPlaybackStartedRef = useRef(false);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const mm = gsap.matchMedia();
        const ctx = gsap.context(() => {
            const pillarNodes = gsap.utils.toArray('.about-teaser__pillar');
            const videoEl = videoRef.current;

            const playVideo = () => {
                if (!videoEl) return;

                if (videoEl.ended || (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.05)) {
                    videoEl.currentTime = 0;
                }

                const playPromise = videoEl.play();
                if (playPromise?.catch) {
                    playPromise.catch(() => {});
                }
            };

            const resetVideo = () => {
                if (!videoEl) return;

                videoEl.pause();
                videoEl.currentTime = 0;
                hasPlaybackStartedRef.current = false;
            };

            mm.add('(min-width: 1024px)', () => {
                gsap.set(videoBoxRef.current, {
                    xPercent: -50,
                    yPercent: -50,
                    width: 850,
                    height: 478,
                    y: 0,
                    borderRadius: 0,
                    transformOrigin: 'center center',
                });

                gsap.set(videoRef.current, {
                    scale: 1,
                    filter: 'brightness(1)',
                    transformOrigin: 'center center',
                });

                if (videoEl) {
                    videoEl.pause();
                    videoEl.currentTime = 0;
                }

                gsap.set(overlayRef.current, {
                    opacity: 0,
                    clipPath: 'inset(100% 0 0 0)',
                });

                gsap.set(contentRef.current, {
                    opacity: 0,
                    y: 36,
                });

                gsap.set(pillarNodes, {
                    opacity: 0,
                    y: 32,
                });

                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: `+=${ABOUT_SCROLL_DISTANCE}`,
                        scrub: 1,
                        pin: innerRef.current,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            if (self.progress > 0.02 && !hasPlaybackStartedRef.current) {
                                hasPlaybackStartedRef.current = true;
                                playVideo();
                            }
                        },
                        onLeaveBack: () => {
                            resetVideo();
                        },
                    },
                });

                timeline
                    .to(videoBoxRef.current, {
                        width: () => window.innerWidth,
                        height: () => window.innerHeight,
                        ease: 'none',
                        duration: 1,
                    })
                    .to(
                        overlayRef.current,
                        {
                            opacity: 0.92,
                            clipPath: 'inset(0% 0 0 0)',
                            ease: 'none',
                            duration: 0.4,
                        },
                        0.52
                    )
                    .to(
                        contentRef.current,
                        {
                            opacity: 1,
                            y: 0,
                            ease: 'power2.out',
                            duration: 0.38,
                        },
                        0.84
                    )
                    .to(
                        pillarNodes,
                        {
                            opacity: 1,
                            y: 0,
                            stagger: 0.08,
                            ease: 'power2.out',
                            duration: 0.28,
                        },
                        0.94
                    );

                return () => {
                    timeline.kill();
                };
            });

            mm.add('(max-width: 1023px)', () => {
                gsap.set(videoBoxRef.current, {
                    clearProps: 'all',
                    scale: 0.92,
                    borderRadius: 28,
                    transformOrigin: 'center center',
                });

                gsap.set(videoRef.current, {
                    clearProps: 'all',
                    scale: 1.02,
                    transformOrigin: 'center center',
                });

                gsap.set(overlayRef.current, {
                    opacity: 0.14,
                    clipPath: 'inset(0% 0 0 0)',
                });

                gsap.set(contentRef.current, {
                    opacity: 0,
                    y: 28,
                });

                gsap.set(pillarNodes, {
                    opacity: 0,
                    y: 24,
                });

                const playTrigger = ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: 'top 85%',
                    end: 'bottom top',
                    onEnter: playVideo,
                    onEnterBack: playVideo,
                    onLeaveBack: resetVideo,
                });

                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 82%',
                        end: 'bottom 45%',
                        scrub: 0.7,
                    },
                });

                timeline
                    .to(
                        videoBoxRef.current,
                        {
                            scale: 1,
                            borderRadius: 0,
                            ease: 'none',
                            duration: 0.46,
                        },
                        0
                    )
                    .to(
                        overlayRef.current,
                        {
                            opacity: 0.88,
                            ease: 'none',
                            duration: 0.46,
                        },
                        0.04
                    )
                    .to(
                        contentRef.current,
                        {
                            opacity: 1,
                            y: 0,
                            ease: 'power2.out',
                            duration: 0.2,
                        },
                        0.16
                    )
                    .to(
                        pillarNodes,
                        {
                            opacity: 1,
                            y: 0,
                            stagger: 0.08,
                            ease: 'power2.out',
                            duration: 0.18,
                        },
                        0.22
                    );

                return () => {
                    playTrigger.kill();
                    timeline.kill();
                };
            });
        }, sectionRef);

        return () => {
            ctx.revert();
            mm.revert();
        };
    }, []);

    return (
        <section
            className="about-teaser"
            ref={sectionRef}
            style={{ '--about-scroll-distance': `${ABOUT_SCROLL_DISTANCE}px` }}
        >
            <div className="about-teaser__inner" ref={innerRef}>
                <div className="about-teaser__logo" aria-hidden="true">
                    <MainAbout />
                </div>

                <div className="about-teaser__video-box" ref={videoBoxRef}>
                    <video
                        src={AboutTeaserVideo}
                        ref={videoRef}
                        className="about-teaser__video"
                        muted
                        playsInline
                        preload="metadata"
                    />

                    <div className="about-teaser__overlay" ref={overlayRef} aria-hidden="true" />

                    <div className="about-teaser__content" ref={contentRef}>
                        <div className="about-teaser__content-inner">
                            <h2 className="about-teaser__headline optima-70">
                                An Aesthetic of Responsibility
                            </h2>
                            <span className="about-teaser__divider" aria-hidden="true" />
                            <p className="about-teaser__body suit-20-l">
                                전 제품은 비건 인증(PETA)을 받았으며, 책임 있는 원료 조달을 바탕으로 생명을 존중하는 태도를 실천합니다.
                                <br />
                                또한 PCR과 알루미늄을 포함한 97% 이상의 재활용 소재를 활용해,
                                <br />
                                기능적이면서도 절제된 디자인 안에서 탄소 저감과 환경 보호의 가치를 담아냅니다.
                            </p>

                            <div className="about-teaser__pillars">
                                {PILLARS.map((pillar) => (
                                    <article
                                        key={pillar.title}
                                        className={`about-teaser__pillar about-teaser__pillar--${pillar.modifier}`}
                                    >
                                        <div className="about-teaser__pillar-visual">
                                            <img
                                                src={pillar.image}
                                                alt={pillar.alt}
                                                className="about-teaser__pillar-image"
                                            />
                                            <span
                                                className="about-teaser__pillar-shade"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <h3 className="about-teaser__pillar-title optima-20">{pillar.title}</h3>
                                        <p className="about-teaser__pillar-subtitle suit-20-l">{pillar.subtitle}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutTeaserSection;
