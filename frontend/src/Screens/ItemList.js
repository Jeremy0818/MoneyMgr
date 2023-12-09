import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { BiCartAlt, BiBus, BiCamera, BiHomeHeart, BiWorld, BiPhoneCall, BiGift, BiDollar, BiShoppingBag, BiDotsHorizontalRounded, BiMoney, BiTrophy, BiBriefcase, BiPlus, BiCreditCardFront } from 'react-icons/bi';
import { RiBillLine } from 'react-icons/ri';
import { GiPiggyBank } from 'react-icons/gi';
import { ImSpoonKnife } from 'react-icons/im';

function ItemList({ itemList, bottomHalfRef, handleScroll, handleDelete, updateListItem, expCategory, incCategory, trnCategory, accounts }) {
    return (
        itemList.length > 0 ?
            <div ref={bottomHalfRef} onScroll={handleScroll} className="bottom-half">
                {/* <h2 className='list-item-title'>Transactions</h2> */}
                {itemList.map((item, index) => (
                    <CustomListItem
                        index={index}
                        item={item}
                        onUpdateItem={updateListItem}
                        onDeleteItem={handleDelete}
                        expCategory={expCategory}
                        incCategory={incCategory}
                        trnCategory={trnCategory}
                        accounts={accounts} />
                ))}
            </div>
            :
            null
    )
}

// Custom list item component with a container class
function CustomListItem({ index, item, onUpdateItem, onDeleteItem, expCategory, incCategory, trnCategory, accounts }) {
    const [expanded, setExpanded] = useState(false);
    const [editedDetails, setEditedDetails] = useState({
        title: item.title,
        total_amount: item.total_amount,
        date: item.date,
        category: item.category,
        account: item.account,
        type: "Expense",
    });

    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeX, setSwipeX] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);

    useEffect(() => {
        editedDetails.title = item.title;
        editedDetails.date = item.date;
        editedDetails.total_amount = item.total_amount;
        editedDetails.category = item.category;
        setSwipeX(0);
        setIsSwiping(false);
    }, [item]);

    // Determine the appropriate icon based on the category
    let categoryIcon;
    switch (item.category) {
        case 'Groceries':
            categoryIcon = <BiCartAlt />;
            break;
        case 'Utilities':
            categoryIcon = <RiBillLine />;
            break;
        case 'Transportation':
            categoryIcon = <BiBus />;
            break;
        case 'Dining':
            categoryIcon = <ImSpoonKnife />;
            break;
        case 'Entertainment':
            categoryIcon = <BiCamera />;
            break;
        case 'Housing':
            categoryIcon = <BiHomeHeart />;
            break;
        case 'Travel':
            categoryIcon = <BiWorld />;
            break;
        case 'Communication':
            categoryIcon = <BiPhoneCall />;
            break;
        case 'Gift':
            categoryIcon = <BiGift />;
            break;
        case 'Medical':
            categoryIcon = <BiDollar />;
            break;
        case 'Shopping':
            categoryIcon = <BiShoppingBag />;
            break;
        case 'Other':
            categoryIcon = <BiDotsHorizontalRounded />;
            break;
        case 'Salary':
            categoryIcon = <BiMoney />;
            break;
        case 'Bonus':
            categoryIcon = <BiTrophy />;
            break;
        case 'Business':
            categoryIcon = <BiBriefcase />;
            break;
        case 'Extra':
            categoryIcon = <BiPlus />;
            break;
        case 'Credit Card Bill':
            categoryIcon = <BiCreditCardFront />;
            break;
        case 'Saving':
            categoryIcon = <GiPiggyBank />;
            break;
        default:
            categoryIcon = <BiDotsHorizontalRounded />;
    }

    const toggleExpansion = () => {
        setExpanded(!expanded);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails({
            ...editedDetails,
            [name]: value,
            ...(name === 'type' && { category: '' }),
        });
    };

    const handleSave = () => {
        if (editedDetails.category !== "") {
            // Update the item object with the edited details
            const updatedItem = { ...editedDetails };
            const updatedIndex = index;
            onUpdateItem(updatedIndex, updatedItem);
            setExpanded(false);
        } else {
            // Notify the user that a category must be selected before saving
            alert('Please select a category before saving.');
        }
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

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return (
            <div className="item-date">
                <p>{`${day}/${month}`}</p>
                <p>{year}</p>
            </div>
        );
    }

    return (
        <div
            className={`custom-list-item ${expanded ? "expanded" : ""} ${isSwiping ? "swiping" : ""}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="list-header" onClick={toggleExpansion}>
                <div className="left-icon-container">
                    {categoryIcon}
                </div>
                <div className="title-container">
                    <p className="item-title">{item.title}</p>
                    <p className="item-price">${item.total_amount}</p>
                </div>
                <div className="date-container">
                    {formatDate(item.date)}
                </div>
                <div className="right-icon-container">
                    {expanded ? (
                        <FiChevronUp className="icon up" />
                    ) : (
                        <FiChevronDown className="icon down" />
                    )}
                </div>
            </div>
            <div className="additional-details">
                <div>
                    <label htmlFor={`title-${index}`}>Title:</label>
                    <input
                        type="text"
                        id={`title-${index}`}
                        name="title"
                        value={editedDetails.title}
                        onChange={handleInputChange}
                    />
                    <label htmlFor={`total_amount-${index}`}>Total Amount:</label>
                    <input
                        type="number"
                        id={`total_amount-${index}`}
                        name="total_amount"
                        value={editedDetails.total_amount}
                        onChange={handleInputChange}
                    />
                    <label htmlFor={`date-${index}`}>Date:</label>
                    <input
                        type="date"
                        id={`date-${index}`}
                        name="date"
                        value={editedDetails.date}
                        onChange={handleInputChange}
                    />
                    <label htmlFor={`type-${index}`}>Type:</label>
                    <select
                        id={`type-${index}`}
                        name="type"
                        value={editedDetails.type}
                        onChange={handleInputChange}
                    >
                        <option value="Expense">expense</option>
                        <option value="Income">income</option>
                        <option value="Transfer">transfer</option>
                    </select>
                    <label htmlFor={`category-${index}`}>Category:</label>
                    <select
                        id={`category-${index}`}
                        name="category"
                        value={editedDetails.category}
                        onChange={handleInputChange}
                    >
                        <option value="">Please select an option</option>
                        {editedDetails.type == "Expense" ?
                            expCategory.map((category) => (
                                <option value={category}>{category}</option>
                            ))
                            :
                            editedDetails.type == "Income" ?
                                incCategory.map((category) => (
                                    <option value={category}>{category}</option>
                                )) :
                                trnCategory.map((category) => (
                                    <option value={category}>{category}</option>
                                ))}
                    </select>
                    <label htmlFor={`account-${index}`}>Account:</label>
                    <select
                        id={`account-${index}`}
                        name="account"
                        value={editedDetails.account}
                        onChange={handleInputChange}
                    >
                        {accounts.map((account) => (
                            <option value={account}>{account}</option>
                        ))}
                    </select>
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

export default ItemList;