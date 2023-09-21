import React, { useState } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Profile() {
    const { user, isAuthenticated } = useAuth();

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <h1>Profile</h1>
                    <p>Hello, {user.userInfo.username}!</p>
                </div>
            ) : (
                <LoggedOut />
            )}
        </div>
    )
}

export default Profile;