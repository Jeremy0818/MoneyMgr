import React from 'react';
import logo from '../logo.jpg';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className='landing-page'>
            <img src={logo} className="App-logo" alt="logo" />
            <button onClick={() => {navigate('/login')}}>Login</button>
            <button onClick={() => {navigate('/register')}}>Register</button>
        </div>
    )
}

export default Landing;