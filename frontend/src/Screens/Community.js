import React, { useState } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Community() {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            { isAuthenticated() ? (
                <div>
                    <h1>Welcome to the Community Page</h1>
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