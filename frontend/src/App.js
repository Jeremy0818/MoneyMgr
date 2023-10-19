import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Utils/AuthContext';
import Home from './Screens/Home';
import Profile from './Screens/Profile';
import Landing from './Screens/Landing';
import Login from './Screens/Login';
import Register from './Screens/Register';
import Analytic from './Screens/Analytic';
import Accounts from './Screens/Accounts';
import NotFound from './Screens/NotFound';
import NavBar from './NavBar';
import SlidingMenu from './SlidingMenu';
import ImageScan from './Screens/ImageScan';
import Community from './Screens/Community';
import Header from './Header';

const App = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [showBackButton, setShowBackButton] = useState(false);
    const [showDoneButton, setShowDoneButton] = useState(false);
    const [handleBack, setHandleBack] = useState({func: null});
    const [handleDone, setHandleDone] = useState({func: null});

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
        <div className="App">
            <AuthProvider>
                <Router>
                    <Header
                        title={title}
                        showBackButton={showBackButton}
                        showDoneButton={showDoneButton}
                        onBack={handleBack}
                        onDone={handleDone}
                    />
                    <NavBar toggleMenu={toggleMenu} />
                    <SlidingMenu isOpen={isMenuOpen} onClose={toggleMenu} />
                    <div>
                        <Routes>
                            <Route exact path="/" element={<Landing />} />
                            <Route path="/index" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/home" element={
                                <Home
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="/profile" element={
                                <Profile
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="/accounts" element={
                                <Accounts
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="/analytic" element={
                                <Analytic
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="/community" element={
                                <Community
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="/imagescan" element={
                                <ImageScan
                                    setTitle={setTitle}
                                    setShowBackButton={setShowBackButton}
                                    setShowDoneButton={setShowDoneButton}
                                    setHandleBack={setHandleBack}
                                    setHandleDone={setHandleDone}
                                />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </div>
    );
};

export default App;
