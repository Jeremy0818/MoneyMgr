import React, { useState } from "react";
import { RedirectModal } from './RedirectModal';
import { useAuth } from '../Utils/AuthContext';
import { ThreeCircles } from 'react-loader-spinner';

function LoggedOut() {
    const [showHRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectModalContent, setRedirectModalContent] = useState('');
    const [redirectPath, setRedirectPath] = useState('/');
    const { isLoading } = useAuth();

    const handleRedirect = () => {
        setRedirectModalContent("Redirecting to landing page...");
        setShowRedirectModal(true);
    }

    return (
        <div>
            {isLoading ? (
                <ThreeCircles
                    height="100"
                    width="100"
                    color="#4fa94d"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel="three-circles-rotating"
                    outerCircleColor=""
                    innerCircleColor=""
                    middleCircleColor=""
                />
            ) : (
                <div>
                    <p>You are logged out.</p>
                    <button onClick={handleRedirect}>Login</button>
                    <RedirectModal
                        show={showHRedirectModal}
                        content={redirectModalContent}
                        redirectPath={redirectPath} />
                </div >
            )}
        </div>
    )
}

export { LoggedOut };