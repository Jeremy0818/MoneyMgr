import React, { useState } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import '../ImageScan.css';
import { uploadImage } from '../Utils/RequestHelper';
import { FaChevronLeft } from 'react-icons/fa';

function ImageScan() {
    const { isAuthenticated } = useAuth();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [itemList, setItemList] = useState([]);

    // Function to handle the file selection
    async function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Set the selected image in the state
            setIsLoading(true);
            const { data, error } = await uploadImage(selectedFile);
            setIsLoading(false);
            if (error == null) {
                setItemList(data.total_amount);
                setSelectedImage(URL.createObjectURL(selectedFile));
            }
        }
    }

    // Function to toggle full screen display
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    function handleDone() {
        // Perform any actions you want when the "Done" button is clicked
        // For example, submit the selected image or close a modal
    }

    function handleCancel() {
        // Perform any actions you want when the "Cancel" button is clicked
        // For example, clear the selected image and item list
        setSelectedImage(null);
        setItemList([]);
    }

    return (
        <div>
            {isAuthenticated() ? (
                <div className='image-scan-container'>
                    <div className="header">
                        <button className="cancel-button" onClick={handleCancel}>
                            <FaChevronLeft />
                        </button>
                        {selectedImage && itemList.length > 0 ? (
                            <button className="done-button" onClick={handleDone}>Done</button>
                        ) : null}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        id="fileInput"
                        style={{ display: "none" }}
                        onChange={handleFileSelect} // Call handleFileSelect when a file is chosen
                    />
                    {selectedImage ? (
                        isLoading ? (
                            <div>Scanning Image...</div>
                        ) : (
                            // Display the image or the full-screen image
                            isFullScreen ? (
                                <div className="full-screen-image" onClick={toggleFullScreen}>
                                    <img src={selectedImage} alt="Image" onClick={toggleFullScreen} />
                                    <button className="full-screen-image-close-button" onClick={toggleFullScreen}>
                                        &#x2715;{/* Close button with a cross icon */}
                                    </button>
                                </div>
                            ) : (
                                <div className="top-half" onClick={toggleFullScreen}>
                                    <img src={selectedImage} alt="Image" />
                                </div>
                            )
                        )
                    ) : (
                        // Show a button to upload or take an image if no selected image
                        <div className="upload-button">
                            <button onClick={() => document.getElementById('fileInput').click()}>
                                Upload or Take an Image
                            </button>
                        </div>
                    )}

                    {/* Bottom half of the screen with scrollable list */}
                    {itemList.length > 0 &&
                        <div className="bottom-half">
                            <h2 className='list-item-title'>Items</h2>
                            {itemList.map((item, index) => (
                                <CustomListItem key={index} item={item} />
                            ))}
                        </div>
                    }
                </div>
            ) : (
                <LoggedOut />
            )
            }
        </div >
    );
}

// Custom list item component with a container class
function CustomListItem({ item }) {
    return (
        <div className="custom-list-item">
            <p>Name: {item[0]}, price: {item[1]}</p>
        </div>
    );
}

export default ImageScan;
