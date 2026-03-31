import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MoreBox from '../../common/button/MoreBox';
import ExclusiveLg from '../../../assets/Exclusive_Lg.png';
import ExclusiveSm from '../../../assets/Exclusive_Sm.png';
import './KoreaExclusiveSection.scss';

gsap.registerPlugin(ScrollTrigger);

// Korea Exclusive 섹션
// 지역성·한정성·차별성을 조용하게 보여주는 섹션
// 레이아웃: 좌측 텍스트 - 중앙 대표 이미지 - 우측 보조 이미지
const KoreaExclusiveSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                sectionRef.current.querySelectorAll(
                    '.korea__text, .korea__img-main, .korea__img-sub'
                ),
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    stagger: 0.12,
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
        <section className="korea" ref={sectionRef}>
            <div className="korea__inner">
                {/* 좌측 텍스트 */}
                <div className="korea__text">
                    <h2 className="korea__title montage-48">Korea Exclusive</h2>
                    <h3 className="korea__subtitle suit-24-r">한국 한정 제품</h3>
                    <p className="korea__desc suit-16-r">
                        한국의 약재 쑥과 흑임자를 담은
                        <br />
                        이솝 코리아만의 특별한 제품을
                        <br />
                        한정 보자기 패키지와 함께 만나보세요.
                    </p>
                    {/* 클릭 시 해당 제품 상세페이지로 이동하도록 Link 설정 (임시 url) */}
                    <MoreBox to="/benefits/kr-exclusive" />
                </div>

                {/* 중앙 대표 이미지 (522x729) */}
                <div className="korea__img-main">
                    <img src={ExclusiveLg} alt="Korea Exclusive 제품" />
                </div>

                {/* 우측 보조 이미지 (330x330) */}
                <div className="korea__img-sub">
                    <img src={ExclusiveSm} alt="Korea Exclusive 패키징" />
                </div>
            </div>
        </section>
    );
};

export default KoreaExclusiveSection;
