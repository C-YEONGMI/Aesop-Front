import React from 'react';
import { menuData } from './menuData';
import DrillPanel from './mobile/DrillPanel';
import './MobileNav.scss';

const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MobileNav = ({
    mobileOpen,
    toggleMobile,
    closeMobile,
    drillStack,
    drillDown,
    drillBack,
    transparent,
}) => {
    return (
        <nav className="gnb-mobile">
            <button
                type="button"
                className={`gnb-mobile__toggle${transparent ? ' gnb-mobile__toggle--transparent' : ''}${
                    mobileOpen ? ' gnb-mobile__toggle--open' : ''
                }`}
                onClick={toggleMobile}
                aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={mobileOpen}
            >
                {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            {/* 오버레이 배경 */}
            <div
                className={`gnb-mobile__backdrop${mobileOpen ? ' is-open' : ''}`}
                onClick={closeMobile}
                aria-hidden="true"
            />

            {/* 드릴다운 패널 */}
            <div className={`gnb-mobile__panel${mobileOpen ? ' is-open' : ''}`}>
                <DrillPanel
                    items={menuData}
                    drillStack={drillStack}
                    drillDown={drillDown}
                    drillBack={drillBack}
                    closeMobile={closeMobile}
                />
            </div>
        </nav>
    );
};

export default MobileNav;
