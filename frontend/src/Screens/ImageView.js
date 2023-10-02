
import React from 'react';

function ImageView({ topHalfRef, selectedImage, isFullScreen, toggleFullScreen }) {
    return (
        selectedImage ? (
            // Display the image or the full-screen image
            isFullScreen ? (
                <div className="full-screen-image" onClick={toggleFullScreen}>
                    <img src={selectedImage} alt="Image" onClick={toggleFullScreen} />
                    <button className="full-screen-image-close-button" onClick={toggleFullScreen}>
                        &#x2715;{/* Close button with a cross icon */}
                    </button>
                </div>
            ) : (
                <div ref={topHalfRef} className="top-half" onClick={toggleFullScreen}>
                    <img src={selectedImage} alt="Image" />
                </div>
            )
        ) : (
            // Show a button to upload or take an image if no selected image
            <div className="upload-button">
                <button onClick={() => document.getElementById('fileInput').click()}>
                    Upload or Take an Image
                </button>
            </div>
        )
    );
}

export default ImageView;