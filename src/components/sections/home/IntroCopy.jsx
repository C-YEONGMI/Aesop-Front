import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { introCopyContent } from '../../../data/mainPageContent';
import MainStar from '../../../assets/Main_star.svg?react';
import './IntroCopy.scss';

gsap.registerPlugin(ScrollTrigger);

// Intro Copy 섹션: Hero 직후 브랜드 결을 설명하는 짧고 조용한 카피
const IntroCopy = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                sectionRef.current.querySelectorAll('.intro__badge, .intro__main, .intro__sub'),
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                    },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section className="intro" ref={sectionRef}>
            <div className="intro__inner">
                {/* 상단 뱃지: 별 아이콘 + SELECTED FAVOURITES */}
                <div className="intro__badge">
                    <MainStar className="intro__badge-star" aria-hidden="true" />
                    <span className="intro__badge-text montage-18">SELECTED<br />FAVOURITES</span>
                </div>

                {/* 메인 한글 카피 */}
                <p className="intro__main suit-20-m">
                    {introCopyContent.mainCopy.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                    ))}
                </p>

                {/* 서브 영문 카피 */}
                <p className="intro__sub optima-18">
                    {introCopyContent.subCopy.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                    ))}
                </p>
            </div>
        </section>
    );
};

export default IntroCopy;
