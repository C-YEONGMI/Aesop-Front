import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { TextEffect } from '../../components/ui/TextEffect';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './OurStory.scss';

import aboutBg from '../../assets/about_background.mov';
import aboutFormulation from '../../assets/about_formulation.png';
import aboutTexture from '../../assets/about_texture.png';
import aboutSustain from '../../assets/about_sustain.png';
import OriginsLineSvg      from '../../assets/about_origins_line.svg?react';
import NamingLineSvg       from '../../assets/about_naming_line.svg?react';
import FormulationLineSvg  from '../../assets/about_formulation_line.svg?react';
import ArchitectureLineSvg from '../../assets/about_architecture_line.svg?react';
import ApproachLineSvg     from '../../assets/about_approach_line.svg?react';
import shop01 from '../../assets/about_shop01.png';
import shop02 from '../../assets/about_shop02.png';
import shop03 from '../../assets/about_shop03.png';
import shop04 from '../../assets/about_shop04.png';
import shop05 from '../../assets/about_shop05.png';
import shop06 from '../../assets/about_shop06.png';
import shop07 from '../../assets/about_shop07.png';
import shop08 from '../../assets/about_shop08.png';
import shop09 from '../../assets/about_shop09.png';
import shop10 from '../../assets/about_shop10.png';
import shop11 from '../../assets/about_shop11.png';
import shop12 from '../../assets/about_shop12.png';
import shop13 from '../../assets/about_shop13.png';

gsap.registerPlugin(ScrollTrigger);

const SLIDES = [
    {
        subtitle: 'thoughtful formulations',
        desc: '이솝은 멜버른 연구소에서 화학자들이 식물 유래 성분과 검증된 합성 성분을 결합해 포뮬러를 설계하는\n하이브리드 접근을 취합니다. 피부에 실제로 필요한 효능과 안전성을 기준으로 충분한 연구·테스트를 거친\n제품만을 출시하며, 항산화와 보호에 초점을 둔 치밀한 포뮬러로 장기적인 피부 균형을 추구합니다.',
        overlayColor: 'rgba(192, 182, 169, 0.20)',
    },
    {
        subtitle: 'quiet sensory rituals',
        desc: '이솝은 스킨·바디·헤어 케어를 단순한 관리가 아닌, 하루를 정돈하는 차분한 리추얼로 바라봅니다.\n허브·시트러스·우디 노트의 향과 질감, 사용 순서가 어우러져 과장되지 않은 감각 경험을 만들고,\n"즉각적인 기적"보다 꾸준한 루틴과 축적된 변화를 중시합니다.',
        overlayColor: 'rgba(230, 149, 121, 0.20)',
    },
    {
        subtitle: 'local character spaces',
        desc: '이솝 매장은 어디서나 같은 인테리어를 반복하지 않습니다. 각 도시와 동네의 맥락과 기존 건축 요소를\n존중해 설계됩니다. 현지 건축가·디자이너와 협업해 지역적 이야기와 브랜드 세계관이 자연스럽게\n섞인 공간을 만들며, 갈색 보틀과 절제된 디테일로 이솝만의 경험을 구현합니다.',
        overlayColor: 'rgba(163, 177, 138, 0.20)',
    },
];

const ORIGINS_TABS = [
    {
        id: 'origins',
        label: 'Origins',
        en: 'Founded in a Melbourne hair salon in 1987, the brand began with formulations based on essential oils.',
        kr: '이솝은 1987년 멜버른의 한 살롱에서 시작되었습니다.\n에센셜 오일을 바탕으로 한 조합이 브랜드의 출발점이 되었습니다.',
    },
    {
        id: 'naming',
        label: 'Naming',
        en: 'The name Aesop is drawn from the ancient storyteller associated with fables, reflecting a restrained stance against exaggerated beauty claims.',
        kr: '브랜드명은 이솝 우화로 알려진 이야기꾼 \'Aesop\'에서 가져왔습니다.\n과장된 미용 광고에 대한 절제된 태도를 상징합니다.',
    },
    {
        id: 'formulation',
        label: 'Formulation',
        en: 'Formulations are developed in-house by chemists, informed by new technologies and established science.\nPlant-derived ingredients are balanced with scientifically developed components, with a focus on protecting and restoring the skin.',
        kr: '자체 실험실에서 화학자들이 새로운 기술과 검증된 과학을 바탕으로 만듭니다.\n식물 유래 성분과 과학적 성분을 균형 있게 조합해, 피부의 보호와 회복에 초점을 둡니다.',
        enSmall: true,
    },
    {
        id: 'architecture',
        label: 'Architecture',
        en: 'The first store in St Kilda was realised through the reinterpretation of an existing space.\nSince then, architecture and spatial design have become integral to the brand.',
        kr: '세인트 킬다의 첫 스토어는 기존 공간을 재해석하는 방식으로 만들어졌습니다.\n이후 건축과 공간 디자인은 브랜드를 구성하는 중요한 축이 되었습니다.',
    },
    {
        id: 'approach',
        label: 'Approach',
        en: 'Expanding beyond skin, hair, and body care into fragrance and space, the brand favours considered growth over rapid expansion, maintaining consistency and balance.',
        kr: '스킨, 헤어, 바디 케어를 넘어 향과 공간으로 확장하고 있습니다.\n빠른 확장보다 브랜드의 일관성과 균형을 유지하는 방식을 택합니다.',
    },
];

const ARCH_CARDS = [
    { img: shop01, title: 'Aesop Samcheong',        location: 'Seoul, Korea',           desc: '한국의 미를 살린 삼청동 매장' },
    { img: shop02, title: 'Aesop Garosu-gil',        location: 'Seoul, Korea',           desc: '가로수길의 도시적 감각을 담은 공간' },
    { img: shop03, title: 'Aesop Insadong',          location: 'Seoul, Korea',           desc: '전통과 현대가 교차하는 인사동 매장' },
    { img: shop04, title: 'Aesop Tokyo Aoyama',      location: 'Tokyo, Japan',           desc: '일본 현대 건축의 정수를 담은 공간' },
    { img: shop05, title: 'Aesop Paris Marais',      location: 'Paris, France',          desc: '파리의 역사와 현대가 교차하는 매장' },
    { img: shop06, title: 'Aesop Melbourne CBD',     location: 'Melbourne, Australia',   desc: '이솝 발상지의 독창적 공간' },
    { img: shop07, title: 'Aesop New York SoHo',     location: 'New York, USA',          desc: '뉴욕의 예술적 감성을 반영한 매장' },
    { img: shop08, title: 'Aesop London Mayfair',    location: 'London, UK',             desc: '런던의 전통과 현대가 어우러진 공간' },
    { img: shop09, title: 'Aesop Amsterdam Jordaan', location: 'Amsterdam, Netherlands', desc: '운하 도시의 우아한 감성을 담다' },
    { img: shop10, title: 'Aesop Berlin Mitte',      location: 'Berlin, Germany',        desc: '베를린의 산업적 미학을 재해석한 공간' },
    { img: shop11, title: 'Aesop Singapore ION',     location: 'Singapore',              desc: '열대 도시의 정원 속 이솝' },
    { img: shop12, title: 'Aesop Hong Kong Central', location: 'Hong Kong',              desc: '홍콩의 역동적 에너지를 담은 매장' },
    { img: shop13, title: 'Aesop Sydney CBD',        location: 'Sydney, Australia',      desc: '시드니 항구의 자연을 담은 공간' },
];

// ── Architecture 원형 호 상수 (반응형) ──────────────────────────────────────
// 레퍼런스 컴포넌트 방식: x, y, rotation 세 값 모두 원의 각도(cardAngle)에서 삼각함수로 계산
// → 카드들이 진짜 큰 원의 호 위에 놓이고, 스크롤 시 호 전체가 회전하며 지나가는 효과
const getArchConstants = () => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
    if (vw <= 768) {
        return { cardW: 102, cardH: 68, arcR: 570, apexY: 155, maxScroll: 2500, arcGap: 20 };
    }
    if (vw <= 1024) {
        return { cardW: 180, cardH: 120, arcR: 1000, apexY: 480, maxScroll: 3000, arcGap: 40 };
    }
    return { cardW: 300, cardH: 200, arcR: 1700, apexY: 540, maxScroll: 3500, arcGap: 80 };
};

const ARCH_DEFAULTS = getArchConstants();
const CARD_W    = ARCH_DEFAULTS.cardW;
const CARD_H    = ARCH_DEFAULTS.cardH;
const ARC_R     = ARCH_DEFAULTS.arcR;
// 카드 간 각도 간격: 호 길이(카드폭+gap)를 반지름으로 나눈 라디안 → 도
const DEG_STEP  = ((CARD_W + ARCH_DEFAULTS.arcGap) / ARC_R) * (180 / Math.PI);
// card 0이 scroll=0 시 화면 왼쪽 안쪽에 완전히 보이는 기준 각도
const BASE_ANGLE = -108;
// scroll 전 구간에서 호가 회전하는 총 각도 — 13장 카드 전체를 커버
const SCROLL_ROTATE_DEG = 120;
// arc 꼭짓점(중앙 카드 중심)의 section 상단 기준 Y
const APEX_Y    = ARCH_DEFAULTS.apexY;
// GSAP scrub 거리(px): end: `+=${MAX_SCROLL}` — 스크롤 속도 유지
const MAX_SCROLL = ARCH_DEFAULTS.maxScroll;

// 산개 위치 — section 중앙 근방에 분산 (opacity:0이라 보이지 않음)
const SCATTER_POSITIONS = ARCH_CARDS.map(() => ({
    x: (Math.random() - 0.5) * 1000 + (typeof window !== 'undefined' ? window.innerWidth / 2 : 720) - CARD_W / 2,
    y: (Math.random() - 0.5) * 300 + APEX_Y - CARD_H / 2,
    rotate: (Math.random() - 0.5) * 60,
}));

// ── ArchCard 컴포넌트 (framer-motion 기반 — 진짜 원형 호) ───────────────────
const SPRING_DEFAULT = { type: 'spring', stiffness: 40, damping: 15 };

function ArchCard({ card, index, phase, scrollValue, archConst }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const sp = SCATTER_POSITIONS[index];
    const { cardW, cardH, arcR, apexY: ay, arcGap } = archConst;
    const degStep = ((cardW + arcGap) / arcR) * (180 / Math.PI);

    // 현재 스크롤에 따른 이 카드의 원 위 각도(도)
    const cardAngle = BASE_ANGLE + index * degStep - (scrollValue / archConst.maxScroll) * SCROLL_ROTATE_DEG;
    const rad = cardAngle * Math.PI / 180;

    // 원의 중심: 수평은 뷰포트 중앙, 수직은 arc 꼭짓점 아래로 반지름만큼
    const arcCenterX = (typeof window !== 'undefined' ? window.innerWidth : 1440) / 2;
    const arcCenterY = ay + arcR;

    // 카드 좌상단 좌표 (section top-left 기준)
    const arcX   = arcCenterX + Math.cos(rad) * arcR - cardW / 2;
    const arcY   = arcCenterY + Math.sin(rad) * arcR - cardH / 2;
    // 접선 방향 = 각도 + 90° (원 위에서 카드가 세워지는 방향)
    const arcRot = cardAngle + 90;

    const target = phase === 'scatter'
        ? { x: sp.x,  y: sp.y,  rotate: sp.rotate, opacity: 0, scale: 0.8 }
        : { x: arcX,  y: arcY,  rotate: arcRot,     opacity: 1, scale: 1   };

    return (
        <motion.div
            className="arch-card"
            initial={false}
            animate={target}
            transition={{ default: SPRING_DEFAULT }}
            onClick={() => setIsFlipped((prev) => !prev)}
            style={{ position: 'absolute', width: cardW, height: cardH, top: 0, left: 0, perspective: '1000px' }}
        >
            <motion.div
                className="arch-card__inner"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                whileHover={{ rotateY: 180 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
            >
                <div className="arch-card__front" style={{ backfaceVisibility: 'hidden' }}>
                    <img src={card.img} alt={card.title} />
                </div>
                <div className="arch-card__back" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <span className="arch-card__location">{card.location}</span>
                    <h3 className="arch-card__name">{card.title}</h3>
                    <p className="arch-card__desc">{card.desc}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── 탭 ID → SVG ref 인덱스 매핑 (changeTab에서 공용 사용) ──────────────────
const TAB_IDS = ['origins', 'naming', 'formulation', 'architecture', 'approach'];

// ── 타이틀 텍스트를 글자별 span으로 분해 ──────────────────────────────────
const splitTitle = (el) => {
    if (!el) return [];
    const text = el.textContent;
    el.textContent = '';
    return [...text].map((char) => {
        const wrap = document.createElement('span');
        wrap.className = 'char-wrap';
        const inner = document.createElement('span');
        inner.className = 'char';
        inner.textContent = char === ' ' ? '\u00A0' : char;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        return inner;
    });
};

// ── desc 텍스트를 줄별 span 요소로 분해 ──────────────────────────────────
const setDescLines = (container, text) => {
    container.innerHTML = '';
    return text.split('\n').map((line) => {
        const wrap = document.createElement('div');
        wrap.className = 'desc-line-wrap';
        const span = document.createElement('span');
        span.className = 'desc-line';
        span.textContent = line;
        wrap.appendChild(span);
        container.appendChild(wrap);
        return span;
    });
};

// ── 라인 드로우 헬퍼 ──────────────────────────────────────────────────────
const drawLinePath = (el, duration = 3.3) => {
    if (!el) return;
    const path = el.querySelector('path');
    if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set(el, { autoAlpha: 1 });
        gsap.to(path, { strokeDashoffset: 0, duration, ease: 'power2.inOut' });
    } else {
        gsap.set(el, { autoAlpha: 1 });
    }
};

const OurStory = () => {
    // ── Hero refs ──────────────────────────────────────────────────────────
    const pageRef       = useRef(null);
    const heroRef       = useRef(null);
    const overlayRef    = useRef(null);
    const subtitleRef   = useRef(null);
    const descRef       = useRef(null);

    // ── Story Mid refs ─────────────────────────────────────────────────────
    const storyMidRef       = useRef(null);
    const valuesHeadingRef  = useRef(null);
    const valuesTextsRef    = useRef(null);
    const valuesEnRef       = useRef(null);
    const valuesKrRef       = useRef(null);
    const originsInnerRef   = useRef(null);

    // ── 5개 탭 라인 refs ───────────────────────────────────────────────────
    const originsLineRef      = useRef(null);
    const namingLineRef       = useRef(null);
    const formulationLineRef  = useRef(null);
    const architectureLineRef = useRef(null);
    const approachLineRef     = useRef(null);

    // ── 하단 섹션 타이틀 refs ──────────────────────────────────────────────
    const formTitleRef      = useRef(null);
    const archTitleRef      = useRef(null);
    const sustainTitleRef   = useRef(null);

    // ── Architecture refs & state ──────────────────────────────────────────
    const archStageRef = useRef(null);  // section element (GSAP pin target)
    const [archPhase, setArchPhase]         = useState('scatter');
    const [archScrollValue, setArchScrollValue] = useState(0);
    const archDragRef = useRef({ active: false, startX: 0 }); // 드래그 상태
    const [archConst, setArchConst] = useState(getArchConstants);

    // ── 리사이즈 시 Architecture 상수 업데이트 ─────────────────────────────
    useEffect(() => {
        const handleResize = () => setArchConst(getArchConstants());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Origins tab text state ─────────────────────────────────────────────
    const [tabText, setTabText] = useState({ en: ORIGINS_TABS[0].en, kr: ORIGINS_TABS[0].kr, enSmall: false });
    const [enTrigger, setEnTrigger] = useState(true);
    const [krTrigger, setKrTrigger] = useState(true);
    const tabChangeTimerRef = useRef(null);

    const tabButtonRefs     = useRef([]);
    const activeTabRef      = useRef('origins');

    // ── Architecture 드래그 핸들러 (수평 드래그 → 수직 스크롤 변환) ─────
    const handleArchPointerDown = useCallback((e) => {
        archDragRef.current = { active: true, startX: e.clientX };
        e.currentTarget.setPointerCapture(e.pointerId);
    }, []);
    const handleArchPointerMove = useCallback((e) => {
        if (!archDragRef.current.active) return;
        const dx = archDragRef.current.startX - e.clientX; // 왼쪽 드래그 = 양수 = 스크롤 전진
        archDragRef.current.startX = e.clientX;
        window.scrollBy(0, dx * 1.2); // 수평 드래그를 수직 스크롤로 변환 (1.2배 감도)
    }, []);
    const handleArchPointerUp = useCallback(() => {
        archDragRef.current.active = false;
    }, []);

    // ── 탭 전환 (클릭 · 스크롤 공용) ──────────────────────────────────────
    const changeTab = useCallback((id) => {
        const tab = ORIGINS_TABS.find((t) => t.id === id);
        if (!tab || activeTabRef.current === id) return;

        const prevId = activeTabRef.current;
        activeTabRef.current = id;

        // 탭 ID → ref 매핑
        const LINE_MAP = {
            origins:      originsLineRef,
            naming:       namingLineRef,
            formulation:  formulationLineRef,
            architecture: architectureLineRef,
            approach:     approachLineRef,
        };

        // 이전 라인 페이드 아웃
        const prevEl = LINE_MAP[prevId]?.current;
        if (prevEl) {
            gsap.to(prevEl, { autoAlpha: 0, duration: 0.8, ease: 'power2.in' });
        }

        // 버튼 상태 즉시 업데이트
        tabButtonRefs.current.forEach((btn) => {
            if (btn) btn.classList.toggle('is-active', btn.dataset.id === id);
        });

        // 텍스트 퇴장(EN→KR 순) → 텍스트 교체 → 둘 다 등장 → 라인 드로우 시작
        // EN: t=0 퇴장, KR: t=220ms 퇴장, 교체+등장: t=600ms, 라인: t=750ms
        if (tabChangeTimerRef.current) [].concat(tabChangeTimerRef.current).forEach(clearTimeout);
        // EN 퇴장(t=0) → KR 퇴장(t=250ms) → 새 텍스트 등장(t=750ms) → 라인 드로우(t=900ms)
        const timers = [];
        setEnTrigger(false);
        timers[0] = setTimeout(() => {
            setKrTrigger(false);
        }, 250);
        timers[1] = setTimeout(() => {
            setTabText({ en: tab.en, kr: tab.kr, enSmall: !!tab.enSmall });
            setEnTrigger(true);
            setKrTrigger(true);
        }, 750);
        timers[2] = setTimeout(() => {
            drawLinePath(LINE_MAP[id]?.current, 3.3);
        }, 900);
        tabChangeTimerRef.current = timers;
    }, []);


    useEffect(() => {
        const initLines = setDescLines(descRef.current, SLIDES[0].desc);

        const ctx = gsap.context(() => {
            const formChars    = splitTitle(formTitleRef.current);
            const archChars    = splitTitle(archTitleRef.current);
            const sustainChars = splitTitle(sustainTitleRef.current);
            gsap.set([...formChars, ...archChars, ...sustainChars], { y: '110%' });

            gsap.set(subtitleRef.current, { autoAlpha: 0, y: 28 });
            gsap.set(initLines, { autoAlpha: 0, y: 28 });

            // 5개 라인 모두 초기 숨김
            const allLineEls = [
                originsLineRef, namingLineRef, formulationLineRef,
                architectureLineRef, approachLineRef,
            ].map((r) => r.current).filter(Boolean);
            gsap.set(allLineEls, { autoAlpha: 0 });

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const isMobileStory = window.matchMedia('(max-width: 768px)').matches;
                const hideValuesCopy = () => {
                    gsap.to(valuesTextsRef.current, {
                        autoAlpha: 0,
                        y: -40,
                        duration: 0.25,
                        overwrite: 'auto',
                    });
                };
                const showValuesCopy = () => {
                    gsap.to(valuesTextsRef.current, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.25,
                        overwrite: 'auto',
                    });
                };
                // 페이지 진입 텍스트 fade-in
                gsap.to(subtitleRef.current, {
                    autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3,
                });
                gsap.to(initLines, {
                    autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'power3.out', delay: 0.55,
                });

                // ── Hero 슬라이드 전환 ──────────────────────────────────────
                const changeSlide = (index) => {
                    const slide = SLIDES[index];
                    const existingLines = descRef.current
                        ? [...descRef.current.querySelectorAll('.desc-line')]
                        : [];
                    const tl = gsap.timeline();
                    tl.to(subtitleRef.current, { autoAlpha: 0, y: -28, duration: 0.32, ease: 'power2.in' });
                    if (existingLines.length) {
                        tl.to(existingLines, {
                            autoAlpha: 0, y: -20, duration: 0.22,
                            stagger: { each: 0.045, from: 'start' }, ease: 'power2.in',
                        }, '<');
                    }
                    tl.to(overlayRef.current, {
                        backgroundColor: slide.overlayColor, duration: 0.9, ease: 'power2.inOut',
                    }, 0);
                    tl.call(() => {
                        subtitleRef.current.textContent = slide.subtitle;
                        const newLines = setDescLines(descRef.current, slide.desc);
                        gsap.set(newLines, { autoAlpha: 0, y: 30 });
                        gsap.fromTo(subtitleRef.current,
                            { autoAlpha: 0, y: 30 },
                            { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out' }
                        );
                        gsap.to(newLines, {
                            autoAlpha: 1, y: 0, duration: 0.52,
                            stagger: { each: 0.12, from: 'start' }, ease: 'power3.out', delay: 0.18,
                        });
                    });
                };

                ScrollTrigger.create({
                    trigger: heroRef.current, start: '28.57% top',
                    onEnter: () => changeSlide(1), onLeaveBack: () => changeSlide(0),
                });
                ScrollTrigger.create({
                    trigger: heroRef.current, start: '57.14% top',
                    onEnter: () => changeSlide(2), onLeaveBack: () => changeSlide(1),
                });

                // ── Story Mid ───────────────────────────────────────────────
                gsap.set(valuesHeadingRef.current, { xPercent: -50, yPercent: -50 });

                gsap.from(valuesHeadingRef.current, {
                    autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out',
                    immediateRender: false,
                    scrollTrigger: { trigger: storyMidRef.current, start: 'top 65%' },
                });
                gsap.from(valuesTextsRef.current, {
                    autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out',
                    immediateRender: false,
                    scrollTrigger: { trigger: storyMidRef.current, start: 'top 65%' },
                });

                gsap.to(valuesTextsRef.current, {
                    autoAlpha: 0, y: -20, ease: 'none',
                    scrollTrigger: {
                        trigger: storyMidRef.current,
                        // 900vh 기준: 50vh(5.6%)→100vh(11.1%) 구간 scrub
                        start: '5.6% top', end: '11.1% top', scrub: true,
                    },
                });

                gsap.to(valuesHeadingRef.current, {
                    y: () => 70 + valuesHeadingRef.current.offsetHeight * 0.3 - window.innerHeight / 2,
                    yPercent: 0, scale: 0.6, ease: 'none',
                    scrollTrigger: {
                        trigger: storyMidRef.current,
                        // 900vh 기준: 100vh(11.1%)→175vh(19.4%) 구간 scrub
                        start: '11.1% top', end: '19.4% top',
                        scrub: true, invalidateOnRefresh: true,
                    },
                });

                gsap.fromTo(originsInnerRef.current,
                    { yPercent: 100 },
                    {
                        yPercent: 0, ease: 'none',
                        scrollTrigger: {
                            trigger: storyMidRef.current,
                            // 900vh 기준: 175vh(19.4%)→225vh(25%) 구간 scrub
                            start: '19.4% top', end: '25% top', scrub: 1,
                        },
                    }
                );

                // Origins 라인 초기 드로우 (26% ≈ 234vh 진입 시)
                ScrollTrigger.create({
                    trigger: storyMidRef.current,
                    start: '26% top',
                    once: true,
                    onEnter: () => drawLinePath(originsLineRef.current, 3.3),
                });

                if (isMobileStory) {
                    ScrollTrigger.create({
                        trigger: storyMidRef.current,
                        start: '16% top',
                        end: '100% top',
                        onEnter: hideValuesCopy,
                        onEnterBack: hideValuesCopy,
                        onLeaveBack: showValuesCopy,
                    });
                }

                // 탭 스크롤 전환 (900vh 기준)
                // Naming:39%(351vh), Formulation:52%(468vh), Architecture:65%(585vh), Approach:78%(702vh)
                // Approach 이후 198vh 여유 ✓
                const STORY_TAB_PCT = [0, 39, 52, 65, 78];
                ORIGINS_TABS.forEach((tab, i) => {
                    if (i === 0) return;
                    ScrollTrigger.create({
                        trigger: storyMidRef.current,
                        start: STORY_TAB_PCT[i] + '% top',
                        onEnter:     () => changeTab(tab.id),
                        onLeaveBack: () => changeTab(ORIGINS_TABS[i - 1].id),
                    });
                });

                // ── 하단 섹션 타이틀 char split ─────────────────────────────
                gsap.fromTo(formChars,
                    { y: '110%' },
                    { y: 0, duration: 1.1, stagger: 0.03, ease: 'power3.out',
                      scrollTrigger: { trigger: '.about-formulation', start: 'top 65%' } }
                );
                gsap.fromTo(archChars,
                    { y: '110%' },
                    { y: 0, duration: 1.1, stagger: 0.03, ease: 'power3.out',
                      scrollTrigger: { trigger: '.about-architecture', start: 'top 65%' } }
                );
                gsap.fromTo(sustainChars,
                    { y: '110%' },
                    { y: 0, duration: 1.1, stagger: 0.03, ease: 'power3.out',
                      scrollTrigger: { trigger: '.about-sustainability', start: 'top 65%' } }
                );

                // ── 하단 섹션 콘텐츠 reveals ────────────────────────────────
                gsap.from('.about-formulation__content', {
                    autoAlpha: 0, y: 50, duration: 1, ease: 'power3.out',
                    scrollTrigger: { trigger: '.about-formulation__content', start: 'top 75%' },
                });

                // Texture: 크림이 왼쪽→오른쪽으로 발리듯 clip-path reveal
                const texEl = document.querySelector('.about-formulation__texture');
                if (texEl) {
                    gsap.set(texEl, { clipPath: 'inset(0 100% 0 0)' });
                    gsap.to(texEl, {
                        clipPath: 'inset(0 0% 0 0)',
                        duration: 1.6,
                        ease: 'power2.inOut',
                        scrollTrigger: { trigger: '.about-formulation__content', start: 'top 70%' },
                    });
                }
                // ── Architecture: framer-motion 카드 + GSAP pin/scroll ────
                const archSection = archStageRef.current;
                if (archSection) {
                    // 섹션이 뷰에 들어오면 scatter → arc 전환
                    ScrollTrigger.create({
                        trigger: archSection,
                        start: 'top 80%',
                        once: true,
                        onEnter: () => setArchPhase('arc'),
                    });

                    // 섹션 핀 + 스크롤 progress → framer-motion scrollValue 동기화
                    const curMaxScroll = getArchConstants().maxScroll;
                    gsap.to({}, {
                        scrollTrigger: {
                            trigger: archSection,
                            pin: true,
                            scrub: 1,
                            start: 'top top',
                            end: `+=${curMaxScroll}`,
                            onUpdate: (self) => setArchScrollValue(self.progress * curMaxScroll),
                            invalidateOnRefresh: true,
                        },
                    });
                }
                // ── Sustainability: 이미지 클리핑 reveal + 줌인 ──────────
                const sustainImg = document.querySelector('.about-sustainability__image');
                if (sustainImg) {
                    gsap.set(sustainImg, { clipPath: 'inset(100% 0 0 0)' });
                    gsap.set(sustainImg.querySelector('img'), { scale: 1.15 });
                    const sustainImgTl = gsap.timeline({
                        scrollTrigger: { trigger: sustainImg, start: 'top 75%' },
                    });
                    sustainImgTl.to(sustainImg, {
                        clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.inOut',
                    });
                    sustainImgTl.to(sustainImg.querySelector('img'), {
                        scale: 1, duration: 1.4, ease: 'power2.out',
                    }, '<0.15');
                }

                // ── Sustainability: desc 줄별 stagger reveal ─────────
                const sustainDesc = document.querySelector('.about-sustainability__desc');
                if (sustainDesc) {
                    const descLines = setDescLines(sustainDesc,
                        '불필요한 패키징을 줄이고, 재사용과 재활용이 가능한 소재를 우선합니다.\n'
                        + '제품 전반에 걸쳐 지속 가능한 설계와 재료 선택을 고려합니다.\n'
                        + '과도한 장식을 지양하며, 필요한 만큼만 사용하는 태도를 유지합니다.'
                    );
                    gsap.set(descLines, { autoAlpha: 0, y: 24 });
                    gsap.to(descLines, {
                        autoAlpha: 1, y: 0, duration: 0.65,
                        stagger: 0.15, ease: 'power3.out',
                        scrollTrigger: { trigger: sustainDesc, start: 'top 85%' },
                    });
                }
            });

            // ── reduced-motion fallback ────────────────────────────────────
            mm.add('(prefers-reduced-motion: reduce)', () => {
                const isMobileStory = window.matchMedia('(max-width: 768px)').matches;
                gsap.set([...formChars, ...archChars, ...sustainChars], { y: 0 });
                gsap.set(subtitleRef.current, { autoAlpha: 1, y: 0 });
                gsap.set(initLines, { autoAlpha: 1, y: 0 });
                gsap.set(originsInnerRef.current, { autoAlpha: 1 });
                // Origins 라인 즉시 표시
                gsap.set(originsLineRef.current, { autoAlpha: 1 });

                const updateSlide = (index) => {
                    const slide = SLIDES[index];
                    subtitleRef.current.textContent = slide.subtitle;
                    const lines = setDescLines(descRef.current, slide.desc);
                    gsap.set(lines, { autoAlpha: 1, y: 0 });
                    gsap.set(overlayRef.current, { backgroundColor: slide.overlayColor });
                };

                ScrollTrigger.create({
                    trigger: heroRef.current, start: '28.57% top',
                    onEnter: () => updateSlide(1), onLeaveBack: () => updateSlide(0),
                });
                ScrollTrigger.create({
                    trigger: heroRef.current, start: '57.14% top',
                    onEnter: () => updateSlide(2), onLeaveBack: () => updateSlide(1),
                });

                if (isMobileStory) {
                    ScrollTrigger.create({
                        trigger: storyMidRef.current,
                        start: '16% top',
                        end: '100% top',
                        onEnter: () => gsap.set(valuesTextsRef.current, { autoAlpha: 0, y: -40 }),
                        onEnterBack: () => gsap.set(valuesTextsRef.current, { autoAlpha: 0, y: -40 }),
                        onLeaveBack: () => gsap.set(valuesTextsRef.current, { autoAlpha: 1, y: 0 }),
                    });
                }

                const LINE_MAP_RM = {
                    origins:      originsLineRef,
                    naming:       namingLineRef,
                    formulation:  formulationLineRef,
                    architecture: architectureLineRef,
                    approach:     approachLineRef,
                };

                const STORY_TAB_PCT_RM = [0, 39, 52, 65, 78];
                ORIGINS_TABS.forEach((tab, i) => {
                    if (i === 0) return;
                    const prevTab = ORIGINS_TABS[i - 1];
                    ScrollTrigger.create({
                        trigger: storyMidRef.current,
                        start: STORY_TAB_PCT_RM[i] + '% top',
                        onEnter: () => {
                            activeTabRef.current = tab.id;
                            gsap.set(LINE_MAP_RM[prevTab.id].current, { autoAlpha: 0 });
                            gsap.set(LINE_MAP_RM[tab.id].current, { autoAlpha: 1 });
                            setTabText({ en: tab.en, kr: tab.kr, enSmall: !!tab.enSmall });
                            tabButtonRefs.current.forEach((btn) => {
                                if (btn) btn.classList.toggle('is-active', btn.dataset.id === tab.id);
                            });
                        },
                        onLeaveBack: () => {
                            activeTabRef.current = prevTab.id;
                            gsap.set(LINE_MAP_RM[tab.id].current, { autoAlpha: 0 });
                            gsap.set(LINE_MAP_RM[prevTab.id].current, { autoAlpha: 1 });
                            setTabText({ en: prevTab.en, kr: prevTab.kr, enSmall: !!prevTab.enSmall });
                            tabButtonRefs.current.forEach((btn) => {
                                if (btn) btn.classList.toggle('is-active', btn.dataset.id === prevTab.id);
                            });
                        },
                    });
                });

                // Sustainability (reduced-motion: 즉시 표시)
                const sustainImgRM = document.querySelector('.about-sustainability__image');
                if (sustainImgRM) {
                    gsap.set(sustainImgRM, { clipPath: 'inset(0% 0 0 0)' });
                }
                const sustainDescRM = document.querySelector('.about-sustainability__desc');
                if (sustainDescRM) {
                    const rmLines = setDescLines(sustainDescRM,
                        '불필요한 패키징을 줄이고, 재사용과 재활용이 가능한 소재를 우선합니다.\n'
                        + '제품 전반에 걸쳐 지속 가능한 설계와 재료 선택을 고려합니다.\n'
                        + '과도한 장식을 지양하며, 필요한 만큼만 사용하는 태도를 유지합니다.'
                    );
                    gsap.set(rmLines, { autoAlpha: 1, y: 0 });
                }

                // Architecture (reduced-motion: arc 즉시 표시 + 스크롤 지원)
                const archSectionRM = archStageRef.current;
                if (archSectionRM) {
                    const rmMaxScroll = getArchConstants().maxScroll;
                    setArchPhase('arc'); // scatter 애니메이션 스킵
                    gsap.to({}, {
                        scrollTrigger: {
                            trigger: archSectionRM,
                            pin: true,
                            scrub: 1,
                            start: 'top top',
                            end: `+=${rmMaxScroll}`,
                            onUpdate: (self) => setArchScrollValue(self.progress * rmMaxScroll),
                            invalidateOnRefresh: true,
                        },
                    });
                }
            });
        }, pageRef);

        return () => ctx.revert();
    }, [changeTab]);

    return (
        <div className="our-story" ref={pageRef} data-node-id="763:1534">

            {/* ── HERO ── */}
            <section className="about-hero" ref={heroRef} data-node-id="763:1309">
                <div className="about-hero__panel">
                    <video className="about-hero__video" autoPlay muted loop playsInline>
                        <source src={aboutBg} type="video/mp4" />
                    </video>
                    <div
                        className="about-hero__overlay"
                        ref={overlayRef}
                        style={{ backgroundColor: SLIDES[0].overlayColor }}
                    />
                    <div className="about-hero__content">
                        <div className="about-hero__heading">
                            <span className="about-hero__pre montage-128">We cultivate</span>
                            <span className="about-hero__subtitle optima-70" ref={subtitleRef}>
                                {SLIDES[0].subtitle}
                            </span>
                        </div>
                        <div className="about-hero__desc suit-16-r" ref={descRef} />
                    </div>
                </div>
            </section>

            {/* ── STORY MID ── */}
            <section className="about-story-mid" ref={storyMidRef} data-node-id="763:1371">
                <div className="about-story-mid__panel">

                    <h2
                        className="about-values__heading montage-80"
                        ref={valuesHeadingRef}
                    >
                        Our Values
                    </h2>

                    <div className="about-values__texts" ref={valuesTextsRef}>
                        <p className="about-values__en optima-18" ref={valuesEnRef}>
                            Through considered formulations, sensory rituals, and an approach to space,<br />
                            we connect everyday life and environment as a continuous experience.
                        </p>
                        <p className="about-values__kr suit-18-r" ref={valuesKrRef}>
                            신중한 조합과 감각적인 리추얼,<br className="mobile-br" />{' '}그리고 공간에 대한 태도를 통해,<br />
                            일상과 환경을 하나의 흐름으로 연결합니다.
                        </p>
                    </div>

                    <div className="about-origins__inner" ref={originsInnerRef}>

                        {/* ── 5개 탭 장식선 — inner(=panel) 기준 absolute ── */}
                        {/* Figma 778:1642 Origins: left=153px, top=321px, w=1521px */}
                        <div className="about-line-wrap about-origins__line-wrap" ref={originsLineRef} aria-hidden="true">
                            <OriginsLineSvg />
                        </div>
                        {/* Figma 860:206 Naming: left=calc(16.67%+141.5px), top=314.5px, w=1127.5px */}
                        <div className="about-line-wrap about-naming__line-wrap" ref={namingLineRef} aria-hidden="true">
                            <NamingLineSvg />
                        </div>
                        {/* Figma 719:2465 Formulation: left=calc(25%+139px), top=231px, w=1003.5px */}
                        <div className="about-line-wrap about-formulation__line-wrap" ref={formulationLineRef} aria-hidden="true">
                            <FormulationLineSvg />
                        </div>
                        {/* Figma 719:2480 Architecture: left=calc(25%+145px), top=317px, w=1043.4px */}
                        <div className="about-line-wrap about-architecture__line-wrap" ref={architectureLineRef} aria-hidden="true">
                            <ArchitectureLineSvg />
                        </div>
                        {/* Figma 719:2510 Approach: left=calc(25%+73px), top=491px, w=442.8px */}
                        <div className="about-line-wrap about-approach__line-wrap" ref={approachLineRef} aria-hidden="true">
                            <ApproachLineSvg />
                        </div>

                        <div className="about-origins__body">
                            <nav className="about-origins__tabs">
                                {ORIGINS_TABS.map((tab, i) => (
                                    <button
                                        key={tab.id}
                                        data-id={tab.id}
                                        ref={(el) => { tabButtonRefs.current[i] = el; }}
                                        className={`about-origins__tab ${tab.id === 'origins' ? 'is-active' : ''}`}
                                        onClick={() => changeTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="about-origins__content">
                                <TextEffect
                                    per="word"
                                    as="p"
                                    className={`about-origins__content-en${tabText.enSmall ? ' about-origins__content-en--sm' : ''}`}
                                    trigger={enTrigger}
                                    variants={{
                                        container: {
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.025 } },
                                            exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
                                        },
                                        item: {
                                            hidden: { opacity: 0, filter: 'blur(6px)', y: 10 },
                                            visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.35 } },
                                            exit: { opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.22 } },
                                        },
                                    }}
                                >
                                    {tabText.en}
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    as="p"
                                    className="about-origins__content-kr"
                                    trigger={krTrigger}
                                    variants={{
                                        container: {
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.025 } },
                                            exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
                                        },
                                        item: {
                                            hidden: { opacity: 0, filter: 'blur(6px)', y: 10 },
                                            visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.35 } },
                                            exit: { opacity: 0, y: 10, filter: 'blur(6px)', transition: { duration: 0.22 } },
                                        },
                                    }}
                                >
                                    {tabText.kr}
                                </TextEffect>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── FORMULATION ── */}
            <section className="about-formulation" data-node-id="763:1336">
                <div className="about-formulation__col">
                    <h2 className="about-formulation__title optima-220" ref={formTitleRef}>Formulation</h2>
                    <div className="about-formulation__content">
                        <div className="about-formulation__main">
                            <img src={aboutFormulation} alt="Aesop formulation products" />
                        </div>
                        <p className="about-formulation__desc">
                            자체 실험실에서 화학자들이 직접 포뮬레이션을 설계합니다.<br />
                            새로운 기술과 검증된 과학을 병행하며, 식물 유래 성분과 과학 성분을 균형 있게 조합합니다.<br />
                            우리는 피부를 보호하고 회복하는 데 초점을 둔 스킨케어를 지향합니다.
                        </p>
                    </div>
                </div>
                <div className="about-formulation__texture" aria-hidden="true">
                    <img src={aboutTexture} alt="" />
                </div>
            </section>

            {/* ── ARCHITECTURE ── */}
            <section className="about-architecture" ref={archStageRef} data-node-id="763:1348">
                <h2 className="about-architecture__title optima-220" ref={archTitleRef}>Architecture</h2>
                <div
                    className="about-architecture__stage"
                    onPointerDown={handleArchPointerDown}
                    onPointerMove={handleArchPointerMove}
                    onPointerUp={handleArchPointerUp}
                    onPointerCancel={handleArchPointerUp}
                    style={{ cursor: 'grab', touchAction: 'pan-y' }}
                >
                    {ARCH_CARDS.map((card, i) => (
                        <ArchCard
                            key={i}
                            card={card}
                            index={i}
                            phase={archPhase}
                            scrollValue={archScrollValue}
                            archConst={archConst}
                        />
                    ))}
                </div>
                <p className="about-architecture__desc">
                    잘 설계된 디자인은 삶의 질을 향상시킵니다.<br />
                    우리는 절제된 톤과 실용성, 지속가능성을 바탕으로 공간을 설계합니다.
                    {' '}각 도시의 환경을 존중하며, 이미 존재하는 건축 요소와 함께 공간을 완성합니다.
                </p>
            </section>

            {/* ── SUSTAINABILITY ── */}
            <section className="about-sustainability" data-node-id="763:1341">
                <h2 className="about-sustainability__title optima-220" ref={sustainTitleRef}>Sustainability</h2>
                <div className="about-sustainability__body">
                    <div className="about-sustainability__image">
                        <img src={aboutSustain} alt="Aesop sustainable products" />
                    </div>
                    <p className="about-sustainability__desc">
                        불필요한 패키징을 줄이고, 재사용과 재활용이 가능한 소재를 우선합니다.<br />
                        제품 전반에 걸쳐 지속 가능한 설계와 재료 선택을 고려합니다.<br />
                        과도한 장식을 지양하며, 필요한 만큼만 사용하는 태도를 유지합니다.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default OurStory;
