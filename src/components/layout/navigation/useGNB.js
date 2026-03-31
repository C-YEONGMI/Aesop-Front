import { useState, useCallback, useEffect } from 'react';

export const useGNB = () => {
    /* ── Desktop 상태 ── */
    const [activeMenu, setActiveMenu] = useState(null);

    const openMenu = useCallback((index) => setActiveMenu(index), []);
    const closeMenu = useCallback(() => setActiveMenu(null), []);

    /* ── Mobile 상태 ── */
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drillStack, setDrillStack] = useState([]);

    const toggleMobile = useCallback(() => {
        setMobileOpen((prev) => {
            if (prev) setDrillStack([]);
            return !prev;
        });
    }, []);

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
        setDrillStack([]);
    }, []);

    const drillDown = useCallback((item) => {
        setDrillStack((prev) => [...prev, item]);
    }, []);

    const drillBack = useCallback(() => {
        setDrillStack((prev) => prev.slice(0, -1));
    }, []);

    /* ── ESC 키로 닫기 ── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeMenu();
                closeMobile();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeMenu, closeMobile]);

    /* ── Mobile 열릴 때 body 스크롤 잠금 ── */
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return {
        activeMenu,
        openMenu,
        closeMenu,
        mobileOpen,
        toggleMobile,
        closeMobile,
        drillStack,
        drillDown,
        drillBack,
    };
};
