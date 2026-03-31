import React from 'react';
import { Link } from 'react-router-dom';
import GNB_Logo from '../../../../assets/GNB_Logo.svg?react';
import './MegaMenu.scss';

const MegaMenu = ({ item, onClose, onMouseEnter }) => {
    if (!item.children) return null;

    // 상단 3개 + 하단 3개 분리
    const topCategories = item.children.slice(0, 3);
    const bottomCategories = item.children.slice(3);

    const renderColumn = (category) => (
        <div className="mega-menu__column" key={category.label}>
            <Link
                to={category.path}
                className="mega-menu__category-title"
                onClick={onClose}
            >
                {category.label}
            </Link>
            {category.children && (
                <ul className="mega-menu__sub-list" role="menu">
                    {category.children.map((sub) => (
                        <li key={sub.label} role="none">
                            <Link
                                to={sub.path}
                                className="mega-menu__sub-link"
                                role="menuitem"
                                onClick={onClose}
                            >
                                {sub.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div
            className="mega-menu"
            role="menu"
            onMouseEnter={onMouseEnter}
        >
            <div className="mega-menu__inner">
                <div className="mega-menu__top-row">
                    {topCategories.map(renderColumn)}
                </div>
                {bottomCategories.length > 0 && (
                    <>
                        <hr className="mega-menu__divider" />
                        <div className="mega-menu__bottom-row">
                            {bottomCategories.map(renderColumn)}
                        </div>
                    </>
                )}
            </div>
            <GNB_Logo className="mega-menu__logo" aria-hidden="true" />
        </div>
    );
};

export default MegaMenu;
