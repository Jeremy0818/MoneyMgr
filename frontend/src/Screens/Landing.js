import React, { useEffect } from 'react';
import logo from '../logo.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Utils/AuthContext';

function Landing() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, []);

    return (
        <div className='landing-page'>
            <img src={logo} className="App-logo" alt="logo" />
            <button onClick={() => { navigate('/login') }}>Login</button>
            <button onClick={() => { navigate('/register') }}>Register</button>
        </div>
    )
}

export default Landing;