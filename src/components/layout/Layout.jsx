import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './header/Header';
import Footer from './footer/Footer';
import FloatingButtons from '../common/button/FloatingButtons';
import CartAddDialog from '../ui/CartAddDialog';
import LoginRequiredModal from '../ui/LoginRequiredModal';
import OrderCompleteModal from '../ui/OrderCompleteModal';

// 전체 레이아웃 래퍼
// - 홈 Hero 구간: transparent 헤더 (흰색 텍스트)
// - 홈 Hero 이탈 이후: solid 헤더 (브라운 텍스트)
// - 내부 페이지: 항상 solid 헤더
const Layout = () => {
    const HEADER_IDLE_HIDE_DELAY = 5000;
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [scrolled, setScrolled] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const shouldPreserveScroll = Boolean(location.state?.preserveScroll);
    const lastScrollYRef = useRef(0);
    const idleHideTimeoutRef = useRef(null);

    useEffect(() => {
        if (!('scrollRestoration' in window.history)) {
            return undefined;
        }

        const previousValue = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';

        return () => {
            window.history.scrollRestoration = previousValue;
        };
    }, []);

    useLayoutEffect(() => {
        if (shouldPreserveScroll) {
            return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.key, shouldPreserveScroll]);

    useEffect(() => {
        const clearIdleHideTimeout = () => {
            if (idleHideTimeoutRef.current) {
                window.clearTimeout(idleHideTimeoutRef.current);
                idleHideTimeoutRef.current = null;
            }
        };

        const scheduleIdleHide = (currentScrollY) => {
            clearIdleHideTimeout();

            if (currentScrollY <= 4) {
                return;
            }

            idleHideTimeoutRef.current = window.setTimeout(() => {
                setIsHeaderVisible(false);
            }, HEADER_IDLE_HIDE_DELAY);
        };

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollYRef.current;
            let heroVisibilityBoundary = 0;

            if (isHome) {
                const heroHeight = document.querySelector('.hero')?.offsetHeight ?? window.innerHeight;
                heroVisibilityBoundary = heroHeight * 0.9;
                setScrolled(currentScrollY > heroVisibilityBoundary);
            } else {
                setScrolled(true);
            }

            if (currentScrollY <= 4) {
                clearIdleHideTimeout();
                setIsHeaderVisible(true);
                lastScrollYRef.current = currentScrollY;
                return;
            }

            if (isHome && currentScrollY <= heroVisibilityBoundary) {
                clearIdleHideTimeout();
                setIsHeaderVisible(true);
                lastScrollYRef.current = currentScrollY;
                return;
            }

            scheduleIdleHide(currentScrollY);

            if (Math.abs(scrollDelta) < 6) {
                return;
            }

            // 요청 기준: 아래로 스크롤할 때는 보이고, 위로 스크롤할 때는 숨김
            setIsHeaderVisible(scrollDelta < 0);
            lastScrollYRef.current = currentScrollY;
        };

        lastScrollYRef.current = window.scrollY;
        setIsHeaderVisible(true);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearIdleHideTimeout();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHome, location.key]);

    return (
        <>
            {/* transparent 여부를 헤더에 전달 */}
            <Header transparent={isHome && !scrolled} isVisible={isHeaderVisible} />
            <main className="main">
                <Outlet />
            </main>
            <CartAddDialog />
            <LoginRequiredModal />
            <OrderCompleteModal />
            <Footer />
            <FloatingButtons />
        </>
    );
};

export default Layout;
