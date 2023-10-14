import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Community({setTitle, setShowBackButton, setShowDoneButton, setHandleBack, setHandleDone}) {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setTitle("Community");
        setShowBackButton(false);
        setShowDoneButton(false);
        setHandleBack({func: null});
        setHandleDone({func: null});
    }, []);

    return (
        <div>
            { isAuthenticated() ? (
                <div>
                    <h1>Welcome</h1>
                    <p>Feed</p>
                    <p>Achievement</p>
                    <p>Share</p>
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Community;