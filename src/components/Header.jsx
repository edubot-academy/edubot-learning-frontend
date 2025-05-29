import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/icons/Logo.svg";
import { AuthContext } from "../context/AuthContext";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";

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

const NavLinks = ({ user, onClick, textColor }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? "text-orange-400" : textColor;

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
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [isLightBackground, setIsLightBackground] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const languageMenuRef = useRef(null);
    const headerRef = useRef(null);
    const navigate = useNavigate();

    useClickOutside(profileRef, () => setProfileMenuOpen(false));
    useClickOutside(mobileMenuRef, () => setMenuOpen(false));
    useClickOutside(languageMenuRef, () => setLanguageMenuOpen(false));

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
    }, [menuOpen]);

    useEffect(() => {
        const checkBackgroundColor = () => {
            const rect = headerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const el = document.elementFromPoint(rect.left + 1, rect.bottom + 1);
            if (!el) return;
            const bgColor = window.getComputedStyle(el).backgroundColor;
            const isLight = isLightColor(bgColor);
            setIsLightBackground(isLight);
        };

        checkBackgroundColor();
        window.addEventListener("scroll", checkBackgroundColor);
        window.addEventListener("resize", checkBackgroundColor);
        return () => {
            window.removeEventListener("scroll", checkBackgroundColor);
            window.removeEventListener("resize", checkBackgroundColor);
        };
    }, []);

    const isLightColor = (color) => {
        const match = color.match(/\d+/g);
        if (!match) return false;
        const [r, g, b] = match.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 160;
    };

    const textColor = isLightBackground ? "text-[#122144]" : "text-white";

    const handleLinkClick = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <header ref={headerRef} className="fixed w-full z-30 bg-transparent transition-colors duration-300">
            <div className="w-full px-8 py-6 flex justify-between">
                <div className="flex items-center gap-[60px]">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={Logo} alt="Edubot Learning Logo" className="w-[67px]" />
                        <div translate="no" className="flex flex-col">
                            <span className="text-2xl font-extrabold text-orange-500 leading-none">EDUBOT</span>
                            <span className={`text-base tracking-widest font-medium ${textColor}`}>LEARNING</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex gap-[8px] lg:space-x-8 flex-wrap">
                        <NavLinks user={user} textColor={textColor} />
                    </nav>
                </div>
                <div className="flex items-center lg:gap-[33px] md:gap-2 gap-[20px]">
                    <div className="hidden md:flex items-center space-x-6">
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
                            <div className="flex items-center gap-[8px] lg:gap-[28px]">
                                <IoSearchOutline className="text-white w-[40px] h-[40px] bg-[#122144] p-2.5 rounded-full cursor-pointer hover:text-orange-600" />
                                <MdOutlineShoppingCart className="w-[23px] h-[23px] text-[#F97316] cursor-pointer hover:text-[#0EA78B]" />
                                <div className="lg:space-x-4 space-x-1">
                                    <Link to="/login" className={`${textColor} hover:text-orange-400 transition`}>Логин</Link>
                                    <Link to="/register" className="bg-orange-500 text-white px-6 py-3.5 rounded-full hover:bg-orange-600 transition">Катталуу</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="md:hidden focus:outline-none menu-toggle"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FaTimes className={`text-2xl ${textColor}`} /> : <FaBars className={`text-2xl ${textColor}`} />}
                    </button>
                    <GrLanguage onClick={() => setLanguageMenuOpen(!languageMenuOpen)} className={`${textColor} w-[23px] h-[23px] cursor-pointer hover:text-orange-400`} />
                </div>
            </div>
            {menuOpen && (
                <div ref={mobileMenuRef} className="md:hidden bg-[#1c3a3e] shadow-md py-4 flex flex-col items-center space-y-4 w-full mobile-menu transition-all duration-300 transform scale-100 opacity-100">
                    {user && <Link to="/profile" onClick={() => handleLinkClick('/profile')} className="block px-4 py-2 text-white hover:text-orange-400">Профиль</Link>}
                    <NavLinks user={user} onClick={() => setMenuOpen(false)} textColor="text-white" />
                    <Link to="/" className={`text-white hover:text-orange-400 transition`}>Издөө</Link>
                    <Link to="/" className={`text-white hover:text-orange-400 transition`}>Себет</Link>
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
            {languageMenuOpen && (
                <div ref={languageMenuRef} className="absolute bg-orange-500 w-[50px] top-[100px] right-[20px] grid text-center py-1 rounded-lg">
                    <strong onClick={() => setLanguageMenuOpen(false)} className="text-white hover:text-[#1c3a3e] transition cursor-pointer">RU</strong>
                    <strong onClick={() => setLanguageMenuOpen(false)} className="text-white hover:text-[#1c3a3e] transition cursor-pointer">EN</strong>
                    <strong onClick={() => setLanguageMenuOpen(false)} className="text-white hover:text-[#1c3a3e] transition cursor-pointer">KG</strong>
                </div>
            )}
        </header>
    );
};

export default Header;
