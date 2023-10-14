import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Personal({setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone}) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Personal");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({func: null});
        setHandleDone({func: null});
    }, []);

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <p>Accounts:</p>
                    <p>Cash</p>
                    <p>Saving Account</p>
                    <p>Credit Card</p>
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Personal;