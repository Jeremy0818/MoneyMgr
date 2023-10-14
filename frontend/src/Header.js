import React from 'react';
import './Header.css';
import { useAuth } from './Utils/AuthContext';
import { FaChevronLeft } from 'react-icons/fa';

const Header = ({ title, showBackButton, showDoneButton, onBack, onDone }) => {
    const { isAuthenticated } = useAuth();

    // Render the navigation bar only if the user is logged in
    if (!isAuthenticated()) {
        return null; // Don't render anything if the user is not logged in
    }

    return (
        <div className="header">
            {showBackButton && (
                <button className="back-button" onClick={onBack.func}>
                    <FaChevronLeft />
                </button>
            )}
            <p className="header-title">{title}</p>
            {showDoneButton && (
                <button className="done-button" onClick={onDone.func}>
                    Done
                </button>
            )}
        </div>
    );
};

export default Header;
