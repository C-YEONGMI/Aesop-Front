import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGNB } from './useGNB';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

const DESKTOP_BREAKPOINT = 1440;

const GNB = ({ transparent }) => {
    const [isDesktop, setIsDesktop] = useState(
        () => window.innerWidth >= DESKTOP_BREAKPOINT,
    );
    const gnb = useGNB();
    const location = useLocation();

    /* breakpoint 감지 */
    useEffect(() => {
        const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

        const handleChange = (e) => {
            setIsDesktop(e.matches);
            if (e.matches) gnb.closeMobile();
            else gnb.closeMenu();
        };

        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* 라우트 변경 시 모든 메뉴 닫기 */
    useEffect(() => {
        gnb.closeMenu();
        gnb.closeMobile();
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    return isDesktop ? (
        <DesktopNav
            activeMenu={gnb.activeMenu}
            openMenu={gnb.openMenu}
            closeMenu={gnb.closeMenu}
            transparent={transparent}
        />
    ) : (
        <MobileNav
            mobileOpen={gnb.mobileOpen}
            toggleMobile={gnb.toggleMobile}
            closeMobile={gnb.closeMobile}
            drillStack={gnb.drillStack}
            drillDown={gnb.drillDown}
            drillBack={gnb.drillBack}
            transparent={transparent}
        />
    );
};

export default GNB;
