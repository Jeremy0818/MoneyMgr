import React, { useState } from 'react';
import { RedirectModal } from './RedirectModal';
import { useAuth } from '../Utils/AuthContext';

function Home() {
    const [showHRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectModalContent, setRedirectModalContent] = useState('');
    const [redirectPath, setRedirectPath] = useState('/');
    const { isAuthenticated } = useAuth();

    const handleRedirect = () => {
        setRedirectModalContent("Redirecting to landing page...");
        setShowRedirectModal(true);
    }

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            { isAuthenticated() ? (
                <div>
                    <p>Reminders</p>
                    <p>Budget</p>
                    <p>Goals</p>
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

export default Home;