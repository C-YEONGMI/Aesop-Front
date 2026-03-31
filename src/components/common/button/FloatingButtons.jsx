import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ExpandableChat from '../../ui/ExpandableChat';
import './FloatingButtons.scss';

const BUTTON_BASE_RGB = { r: 50, g: 41, b: 29 };
const INITIAL_THEME_STATE = { top: false, chat: false };
const HERO_LOGO_HANDOFF_STORAGE_KEY = 'hero-logo-handoff-complete';

const parseRgbColor = (value) => {
    if (!value || value === 'transparent') {
        return null;
    }

    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
        return null;
    }

    const [r = 0, g = 0, b = 0, a = 1] = match[1]
        .split(',')
        .map((channel) => Number.parseFloat(channel.trim()));

    if ([r, g, b].some((channel) => Number.isNaN(channel)) || a === 0) {
        return null;
    }

    return { r, g, b, a: Number.isNaN(a) ? 1 : a };
};

const getColorDistance = (source, target) =>
    Math.sqrt(
        (source.r - target.r) ** 2 +
        (source.g - target.g) ** 2 +
        (source.b - target.b) ** 2
    );

const getBackgroundColorFromPoint = (element) => {
    if (!element) {
        return null;
    }

    const rect = element.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
    const elements = document.elementsFromPoint(x, y);

    for (const node of elements) {
        if (!(node instanceof HTMLElement)) {
            continue;
        }

        if (
            node.classList.contains('floating-btn') ||
            node.classList.contains('floating-btn-group') ||
            node.classList.contains('floating-buttons')
        ) {
            continue;
        }

        const backgroundColor = parseRgbColor(window.getComputedStyle(node).backgroundColor);
        if (backgroundColor && backgroundColor.a > 0.85) {
            return backgroundColor;
        }
    }

    return parseRgbColor(window.getComputedStyle(document.body).backgroundColor);
};

const shouldInvertButton = (element) => {
    const backgroundColor = getBackgroundColorFromPoint(element);

    if (!backgroundColor) {
        return false;
    }

    return getColorDistance(backgroundColor, BUTTON_BASE_RGB) < 64;
};

const FloatingButtons = () => {
    const location = useLocation();
    const [isTopVisible, setIsTopVisible] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [invertedButtons, setInvertedButtons] = useState(INITIAL_THEME_STATE);
    const topButtonRef = useRef(null);
    const chatButtonRef = useRef(null);

    useEffect(() => {
        let frameId = null;

        const syncButtonVisibility = () => {
            const isMainPage = location.pathname === '/';
            const isHeroAnimationRunning =
                isMainPage &&
                window.sessionStorage.getItem(HERO_LOGO_HANDOFF_STORAGE_KEY) !== 'true';
            const shouldShowButtons = !isHeroAnimationRunning;

            setIsTopVisible(shouldShowButtons);
            setIsChatVisible(shouldShowButtons);
        };

        const syncButtonTheme = () => {
            frameId = null;
            setInvertedButtons({
                top: shouldInvertButton(topButtonRef.current),
                chat: shouldInvertButton(chatButtonRef.current),
            });
        };

        const requestThemeSync = () => {
            if (frameId !== null) {
                return;
            }

            frameId = window.requestAnimationFrame(syncButtonTheme);
        };

        const handleScroll = () => {
            syncButtonVisibility();
            requestThemeSync();
        };

        const handleHeroHandoffComplete = () => {
            syncButtonVisibility();
            requestThemeSync();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', requestThemeSync);
        window.addEventListener('hero-logo-handoff-complete', handleHeroHandoffComplete);
        window.addEventListener('pageshow', handleHeroHandoffComplete);
        syncButtonVisibility();
        handleScroll();
        requestThemeSync();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', requestThemeSync);
            window.removeEventListener('hero-logo-handoff-complete', handleHeroHandoffComplete);
            window.removeEventListener('pageshow', handleHeroHandoffComplete);

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, [location.pathname]);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setInvertedButtons({
                top: shouldInvertButton(topButtonRef.current),
                chat: shouldInvertButton(chatButtonRef.current),
            });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [isChatOpen, isChatVisible, isTopVisible]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };

    return (
        <div className="floating-buttons">
            <button
                ref={topButtonRef}
                className={`floating-btn btn-top ${isTopVisible ? 'visible' : ''} ${
                    invertedButtons.top ? 'is-inverted' : ''
                }`}
                onClick={scrollToTop}
                aria-label="최상단으로 이동"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="18 15 12 9 6 15" />
                </svg>
            </button>

            <div
                className={`floating-btn-group ${isChatVisible || isChatOpen ? 'visible' : ''} ${
                    isChatOpen ? 'is-open' : ''
                }`}
            >
                <ExpandableChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

                <button
                    ref={chatButtonRef}
                    className={`floating-btn btn-chat ${isChatOpen ? 'is-active' : ''} ${
                        invertedButtons.chat ? 'is-inverted' : ''
                    }`}
                    aria-label={isChatOpen ? '실시간 상담 닫기' : '실시간 상담 열기'}
                    onClick={toggleChat}
                >
                    {isChatOpen ? (
                        <X size={20} strokeWidth={1.8} />
                    ) : (
                        <MessageCircle size={20} strokeWidth={1.8} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default FloatingButtons;
