import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Utils/AuthContext';
import Home from './Screens/Home';
import Profile from './Screens/Profile';
import Landing from './Screens/Landing';
import Login from './Screens/Login';
import Register from './Screens/Register';
import Analytic from './Screens/Analytic';
import Personal from './Screens/Personal';
import NotFound from './Screens/NotFound';
import BottomNavBar from './Screens/BottomNavBar';

const App = () => {

    return (
        <div className="App">
            <AuthProvider>
                <Router>
                    <BottomNavBar />
                    <div>
                        <Routes>
                            <Route exact path="/" element={<Landing />} />
                            <Route path="/index" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/personal" element={<Personal />} />
                            <Route path="/analytic" element={<Analytic />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </div>
    );
};

export default App;
