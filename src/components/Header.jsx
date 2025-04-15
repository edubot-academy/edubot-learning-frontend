import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/images/edubot-logo.jpeg";
import { AuthContext } from "../context/AuthContext";

const Header = ({ cart = [] }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        const closeDropdown = (e) => {
            if (!e.target.closest(".profile-menu")) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("click", closeDropdown);
        return () => document.removeEventListener("click", closeDropdown);
    }, []);

    return (
        <header className="fixed w-full z-20 bg-[#1c3a3e] shadow-md">
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3">
                    <img src={Logo} alt="Edubot Learning Logo" className="h-10" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-extrabold text-orange-500 leading-none">EDUBOT</span>
                        <span className="text-sm font-bold tracking-widest text-white">LEARNING</span>
                    </div>
                </Link>
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                </button>
                <nav className="hidden md:flex space-x-8">
                    <Link to="/courses" className="text-white hover:text-orange-400 transition">Курстар</Link>
                    <Link to="/about" className="text-white hover:text-orange-400 transition">Биз жөнүндө</Link>
                    <Link to="/contact" className="text-white hover:text-orange-400 transition">Байланыш</Link>
                    {user && user.role === "instructor" && (
                        <Link to="/instructor" className="text-white hover:text-orange-400 transition">
                            Инструктор
                        </Link>
                    )}
                    {user && user.role === "admin" && (
                        <Link to="/admin" className="text-white hover:text-orange-400 transition">
                            Админ
                        </Link>
                    )}
                    {user && user.role === "sales" && (
                        <Link to="/sales-manager" className="text-white hover:text-orange-400 transition">
                            Сатуу
                        </Link>
                    )}
                </nav>
                <div className="hidden md:flex items-center space-x-6">
                    {/* <Link to="/cart" className="relative">
                        <FaShoppingCart className="text-white text-2xl hover:text-orange-400 transition" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                        )}
                    </Link> */}
                    {user ? (
                        <div className="relative profile-menu">
                            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white font-bold rounded-full text-lg hover:bg-orange-600 transition">
                                <FaUserCircle className="text-2xl" />
                            </button>
                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Профиль</Link>
                                    {/* <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Башкаруу панели</Link> */}
                                    <button onClick={() => logout()} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Чыгуу</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="text-white hover:text-orange-400 transition">Логин</Link>
                            <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition">Катталуу</Link>
                        </div>
                    )}
                </div>
            </div>
            {menuOpen && (
                <div className="md:hidden bg-[#1c3a3e] shadow-md py-4 flex flex-col items-center space-y-4 w-full">
                    <Link to="/profile" className="block px-4 py-2 text-white hover:text-orange-400">Профиль</Link>
                    <Link to="/courses" className="text-white hover:text-orange-400 transition">Курстар</Link>
                    <Link to="/about" className="text-white hover:text-orange-400 transition">Биз жөнүндө</Link>
                    <Link to="/contact" className="text-white hover:text-orange-400 transition">Байланыш</Link>
                    {user && user.role === "instructor" && (
                        <Link to="/instructor" className="text-white hover:text-orange-400 transition">
                            Инструктор
                        </Link>
                    )}
                    {user && user.role === "admin" && (
                        <Link to="/admin" className="text-white hover:text-orange-400 transition">
                            Админ
                        </Link>
                    )}
                    {user && user.role === "sales" && (
                        <Link to="/sales-manager" className="text-white hover:text-orange-400 transition">
                            Сатуу
                        </Link>
                    )}
                    {/* {user && user.role === "student" && (
                        <Link to="/dashboard" className="block px-4 py-2 text-white hover:text-orange-400">Башкаруу панели</Link>
                    )} */}
                    <Link to="/cart" className="text-white hover:text-orange-400 transition font-semibold text-lg">Себет ({cart.length})</Link>
                    {!user ? (
                        <div className="flex flex-col space-y-2 w-full px-6">
                            <Link to="/login" className="text-white hover:text-orange-400 transition font-semibold text-lg text-center">Логин</Link>
                            <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-600 transition">Катталуу</Link>
                        </div>
                    ) : (
                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-100">Чыгуу</button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
