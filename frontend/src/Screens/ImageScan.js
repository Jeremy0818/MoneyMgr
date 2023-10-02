import React, { useState, useRef } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import '../ImageScan.css';
import { uploadImage } from '../Utils/RequestHelper';
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ImageView from './ImageView';
import ItemList from './ItemList';

function ImageScan() {
    const { isAuthenticated } = useAuth();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [expCategories, setExpCategories] = useState([]);
    const [incCategories, setIncCategories] = useState([]);
    const [trnCategories, setTrnCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const topHalfRef = useRef(null);
    const bottomHalfRef = useRef(null);
    const navigate = useNavigate();

    // Function to handle the scroll event
    function handleScroll() {
        if (window.innerWidth >= 768) {
            bottomHalfRef.current.style.paddingTop = `0`;
            return;
        }
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
            console.log(data.data);
            setIsLoading(false);
            if (error == null) {
                setItemList(data.data);
                setExpCategories(data.expense_categories);
                setIncCategories(data.income_categories);
                setTrnCategories(data.transfer_categories);
                setAccounts(data.accounts);
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
        navigate('/home');
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
        updatedList[updatedIndex].category = updatedItem.category;
        updatedList[updatedIndex].type = updatedItem.type;
        updatedList[updatedIndex].account = updatedItem.account;

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
                        <ImageView
                            topHalfRef={topHalfRef}
                            selectedImage={selectedImage}
                            isFullScreen={isFullScreen}
                            toggleFullScreen={toggleFullScreen}
                        />
                    )}

                    {/* Bottom half of the screen with scrollable list */}
                    <ItemList
                        itemList={itemList}
                        bottomHalfRef={bottomHalfRef}
                        handleScroll={handleScroll}
                        handleDelete={handleDelete}
                        updateListItem={updateListItem}
                        expCategory={expCategories}
                        incCategory={incCategories}
                        trnCategory={trnCategories}
                        accounts={accounts}
                    />
                </div>
            ) : (
                <LoggedOut />
            )
            }
        </div >
    );
}

export default ImageScan;
