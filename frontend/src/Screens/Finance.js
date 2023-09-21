import React, { useState, useEffect } from 'react';
import { RedirectModal } from './RedirectModal';
import { useAuth } from '../Utils/AuthContext';

function Finance() {
    const [showHRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectModalContent, setRedirectModalContent] = useState('');
    const [redirectPath, setRedirectPath] = useState('/');
    const { user } = useAuth();

    const handleRedirect = () => {
        setRedirectModalContent("Redirecting to landing page...");
        setShowRedirectModal(true);
    }

    return (
        <div>
            <h1>Finance</h1>
            {user ? (
                <div>
                    <p>Accounts:</p>
                    <p>Cash</p>
                    <p>Saving Account</p>
                    <p>Credit Card</p>
                </div>
            ) : (
                <div>
                    <p>You are not logged in.</p>
                    <button onClick={handleRedirect}>Login</button>
                    <RedirectModal
                        show={showHRedirectModal}
                        content={redirectModalContent}
                        redirectPath={redirectPath} />
                </div>
            )}

        </div>
    )
}

export default Finance;