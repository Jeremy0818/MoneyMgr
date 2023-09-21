import React, { useState, useEffect } from 'react';
import { RedirectModal } from './RedirectModal';
import { useAuth } from '../Utils/AuthContext';

function Analytic() {
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
            <h1>Analytic</h1>
            {user ? (
                <div>
                    <p>Chart:</p>
                    <p>pie chart</p>
                    <p>list of expense</p>
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

export default Analytic;