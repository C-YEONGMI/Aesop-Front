import React from 'react';
import { Link } from 'react-router-dom';
import './Btn.scss';

const More = ({ text = 'more', to = '#' }) => {
    return (
        <Link to={to} className="btn-more">
            {text}
            {/* 이솝 특유의 위쪽 꺾임 화살표 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 14h15M19 14l-6-6" />
            </svg>
        </Link>
    );
};

export default More;
