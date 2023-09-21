import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Import icons from react-icons
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Utils/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState(null);
    const navigate = useNavigate();
    const { login, logout } = useAuth();

    useEffect(() => {
        logout();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();

        // Fetch the CSRF token
        fetch('/api/get-csrf-token/')
            .then((response) => response.json())
            .then((data) => {
                const csrfToken = data.csrfToken;

                // Include the CSRF token in your requests
                fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken, // Include the token in the request headers
                    },
                    body: JSON.stringify({ username, password }),
                })
                    .then(async (response) => {
                        if (response.ok) {
                            // Login successful
                            setLoginStatus('success');
                            console.log("logging in ...");
                            data = response.json().then(async (data) => {
                                // Set individual field errors
                                console.log(data.access, data.refresh, data.user);
                                await login(data.access, data.refresh, data.user);
                                navigate('/home');
                            }).catch((error) => {
                                // Handle login error
                                console.error('Login error:', error);
                                setLoginStatus('error');
                            });

                        } else {
                            // Login failed
                            setLoginStatus('error');
                        }
                    })
                    .catch((error) => {
                        // Handle login error
                        console.error('Login error:', error);
                        setLoginStatus('error');
                    });
            });
    };

    return (
        <div className='login-page'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username or Email</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username or email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {loginStatus === 'success' && (
                <span className="success-icon">
                    <p className='icon-message'>Login Successful</p> <FaCheckCircle size={32} />
                </span>
            )}
            {loginStatus === 'error' && (
                <span className="error-icon">
                    <p className='icon-message'>Login Failed</p> <FaTimesCircle size={32} />
                </span>
            )}
        </div>
    );
}

export default Login;
