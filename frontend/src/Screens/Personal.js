import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Personal() {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <h1>Personal</h1>
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