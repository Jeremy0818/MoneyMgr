import React from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { useAuth } from '../Utils/AuthContext'; // Adjust the import path
import '../NavBar.css';
import { FaHome, FaUser, FaMoneyBill, FaChartBar, FaPlusCircle } from 'react-icons/fa';

export default function NavBar({ toggleMenu }) {
    const { isAuthenticated } = useAuth();


    // Render the navigation bar only if the user is logged in
    if (!isAuthenticated()) {
        return null; // Don't render anything if the user is not logged in
    }

    return (
        <Navbar className="navbar-container" bg="light" variant="light">
            <Nav className="nav-item">
                <NavLink to="/home" className="nav-link">
                    <FaHome />
                    <span className="nav-label">Home</span>
                </NavLink>
            </Nav>
            <Nav className="nav-item">
                <NavLink to="/personal" className="nav-link">
                    <FaMoneyBill />
                    <span className="nav-label">Personal</span>
                </NavLink>
            </Nav>
            <Nav className="nav-item">
                <NavLink className="nav-link plus" onClick={toggleMenu}>
                    <FaPlusCircle />
                </NavLink>
            </Nav>
            <Nav className="nav-item">
                <NavLink to="/analytic" className="nav-link">
                    <FaChartBar />
                    <span className="nav-label">Analytic</span>
                </NavLink>
            </Nav>
            <Nav className="nav-item">
                <NavLink to="/profile" className="nav-link">
                    <FaUser />
                    <span className="nav-label">Profile</span>
                </NavLink>
            </Nav>
        </Navbar>
    );
}