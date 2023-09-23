import React, { useState, useEffect } from 'react';
import { useAuth } from '../Utils/AuthContext';
import { LoggedOut } from './LoggedOut';

function Analytic() {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            {isAuthenticated() ? (
                <div>
                    <h1>Analytic</h1>
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