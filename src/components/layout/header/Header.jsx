import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';
import GNB_Logo from '../../../assets/GNB_Logo.svg?react';
import { useAppSelector } from '../../../app/store/hooks';
import { selectCartTotalQuantity } from '../../../app/store/selectors/cartSelectors';
import { selectIsLoggedIn } from '../../../app/store/selectors/authSelectors';
import ExpandableSearchBar from '../../ui/ExpandableSearchBar';
import GNB from '../navigation/GNB';

const AccountIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const Header = ({ transparent = false, isVisible = true }) => {
    const navigate = useNavigate();
    const headerRef = useRef(null);
    const totalCount = useAppSelector(selectCartTotalQuantity);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    useLayoutEffect(() => {
        if (!headerRef.current) {
            return undefined;
        }

        const tween = gsap.to(headerRef.current, {
            yPercent: isVisible ? 0 : -110,
            duration: 0.48,
            ease: 'power3.out',
            overwrite: 'auto',
        });

        return () => tween.kill();
    }, [isVisible]);

    const handleLogoClick = (event) => {
        event.preventDefault();
        navigate('/');
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        });
    };

    const handleAccountAction = () => {
        if (isLoggedIn) {
            navigate('/mypage');
            return;
        }

        navigate('/login');
    };

    return (
        <header
            ref={headerRef}
            id="header"
            className={transparent ? 'transparent' : ''}
        >
            <div className="inner">
                <GNB transparent={transparent} />

                <h1>
                    <Link to="/" aria-label="Aesop Home" onClick={handleLogoClick}>
                        <GNB_Logo className="logo-svg" data-header-logo aria-label="Aesop" />
                    </Link>
                </h1>

                <ul className="utl">
                    <li className="search-li">
                        <ExpandableSearchBar
                            expandDirection="left"
                            width={240}
                            onSearch={(query) => {
                                if (query.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(query)}`);
                                }
                            }}
                        />
                    </li>
                    <li className="account-li">
                        <button
                            type="button"
                            className="header-account-action"
                            onClick={handleAccountAction}
                            aria-label={isLoggedIn ? '마이페이지' : '로그인'}
                        >
                            <AccountIcon />
                        </button>
                    </li>
                    <li className="cart-li">
                        <Link to="/cart" aria-label="장바구니" className="cart-link">
                            <svg
                                className="cart-icon"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                            <span className="cart-count">{totalCount}</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;
