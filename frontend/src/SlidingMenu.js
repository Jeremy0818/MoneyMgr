import React, { useEffect, useState } from 'react';
import './SlidingMenu.css';
import { useNavigate } from 'react-router-dom';

const SlidingMenu = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            setPhase(1);
        }
    }, [isOpen]);

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
                {phase == 1 ? (
                    <div className="menu-content">
                        <h2>Add Transaction: </h2>
                        <button onClick={() => setPhase(phase+1)}>Personal</button>
                        <button onClick={openImageScan}>Group</button>
                    </div>
                ) : ( phase == 2 ? (
                    <div className="menu-content">
                        <h2>Type of Input: </h2>
                        <button onClick={openImageScan}>Receipt Scan</button>
                        <button onClick={openImageScan}>Statement Scan</button>
                        <button onClick={openImageScan}>Manual</button>
                    </div>
                ): (
                    null
                ))}

            </div>
        </div>

    );
};

export default SlidingMenu;
