import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header_wh.scss';
import GNB_Logo from '../../../assets/GNB_Logo.svg?react';
import ExpandableSearchBar from '../../ui/ExpandableSearchBar';
import { useAppSelector } from '../../../app/store/hooks';
import { selectCartTotalQuantity } from '../../../app/store/selectors/cartSelectors';
import { selectIsLoggedIn } from '../../../app/store/selectors/authSelectors';
import { formatCategoryLabel } from '../../../data/productCategories';

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

const Header_wh = () => {
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const totalCount = useAppSelector(selectCartTotalQuantity);

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
        <header id="header-wh">
            <div className="inner">
                <nav className="nav">
                    <ul className="depth1">
                        <li><a href="/gift-guide">GIFT GUIDE</a></li>
                        <li>
                            <a href="/products">PRODUCTS</a>
                            <ul className="depth2">
                                <li><a href="/products/skincare">SKIN CARE</a></li>
                                <li><a href="/products/fragrance">{formatCategoryLabel('Perfume')}</a></li>
                                <li><a href="/products/home">HOME & LIVING</a></li>
                                <li><a href="/products/hair">HAIR & SHAVING</a></li>
                                <li><a href="/products/body">HAND & BODY</a></li>
                                <li><a href="/products/kits">KITS</a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="/benefits">BENEFITS</a>
                            <ul className="depth2">
                                <li><a href="/benefits/official">Online</a></li>
                                <li><a href="/benefits/kr-exclusive">Korea Exclusive</a></li>
                            </ul>
                        </li>
                        <li><a href="/our-story">OUR STORY</a></li>
                    </ul>
                </nav>

                <h1>
                    <Link to="/" aria-label="Aesop Home" onClick={handleLogoClick}>
                        <GNB_Logo className="logo-svg" aria-label="Aesop" />
                    </Link>
                </h1>

                <ul className="utl">
                    <li className="search-li">
                        <ExpandableSearchBar
                            expandDirection="left"
                            width={300}
                            onSearch={(query) => {
                                if (query.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(query)}`);
                                }
                            }}
                        />
                    </li>
                    <li>
                        <button
                            type="button"
                            className="header-account-action"
                            onClick={handleAccountAction}
                            aria-label={isLoggedIn ? '마이페이지' : '로그인'}
                        >
                            <AccountIcon />
                        </button>
                    </li>
                    <li>
                        <a href="/cart" aria-label="장바구니">
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
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                            <span className="cart-count">{totalCount}</span>
                        </a>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header_wh;
