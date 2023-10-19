import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Home({ setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone }) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Home");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({ func: null });
        setHandleDone({ func: null });
    }, []);

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <h2>Reminders</h2>
                    <h2>Budget</h2>
                    <h2>Goals</h2>
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Home;