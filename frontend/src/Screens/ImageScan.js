import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import '../ImageScan.css';
import { uploadImage } from '../Utils/RequestHelper';
import { FaChevronLeft, FaTrash } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function ImageScan() {
    const { isAuthenticated } = useAuth();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [itemList, setItemList] = useState([]);
    const topHalfRef = useRef(null);
    const bottomHalfRef = useRef(null);

    // Function to handle the scroll event
    function handleScroll() {
        if (window.innerWidth >= 768) return;
        const origHeight = 40 / 100 * window.innerHeight;
        const minHeightTop = topHalfRef.current.style.minHeight;
        console.log(minHeightTop);
        const scrollPosition = bottomHalfRef.current.scrollTop;

        // Calculate the maximum height for the top half in pixels
        const maxTopHeight = Math.max(minHeightTop, origHeight - scrollPosition);
        if (maxTopHeight == minHeightTop) return;

        // Update the top half's height
        topHalfRef.current.style.height = `${maxTopHeight}px`;
        bottomHalfRef.current.style.paddingTop = `${scrollPosition}px`;
    }


    // Function to handle the file selection
    async function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Set the selected image in the state
            setIsLoading(true);
            const { data, error } = await uploadImage(selectedFile);
            console.log(data);
            setIsLoading(false);
            if (error == null) {
                setItemList(data);
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

    function updateListItem(updatedIndex, updatedItem) {
        // Find the index of the updated item in the itemList
        const updatedList = [...itemList];
        console.log(updatedList);
        console.log(updatedIndex);
        console.log(updatedItem);
        updatedList[updatedIndex].title = updatedItem.title;
        updatedList[updatedIndex].date = updatedItem.date;
        updatedList[updatedIndex].total_amount = updatedItem.total_amount;

        // Update the itemList state
        setItemList(updatedList);
    }

    function handleDelete(index) {
        // Create a new list with the item removed
        const updatedList = itemList.filter((_, i) => i !== index);

        // Update the itemList state
        setItemList(updatedList);
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
                    {isLoading ? (
                        <div>Scanning Image...</div>
                    ) : (
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
                    )}

                    {/* Bottom half of the screen with scrollable list */}
                    {itemList.length > 0 &&
                        <div ref={bottomHalfRef} onScroll={handleScroll} className="bottom-half">
                            <h2 className='list-item-title'>Items</h2>
                            {itemList.map((item, index) => (
                                <CustomListItem
                                    index={index}
                                    item={item}
                                    onUpdateItem={updateListItem}
                                    onDeleteItem={handleDelete} />
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
function CustomListItem({ index, item, onUpdateItem, onDeleteItem }) {
    const [expanded, setExpanded] = useState(false);
    const [editedDetails, setEditedDetails] = useState({
        title: item.title,
        total_amount: item.total_amount,
        date: item.date,
    });

    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeX, setSwipeX] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);

    useEffect(() => {
        editedDetails.title = item.title;
        editedDetails.date = item.date;
        editedDetails.total_amount = item.total_amount;
        setSwipeX(0);
        setIsSwiping(false);
    }, [item]);

    const toggleExpansion = () => {
        setExpanded(!expanded);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails({
            ...editedDetails,
            [name]: value,
        });
    };

    const handleSave = () => {
        // Update the item object with the edited details
        const updatedItem = { ...editedDetails };
        const updatedIndex = index;
        onUpdateItem(updatedIndex, updatedItem);
        setExpanded(false);
    };

    const handleDelete = () => {
        console.log('clicked delete');
        // Call the onDeleteItem function with the index to delete the item
        onDeleteItem(index);
    };

    const handleTouchStart = (e) => {
        // Reset swipe state when starting a new swipe
        setSwipeX(0);
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (expanded) {
            // Prevent swiping if the item is expanded
            return;
        }

        const currentX = e.touches[0].clientX;
        setSwipeX(currentX - touchStartX);
        console.log(currentX - touchStartX);

        if (swipeX < -50) {
            setIsSwiping(true);
        }
    };

    const handleTouchEnd = () => {
        console.log('touch end');
        if (isSwiping) {
            if (swipeX < -50) {
                // Swipe left to reveal the delete button
                setIsSwiping(true);
            } else if (swipeX > 50) {
                // Swipe right to hide the delete button
                setIsSwiping(false);
            }
        }
    };

    return (
        <div
            className={`custom-list-item ${expanded ? "expanded" : ""} ${isSwiping ? "swiping" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="list-header" onClick={toggleExpansion}>
                <p className="item-title">{item.title} - ${item.total_amount}</p>
                {expanded ? (
                    <FiChevronUp className="icon up" />
                ) : (
                    <FiChevronDown className="icon down"/>
                )}
            </div>
            <div className="additional-details">
                <div>
                    <input
                        type="text"
                        name="title"
                        value={editedDetails.title}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="total_amount"
                        value={editedDetails.total_amount}
                        onChange={handleInputChange}
                    />
                    <input
                        type="date"
                        name="date"
                        value={editedDetails.date}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleSave}>Save</button>
                    <button className='details-delete-button' onClick={handleDelete}>Delete</button>
                </div>
            </div>
            <div
                className={`delete-button ${isSwiping ? "visible" : ""}`}
                onClick={handleDelete}
            >
                <FaTrash />
            </div>
        </div>
    );
}

export default ImageScan;
