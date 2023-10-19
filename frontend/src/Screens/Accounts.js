import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';
import { getAccountBalance } from '../Utils/RequestHelper';

function Accounts({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
    const [accounts, setAccounts] = useState([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Accounts");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({ func: null });
        setHandleDone({ func: null });

        getAccountInfo();
    }, []);

    const getAccountInfo = async () => {
        const { data, error } = await getAccountBalance();
        console.log(data.data);
        setAccounts(data.data);
    }

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    {accounts.map((account, index) => (
                        <div>
                            <p>{account.account_name}: {account.balance}</p>
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