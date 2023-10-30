import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import '../ImageScan.css';
import { uploadImage, saveTransactions } from '../Utils/RequestHelper';
import { useNavigate } from 'react-router-dom';
import ImageView from './ImageView';
import ItemList from './ItemList';

function ImageScan({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
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

    useEffect(() => {
        setTitle("Smart Scan");
        setShowBackButton(true);
        setShowDoneButton(true);
        setHandleBack({ func: handleCancel });
        setHandleDone({ func: handleDone });
    }, []);

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
            setIsLoading(false);
            if (error == null) {
                console.log(data.data);
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

    async function handleDone() {
        const { data, error } = await saveTransactions(itemList);
        if (error) {
            alert(error);
        } else {
            console.log(data.status);
            navigate("/home");
        }
    }

    function handleCancel() {
        setSelectedImage(null);
        setItemList([]);
        navigate("/home");
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
        <div className='screen-container'>
            {isAuthenticated() ? (
                <div className='image-scan-container'>
                    <input
                        type="file"
                        accept="image/*"
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
