import React from 'react';
import '../SlidingMenu.css';

const SlidingMenu = ({ isOpen, onClose }) => {

    function openCameraOrFile() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click(); // Trigger the file input dialog

        fileInput.addEventListener('change', (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                // Handle the selected file (e.g., upload it or display it)
                console.log('Selected file:', selectedFile);
            }
        });
    }

    return (
        <div>
            {isOpen && (
                <div className="overlay" onClick={onClose}></div>
            )}
            <input type="file" accept="image/*" capture="camera" id="fileInput" style={{display: "none"}}></input>
            <div className={`sliding-menu ${isOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="menu-content">
                    <h1>Transaction: </h1>
                    <button onClick={openCameraOrFile}>Personal</button>
                    <button onClick={openCameraOrFile}>Group</button>
                </div>
            </div>
        </div>

    );
};

export default SlidingMenu;
