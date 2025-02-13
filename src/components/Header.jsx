import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/images/edubot-logo.jpeg";

const Header = ({ user, cart = [] }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    return (
        <header className="fixed w-full z-20 bg-white shadow-md">
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <img src={Logo} alt="Edubot Learning Logo" className="h-10" />
                    <span className="text-2xl font-bold text-blue-600">Edubot Learning</span>
                </Link>
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                </button>
                <nav className="hidden md:flex space-x-8">
                    <Link to="/features" className="text-gray-700 hover:text-blue-600 transition">Features</Link>
                    <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition">Courses</Link>
                    <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
                    {user && user.isInstructor && (
                        <Link to="/instructor" className="text-gray-700 hover:text-blue-600 transition">
                            Instructor Dashboard
                        </Link>
                    )}
                </nav>
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/cart" className="relative">
                        <FaShoppingCart className="text-gray-700 text-2xl hover:text-blue-600 transition" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                        )}
                    </Link>
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                                <FaUserCircle className="text-2xl" />
                                <span>{user.name}</span>
                            </button>
                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
                                    <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
            {menuOpen && (
                <div className="md:hidden bg-white shadow-md py-4 flex flex-col items-center space-y-4 w-full">
                    <Link to="/features" className="text-gray-700 hover:text-blue-600 transition">Features</Link>
                    <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition">Courses</Link>
                    <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
                    <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition font-semibold text-lg">Cart ({cart.length})</Link>
                    {!user && (
                        <div className="flex flex-col space-y-2 w-full px-6">
                            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition font-semibold text-lg text-center">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
