import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import { getAllAccount } from '../Utils/RequestHelper';
import { useNavigate } from 'react-router-dom';

function Accounts({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
    const [accounts, setAccounts] = useState([]);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle("Accounts");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({ func: null });
        setHandleDone({ func: null });

        getAccountInfo();
    }, []);

    const getAccountInfo = async () => {
        const { data, error } = await getAllAccount();
        if (error == null) {
            console.log(data.data);
            setAccounts(data.data);
        }
    }

    const goToAccount = (id) => {
        navigate("/account/"+id);
    }

    return (
        <div className='screen-container'>
            {isAuthenticated() ? (
                <div className='inner-container'>
                    {accounts.map((account, index) => (
                        <div className='rounded-container info-container' onClick={() => (goToAccount(account.id))}>
                            <div className='account-detail-container'>
                                <div className='account-name'>{account.account_name}</div>
                                <div className='account-balance'>{account.balance}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Accounts;