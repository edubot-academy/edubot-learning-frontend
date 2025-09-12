import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/images/logotip-hero.png"
import { IoSearch } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { AuthContext } from "../context/AuthContext";

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        return () => document.removeEventListener("mousedown", listener);
    }, [ref, handler]);
};

const NavLinks = ({ user, onClick }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? "text-orange-400" : "text-white";

    return (
        <>
            <Link to="/courses" onClick={onClick} className={`${isActive("/courses")} hover:text-orange-400 transition`}>Курстар</Link>
            <Link to="/about" onClick={onClick} className={`${isActive("/about")} hover:text-orange-400 transition`}>Биз жөнүндө</Link>
            <Link to="/contact" onClick={onClick} className={`${isActive("/contact")} hover:text-orange-400 transition`}>Байланыш</Link>
            {user?.role === "instructor" && <Link to="/instructor" onClick={onClick} className={`${isActive("/instructor")} hover:text-orange-400 transition`}>Инструктор</Link>}
            {user?.role === "admin" && <Link to="/admin" onClick={onClick} className={`${isActive("/admin")} hover:text-orange-400 transition`}>Админ</Link>}
            {user?.role === "sales" && <Link to="/sales-manager" onClick={onClick} className={`${isActive("/sales-manager")} hover:text-orange-400 transition`}>Сатуу</Link>}
            {user?.role === "assistant" && <Link to="/assistant" onClick={onClick} className={`${isActive("/assistant")} hover:text-orange-400 transition`}>Ассистент</Link>}
        </>
    );
};

const Header = ({ cart = [] }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navigate = useNavigate();

    useClickOutside(profileRef, () => setProfileMenuOpen(false));
    useClickOutside(mobileMenuRef, () => setMenuOpen(false));

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
    }, [menuOpen]);

    const handleLinkClick = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <header className="fixed w-full z-30 bg-[--edubot-darkgreen]">
            <div className="w-full xl:px-[80px] sm:pt-[33px] px-[14px] pt-[14px] flex items-center justify-between">
                <div className="flex items-center gap-[60px]">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={Logo} alt="Edubot Learning Logo" className="w-[67.42936706542969px] h-[55px]" />
                        <div translate="no" className="flex flex-col">
                            <span className="text-2xl font-extrabold text-orange-500 leading-none">EDUBOT</span>
                            <span className="text-sm font-medium tracking-widest text-white ">LEARNING</span>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex space-x-8 text-left">
                        <NavLinks user={user} />
                    </nav>
                </div>
                <div className="flex items-center space-x-6">

                    <IoSearch className="hidden md:flex w-[49px] h-[49px] text-white bg-[--edubot-dark] p-[14px] rounded-full cursor-pointer" />
                    <MdOutlineShoppingCart className="w-[23.33333396911621px] h-[23.33333396911621px] text-[--edubot-orange] cursor-pointer"/>
                    <div className="hidden lg:flex items-center space-x-6">
                        {user ? (
                            <div className="relative profile-menu" ref={profileRef}>
                                <button
                                    aria-label="User menu"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white font-bold rounded-full text-lg hover:bg-orange-600 transition"
                                >
                                    <FaUserCircle className="text-2xl" />
                                </button>
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Профиль</Link>
                                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Чыгуу</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-white hover:text-orange-400 transition">Логин</Link>
                                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition w-[135px] h-[50px]">Катталуу</Link>
                            </div>
                        )}
                    </div>

                    <GrLanguage className="w-[21.86333465576172px] h-[23.2166690826416px] text-white cursor-pointer"/>
                    
                    <button
                    className="lg:hidden text-white focus:outline-none menu-toggle"
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                </button>
                </div>
                
            </div>
            {menuOpen && (
                <div ref={mobileMenuRef} className="md:hidden bg-[#1c3a3e] shadow-md py-4 flex flex-col items-center space-y-4 w-full mobile-menu transition-all duration-300 transform scale-100 opacity-100">
                    {user && <Link to="/profile" onClick={() => handleLinkClick('/profile')} className="block px-4 py-2 text-white hover:text-orange-400">Профиль</Link>}
                    <NavLinks user={user} onClick={() => setMenuOpen(false)} />
                    {!user ? (
                        <div className="flex flex-col space-y-2 w-full px-6">
                            <Link to="/login" onClick={() => handleLinkClick('/login')} className="text-white hover:text-orange-400 transition font-semibold text-lg text-center">Логин</Link>
                            <Link to="/register" onClick={() => handleLinkClick('/register')} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-600 transition">Катталуу</Link>
                        </div>
                    ) : (
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="text-white hover:text-orange-400 transition">Чыгуу</button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
