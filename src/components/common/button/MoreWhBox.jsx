import React from 'react';
import { Link } from 'react-router-dom';
import './Btn.scss';

const MoreWhBox = ({ text = 'View more', to = '#' }) => {
    return (
        <Link to={to} className="btn-more-wh-box">
            {text}
            <svg width="17.5" height="6" viewBox="0 0 17.5 6" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M0 5h17M11 0l6 5" />
            </svg>
        </Link>
    );
};

export default MoreWhBox;
