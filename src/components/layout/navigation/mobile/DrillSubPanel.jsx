import React from 'react';
import { Link } from 'react-router-dom';

const DrillSubPanel = ({
    item,
    isActive,
    drillDown,
    drillBack,
    closeMobile,
    ChevronRight,
    ChevronLeft,
}) => {
    if (!item.children) return null;

    return (
        <div className={`drill-panel__screen${isActive ? '' : ' is-right'}`}>
            {/* 뒤로가기 헤더 */}
            <button
                type="button"
                className="drill-panel__back"
                onClick={drillBack}
            >
                <ChevronLeft />
                <span>Back</span>
            </button>

            <h3 className="drill-panel__title">{item.label}</h3>

            <ul className="drill-panel__list" role="menu">
                {item.children.map((child) => (
                    <li key={child.label} role="none">
                        {child.children ? (
                            <button
                                type="button"
                                className="drill-panel__btn"
                                role="menuitem"
                                aria-haspopup="true"
                                onClick={() => drillDown(child)}
                            >
                                <span>{child.label}</span>
                                <ChevronRight />
                            </button>
                        ) : (
                            <Link
                                to={child.path}
                                className="drill-panel__link"
                                role="menuitem"
                                onClick={closeMobile}
                            >
                                {child.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DrillSubPanel;
