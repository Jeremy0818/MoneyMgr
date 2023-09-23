import React, { useState } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Profile() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <h1>Profile</h1>
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