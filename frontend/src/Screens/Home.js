import React, { useState } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            { isAuthenticated() ? (
                <div>
                    <h1>Welcome to the Home Page</h1>
                    <p>Reminders</p>
                    <p>Budget</p>
                    <p>Goals</p>
                </div>
            ) : (
                <LoggedOut />
            )}

        </div>
    )
}

export default Home;