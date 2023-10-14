import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Profile({setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone}) {
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Profile");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({func: null});
        setHandleDone({func: null});
    }, []);

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <p>Hello, {user.userInfo.username}!</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <LoggedOut />
            )}
        </div>
    )
}

export default Profile;