import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { menuData } from './menuData';
import MegaMenu from './dropdowns/MegaMenu';
import SimpleDropdown from './dropdowns/SimpleDropdown';
import './DesktopNav.scss';

const DesktopNav = ({ activeMenu, openMenu, closeMenu, transparent }) => {
    const navRef = useRef(null);
    const closeTimerRef = useRef(null);

    const handleMouseEnter = useCallback(
        (index) => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
            }
            openMenu(index);
        },
        [openMenu],
    );

    const handleMouseLeave = useCallback(() => {
        closeTimerRef.current = setTimeout(() => {
            closeMenu();
            closeTimerRef.current = null;
        }, 120);
    }, [closeMenu]);

    const renderDropdown = (item, index) => {
        if (activeMenu !== index) return null;

        if (item.type === 'mega') {
            return <MegaMenu item={item} onClose={closeMenu} />;
        }

        if (item.type === 'simple' && item.children) {
            return <SimpleDropdown item={item} onClose={closeMenu} />;
        }

        return null;
    };

    return (
        <nav
            ref={navRef}
            className="gnb-desktop"
            role="menubar"
            onMouseLeave={handleMouseLeave}
        >
            <ul className="gnb-depth1">
                {menuData.map((item, index) => (
                    <li
                        key={item.label}
                        className={`gnb-depth1__item${activeMenu === index ? ' is-active' : ''}`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onFocus={() => handleMouseEnter(index)}
                    >
                        <Link
                            to={item.path || '#'}
                            className="gnb-depth1__link"
                            role="menuitem"
                            aria-haspopup={item.type !== 'link' ? 'true' : undefined}
                            aria-expanded={
                                item.type !== 'link' ? activeMenu === index : undefined
                            }
                            onClick={(e) => {
                                if (item.type !== 'link' && !item.path) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            {item.label}
                        </Link>

                        {/* simple 드롭다운은 li 내부 (position: relative 기준) */}
                        {item.type === 'simple' && renderDropdown(item, index)}
                    </li>
                ))}
            </ul>

            {/* mega 메뉴는 nav 직하위 (header 기준 full-width) */}
            {menuData.map((item, index) =>
                item.type === 'mega' && activeMenu === index ? (
                    <MegaMenu
                        key={item.label}
                        item={item}
                        onClose={closeMenu}
                        onMouseEnter={() => handleMouseEnter(index)}
                    />
                ) : null,
            )}
        </nav>
    );
};

export default DesktopNav;
