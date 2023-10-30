import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import { getAccount } from '../Utils/RequestHelper';
import ItemList from './ItemList';
import { useParams, useNavigate } from 'react-router-dom';
import { ThreeDots, CirclesWithBar } from 'react-loader-spinner';
import { CarouselContainer, CarouselItem } from './Carousel';

function AccountDetail({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [expCategories, setExpCategories] = useState([]);
    const [incCategories, setIncCategories] = useState([]);
    const [trnCategories, setTrnCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle("Account Detail");
        setShowBackButton(true);
        setShowDoneButton(false);
        setHandleBack({ func: back });
        setHandleDone({ func: null });

        getAccountInfo();
    }, []);

    const getAccountInfo = async () => {
        const { data, error } = await getAccount(id);
        if (error == null) {
            console.log(data.data);
            setTimeout(() => {
                setAccount(data.data.account);
                setExpenses(setupItem(data.data.expenses, data.data.account));
                setIncomes(setupItem(data.data.incomes, data.data.account));
                setExpCategories(data.data.expense_categories);
                setIncCategories(data.data.income_categories);
                setTrnCategories(data.data.transfer_categories);
                setAccounts(data.data.accounts);
            }, 1000);
        }
    }

    const back = () => {
        navigate('/accounts')
    }

    const setupItem = (list, account) => {
        let tempList = [];
        for (let i = 0; i < list.length; i++) {
            let tempItem = {
                title: list[i].transaction.title,
                total_amount: list[i].transaction.total_amount,
                date: list[i].transaction.date,
                category: list[i].category.category_name,
                account: account.account_name,
                type: "expense",
            }
            tempList.push(tempItem)
        }
        return tempList;
    }

    return (
        <div className='screen-container'>
            {isAuthenticated() ? (
                <div className='inner-container'>
                    <div className='rounded-container info-container' style={{
                        backgroundColor: "#008B8B",
                    }}>
                        {
                            account ? (
                                <div className='account-detail-container'>
                                    <div className='account-name'>{account.account_name}</div>
                                    <div className='account-balance'>{account.balance}</div>
                                </div>
                            ) : (
                                <ThreeDots
                                    height="80"
                                    width="80"
                                    radius="9"
                                    color="#4fa94d"
                                    ariaLabel="three-dots-loading"
                                    wrapperStyle={{}}
                                    wrapperClassName=""
                                    visible={true}
                                />
                            )
                        }
                    </div>
                    {
                        expenses.length > 0 &&
                            incomes.length > 0 &&
                            expCategories.length > 0 &&
                            incCategories.length > 0 &&
                            trnCategories.length > 0 &&
                            accounts.length > 0 ? (
                            <CarouselContainer controls indicators>
                                <CarouselItem>
                                    <div className="carousel-content">
                                        <ItemList
                                            itemList={expenses}
                                            bottomHalfRef={null}
                                            handleScroll={null}
                                            handleDelete={null}
                                            updateListItem={null}
                                            expCategory={expCategories}
                                            incCategory={incCategories}
                                            trnCategory={trnCategories}
                                            accounts={accounts}
                                        />
                                    </div>
                                </CarouselItem>
                                <CarouselItem>
                                    <div className="carousel-content">
                                        <ItemList
                                            itemList={incomes}
                                            bottomHalfRef={null}
                                            handleScroll={null}
                                            handleDelete={null}
                                            updateListItem={null}
                                            expCategory={expCategories}
                                            incCategory={incCategories}
                                            trnCategory={trnCategories}
                                            accounts={accounts}
                                        />
                                    </div>
                                </CarouselItem>
                            </CarouselContainer>
                        ) : (
                            <CirclesWithBar
                                height="100"
                                width="100"
                                color="#4fa94d"
                                wrapperStyle={{}}
                                wrapperClass=""
                                visible={true}
                                outerCircleColor=""
                                innerCircleColor=""
                                barColor=""
                                ariaLabel='circles-with-bar-loading'
                            />
                        )
                    }
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default AccountDetail;