import React from 'react';
import '../SlidingMenu.css';
import { useNavigate } from 'react-router-dom';

const SlidingMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    function openImageScan() {
        navigate('/imagescan');
        onClose();
    }

    return (
        <div>
            {isOpen && (
                <div className="overlay" onClick={onClose}></div>
            )}
            <div className={`sliding-menu ${isOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <button className="sliding-menu-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="menu-content">
                    <h2>Add Transaction: </h2>
                    <button onClick={openImageScan}>Personal</button>
                    <button onClick={openImageScan}>Group</button>
                </div>
            </div>
        </div>

    );
};

export default SlidingMenu;
