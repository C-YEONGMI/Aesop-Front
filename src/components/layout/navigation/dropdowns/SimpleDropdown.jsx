import React from 'react';
import { Link } from 'react-router-dom';
import './SimpleDropdown.scss';

const SimpleDropdown = ({ item, onClose }) => {
    if (!item.children) return null;

    return (
        <ul className="simple-dropdown" role="menu">
            {item.children.map((child) => (
                <li key={child.label} role="none">
                    <Link
                        to={child.path}
                        className="simple-dropdown__link"
                        role="menuitem"
                        onClick={onClose}
                    >
                        {child.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default SimpleDropdown;
