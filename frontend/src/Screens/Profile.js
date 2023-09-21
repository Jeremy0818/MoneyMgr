import React, { useState } from 'react';
import { RedirectModal } from './RedirectModal';
import { useAuth } from '../Utils/AuthContext';

function Profile() {
    const [showHRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectModalContent, setRedirectModalContent] = useState('');
    const [redirectPath, setRedirectPath] = useState('/');
    const { user, isAuthenticated } = useAuth();

    const handleRedirect = () => {
        setRedirectModalContent("Redirecting to landing page...");
        setShowRedirectModal(true);
    }

    return (
        <div>
            <h1>Profile</h1>
            {isAuthenticated() ? (
                <div>
                    <p>Hello, {user.userInfo.username}!</p>
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

export default Profile;