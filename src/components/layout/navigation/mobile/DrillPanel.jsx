import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { selectIsLoggedIn } from '../../../../app/store/selectors/authSelectors';
import { logoutUser } from '../../../../app/store/slices/authSlice';
import DrillSubPanel from './DrillSubPanel';
import './DrillPanel.scss';

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const DrillPanel = ({ items, drillStack, drillDown, drillBack, closeMobile }) => {
    const currentDepth = drillStack.length;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    const handleAccountAction = async () => {
        closeMobile();
        if (isLoggedIn) {
            await dispatch(logoutUser());
            navigate('/');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="drill-panel">
            {/* 1depth — 루트 메뉴 */}
            <div
                className={`drill-panel__screen${currentDepth > 0 ? ' is-left' : ''}`}
            >
                <ul className="drill-panel__list" role="menu">
                    {items.map((item) => (
                        <li key={item.label} role="none">
                            {item.children ? (
                                <button
                                    type="button"
                                    className="drill-panel__btn"
                                    role="menuitem"
                                    aria-haspopup="true"
                                    onClick={() => drillDown(item)}
                                >
                                    <span>{item.label}</span>
                                    <ChevronRight />
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="drill-panel__link"
                                    role="menuitem"
                                    onClick={closeMobile}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                {/* 로그인/로그아웃 — 모바일 전용 */}
                <button
                    type="button"
                    className="drill-panel__account-btn"
                    onClick={handleAccountAction}
                >
                    {isLoggedIn ? 'LOG OUT' : 'LOG IN'}
                </button>
            </div>

            {/* 하위 depth 패널들 */}
            {drillStack.map((stackItem, idx) => (
                <DrillSubPanel
                    key={stackItem.label}
                    item={stackItem}
                    isActive={idx === currentDepth - 1}
                    drillDown={drillDown}
                    drillBack={drillBack}
                    closeMobile={closeMobile}
                    ChevronRight={ChevronRight}
                    ChevronLeft={ChevronLeft}
                />
            ))}
        </div>
    );
};

export default DrillPanel;
