import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { HelpModal } from './HelpModal';
import { useAuth } from '../Utils/AuthContext';
import { RedirectModal } from './RedirectModal';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [errors, setErrors] = useState({});
    const [help, setHelp] = useState({});
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [helpModalContent, setHelpModalContent] = useState('');
    const [showHRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectModalContent, setRedirectModalContent] = useState('');
    const [redirectPath, setRedirectPath] = useState('/');
    const { logout } = useAuth();

    useEffect(() => {
        logout();
        getHelpText();
    }, []);

    // Function to open the help modal
    function openHelpModal(content) {
        setHelpModalContent(content);
        setShowHelpModal(true);
    }

    // Function to close the help modal
    function closeHelpModal() {
        setShowHelpModal(false);
    }

    const getHelpText = () => {

        // Fetch the CSRF token
        fetch('/api/get-csrf-token/')
            .then((response) => response.json())
            .then((data) => {
                const csrfToken = data.csrfToken;

                // Include the CSRF token in your requests
                fetch('/api/register/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                })
                    .then((response) => {
                        if (response.ok) {
                            response.json().then((data) => {
                                // Set individual field errors
                                setHelp(data.help || {});
                            });
                        }
                    })
                    .catch((error) => {
                        // Handle registration error
                        console.error('get help text error:', error);
                    });
            });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // Fetch the CSRF token
        fetch('/api/get-csrf-token/')
            .then((response) => response.json())
            .then((data) => {
                const csrfToken = data.csrfToken;

                const requestBody = {
                    username: username,
                    email: email,
                    password1: password1,
                    password2: password2,
                };

                // Include the CSRF token in your requests
                fetch('/api/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify(requestBody),
                })
                    .then((response) => {
                        if (response.ok) {
                            // Registration successful
                            setRegistrationStatus('success');
                            setTimeout(() => handleRedirect(), 1000);
                        } else {
                            // Registration failed
                            setRegistrationStatus('error');
                            response.json().then((data) => {
                                // Set individual field errors
                                setErrors(data.error || {});
                                setHelp(data.help || {});
                            });
                        }
                    })
                    .catch((error) => {
                        // Handle registration error
                        console.error('Registration error:', error);
                        setRegistrationStatus('error');
                    });
            });
    };

    function toggleModal(fieldName) {
        openHelpModal(help[fieldName]);
    }

    const handleRedirect = () => {
        setRedirectModalContent("Redirecting to landing page...");
        setShowRedirectModal(true);
    }

    return (
        <div className="register-page">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label htmlFor="username">
                        Username
                        {help.username && <span className="question-icon" onClick={() => toggleModal('username')}>
                            <FaInfoCircle />
                        </span>}
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </div>
                {errors.username && (
                    <p className="error-message">{errors.username[0].message}</p>
                )}

                <div className="form-group">
                    <label htmlFor="email">
                        Email
                        {help.email && <span className="question-icon" onClick={() => toggleModal('email')}>
                            <FaInfoCircle />
                        </span>}
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                {errors.email && (
                    <p className="error-message">{errors.email[0].message}</p>
                )}

                <div className="form-group">
                    <label htmlFor="password1">
                        Password
                        {help.password1 && <span className="question-icon" onClick={() => toggleModal('password1')}>
                            <FaInfoCircle />
                        </span>}
                    </label>
                    <input
                        type="password"
                        id="password1"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {errors.password1 && (
                    <p className="error-message">{errors.password1[0].message}</p>
                )}

                <div className="form-group">
                    <label htmlFor="password2">
                        Confirm Password
                        {help.password2 && <span className="question-icon" onClick={() => toggleModal('password2')}>
                            <FaInfoCircle />
                        </span>}
                    </label>
                    <input
                        type="password"
                        id="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                {errors.password2 && (
                    <p className="error-message">{errors.password2[0].message}</p>
                )}

                <button type="submit">Register</button>
            </form>
            {registrationStatus === 'success' && (
                <div className="success-icon">
                    <p className="icon-message">Registration Successful</p>
                    <FaCheckCircle size={32} />
                </div>
            )}
            {registrationStatus === 'error' && (
                <div className="error-icon">
                    <p className="icon-message">Registration Failed</p>
                    <FaTimesCircle size={32} />
                </div>
            )}

            <HelpModal
                show={showHelpModal}
                onClose={closeHelpModal}
                content={helpModalContent} />
            <RedirectModal
                show={showHRedirectModal}
                content={redirectModalContent}
                redirectPath={redirectPath} />
        </div>
    );
}

export default Register;
