import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Analytic({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Analytic");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({ func: null });
        setHandleDone({ func: null });
    }, []);

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <p>Chart:</p>
                    <p>pie chart</p>
                    <p>list of expense</p>
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Analytic;