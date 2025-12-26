import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { GrLanguage } from 'react-icons/gr';
import ThemeToggle from '@shared-ui/ThemeToggle';
import { BsChevronDown, BsSun, BsMoon } from 'react-icons/bs';
import { CiSearch } from 'react-icons/ci';
import EduBotLogo from '@assets/images/edubot-signup.png';

import { IoHeartOutline } from 'react-icons/io5';
import { BsCart2 } from 'react-icons/bs';
import { FaRegUser } from 'react-icons/fa';

import { AuthContext } from '@app/providers';
import { searchCourses } from '@services/api';
import SideBar from '@shared-ui/SideBar';
import SidebarOverlay from '@shared-ui/SidebarOverlay';
import UserMenuDropdown from '@shared-ui/UserMenuDropdown';
import { useCart } from '../context/CartContext';

const NavLinks = ({ isMobile, user }) => {
    const location = useLocation();
    const active = (path) => (location.pathname === path ? 'text-orange-500' : '');

    const linkClass =
        "hover:text-black after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-black after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300";

    return (
        <div
            className={
                isMobile ? 'flex flex-col space-y-4 mt-4' : 'flex space-x-14 items-center mr-[70px]'
            }
        >
            <Link to="/courses" className={`${active('/courses')} ${linkClass}`}>
                Курстар
            </Link>
            <Link to="/about" className={`${active('/about')} ${linkClass}`}>
                Биз жөнүндө
            </Link>
            <Link to="/contact" className={`${active('/contact')} ${linkClass}`}>
                Байланыш
            </Link>

            {user && user.role === 'instructor' && (
                <Link to="/instructor" className={`${active('/instructor')} ${linkClass}`}>
                    Инструктор
                </Link>
            )}
            {user && user.role === 'admin' && (
                <Link to="/admin" className={`${active('/admin')} ${linkClass}`}>
                    Админ
                </Link>
            )}
            {user && user.role === 'assistant' && (
                <Link to="/assistant" className={`${active('/assistant')} ${linkClass}`}>
                    Ассистент
                </Link>
            )}
            {user && user.role === 'student' && (
                <Link to="/student" className={`${active('/student')} ${linkClass}`}>
                    Студент
                </Link>
            )}
        </div>
    );
};

const Header = () => {
    const { getUniqueItemsCount } = useCart();
    const cartItemsCount = getUniqueItemsCount(); // Счетчик для всех

    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [positionBar, setPositionBar] = useState(false);
    const [search, setSearch] = useState('');
    const [langOpen, setLangOpen] = useState(false);
    const [lang, setLang] = useState('Кыргызча');
    const [dark, setDark] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeIcon, setActiveIcon] = useState(null);

    const langRef = useRef(null);
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        if (location.pathname === '/cart') {
            setActiveIcon('cart');
        } else {
            setActiveIcon(null);
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
    }, [dark]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const q = search.trim();
        if (!q) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
        setMenuOpen(false);
        setSearchOpen(false);
    };

    const handleSearch = async (value) => {
        setSearch(value);

        if (value.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        try {
            const data = await searchCourses(value);
            setResults(data);
            setShowDropdown(true);
        } catch (error) {
            setResults([]);
            setShowDropdown(false);
        }
    };

    const handleIconClick = (iconName, callback) => {
        setActiveIcon(iconName);
        if (callback) callback();
    };

    return (
        <header className="sticky top-0 w-full bg-white dark:bg-white shadow z-50">
            <div className="px-4 md:px-10 py-3">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between">
                    {/* Logo + Search */}
                    <div className="flex items-center flex-1">
                        <Link to="/" className="flex items-center">
                            <div className="h-16 w-16 md:h-20 md:w-20">
                                <img
                                    src={EduBotLogo}
                                    alt="EduBot Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col ml-3">
                                <span className="text-2xl font-bold text-orange-500">EDUBOT</span>
                                <span className="text-base -mt-2 text-gray-700 dark:text-gray-700 tracking-[0.14em]">
                                    LEARNING
                                </span>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div
                            className="flex items-center border rounded overflow-hidden hover:border-[#F06743]  flex-1 max-w-xs ml-6 border-[#7B818C] dark:border-[#7B818C]"
                            ref={searchContainerRef}
                        >
                            <IoSearch className="w-5 h-5 ml-2 text-[#7B818C] dark:text-[#7B818C]" />
                            <input
                                type="text"
                                placeholder="Издөө"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => search.length >= 2 && setShowDropdown(true)}
                                className="px-3 py-2 focus:outline-none bg-transparent w-full text-base dark:text-gray-700"
                            />

                            {/* Search Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-full mt-2 w-full mt-[-24px] max-w-xs bg-white border-[border: 1px solid oklch(86.72% .0192 282.72deg);] dark:bg-white shadow-xl   z-50 max-h-64 overflow-y-auto">
                                    {results.length > 0 ? (
                                        results.map((course) => (
                                            <button
                                                key={course.id}
                                                onClick={() => {
                                                    navigate(`/courses/${course.id}`);
                                                    setShowDropdown(false);
                                                    setSearch('');
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                                            >
                                                <div className="font-semibold text-sm text-gray-900">
                                                    {course.title}
                                                </div>
                                                {course.description && (
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                        {course.description}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                            Натыйжа жок
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="flex items-center space-x-6 mx-6">
                        <NavLinks isMobile={false} user={user} />
                    </div>

                    {/* Right Side Actions - Desktop */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen((p) => !p)}
                                className="flex items-center space-x-1 p-2"
                            >
                                <GrLanguage className="text-gray-700 dark:text-gray-700 w-5 h-5" />
                                <BsChevronDown
                                    className={`w-4 h-4 text-gray-700 dark:text-gray-700 transform transition-transform duration-300 ${langOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 mt-2 bg-white dark:bg-white shadow rounded z-50">
                                    {['Кыргызча', 'Русский', 'English'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => {
                                                setLang(l);
                                                setLangOpen(false);
                                            }}
                                            className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-100 dark:text-gray-700 text-sm"
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative top-[-12px]">
                            <ThemeToggle dark={dark} setDark={setDark} />
                        </div>

                        {/* User Actions */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Иконка сердца */}
                                <button
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${activeIcon === 'heart'
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'border-black hover:border-gray-600'
                                        }`}
                                    onClick={() => handleIconClick('heart')}
                                >
                                    <IoHeartOutline
                                        className={`w-5 h-5 transition-colors duration-300 ${activeIcon === 'heart' ? 'text-white' : 'text-black'
                                            }`}
                                    />
                                </button>

                                {/* Иконка корзины */}
                                <div className="relative">
                                    <button
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${activeIcon === 'cart' || location.pathname === '/cart'
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-black hover:border-gray-600'
                                            }`}
                                        onClick={() =>
                                            handleIconClick('cart', () => navigate('/cart'))
                                        }
                                    >
                                        <BsCart2
                                            className={`w-5 h-5 transition-colors duration-300 ${activeIcon === 'cart' ||
                                                    location.pathname === '/cart'
                                                    ? 'text-white'
                                                    : 'text-black'
                                                }`}
                                        />

                                        {/* Бейдж с количеством - показывается всегда если есть товары */}
                                        {cartItemsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                                {cartItemsCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Иконка пользователя */}
                                <div className="relative group">
                                    <button
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${activeIcon === 'user' || userMenuOpen
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-black hover:border-gray-600'
                                            }`}
                                        onClick={() => {
                                            handleIconClick('user');
                                            setUserMenuOpen(!userMenuOpen);
                                        }}
                                    >
                                        <FaRegUser
                                            className={`w-5 h-5 transition-colors duration-300 ${activeIcon === 'user' || userMenuOpen
                                                    ? 'text-white'
                                                    : 'text-black'
                                                }`}
                                        />
                                    </button>

                                    <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible lg:group-hover:opacity-100 lg:group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                                        <div className="relative">
                                            <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>
                                            <UserMenuDropdown user={user} onClose={() => { }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {/* Иконка корзины для неавторизованных */}
                                <div className="relative">
                                    <button
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${activeIcon === 'cart' || location.pathname === '/cart'
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-black hover:border-gray-600'
                                            }`}
                                        onClick={() =>
                                            handleIconClick('cart', () => navigate('/cart'))
                                        }
                                    >
                                        <BsCart2
                                            className={`w-5 h-5 transition-colors duration-300 ${activeIcon === 'cart' ||
                                                    location.pathname === '/cart'
                                                    ? 'text-white'
                                                    : 'text-black'
                                                }`}
                                        />

                                        {cartItemsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                                {cartItemsCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <Link to="/login">
                                    <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                                        Кирүү
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden">
                    {/* Top Row - Burger Menu, Logo, Search Icon */}
                    <div className="flex items-center justify-between">
                        {/* Burger Menu - Left */}
                        <button
                            onClick={() => {
                                setMenuOpen(true);
                                setPositionBar(false);
                            }}
                            className="text-gray-700 dark:text-gray-700 text-2xl"
                        >
                            <FaBars />
                        </button>

                        {/* Logo - Center */}
                        <Link to="/" className="flex flex-col items-center">
                            <div className="h-12 w-12">
                                <img
                                    src={EduBotLogo}
                                    alt="EduBot Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col items-center mt-1">
                                <span className="text-lg font-bold text-orange-500">EDUBOT</span>
                                <span className="text-xs -mt-1 text-gray-700 dark:text-gray-700 tracking-[0.14em]">
                                    LEARNING
                                </span>
                            </div>
                        </Link>

                        {/* Right Side - Search */}
                        <div className="flex items-center gap-3">
                            {/* Search Icon */}
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="text-gray-700 dark:text-gray-700 text-2xl"
                            >
                                <IoSearch />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Input */}
                    {searchOpen && (
                        <div className="mt-3" ref={searchContainerRef}>
                            <div className="flex items-center border rounded overflow-hidden border-[#7B818C] dark:border-[#7B818C]">
                                <IoSearch className="w-5 h-5 ml-2 text-[#7B818C] dark:text-[#7B818C]" />
                                <input
                                    type="text"
                                    placeholder="Издөө"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => search.length >= 2 && setShowDropdown(true)}
                                    className="px-3 py-2 focus:outline-none bg-transparent w-full text-base dark:text-gray-700"
                                />
                            </div>

                            {/* Mobile Search Dropdown */}
                            {showDropdown && (
                                <div className="absolute left-0 right-0 mt-1 mx-4 z-50">
                                    {results.length > 0 ? (
                                        <div className="bg-white dark:bg-white shadow-lg border rounded max-h-64 overflow-y-auto">
                                            {results.map((course) => (
                                                <button
                                                    key={course.id}
                                                    onClick={() => {
                                                        navigate(`/courses/${course.id}`);
                                                        setShowDropdown(false);
                                                        setSearch('');
                                                        setSearchOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-semibold text-sm text-gray-900">
                                                        {course.title}
                                                    </div>
                                                    {course.description && (
                                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                            {course.description}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-white shadow-lg border rounded p-4 text-sm text-gray-500">
                                            Натыйжа жок
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SideBar Overlays */}
            <SidebarOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} position="left">
                <SideBar
                    setMenuOpen={setMenuOpen}
                    setPosition={setPositionBar}
                    handleIconClick={handleIconClick}
                />
            </SidebarOverlay>

            <SidebarOverlay
                isOpen={positionBar}
                onClose={() => setPositionBar(false)}
                position="right"
            >
                <SideBar
                    setMenuOpen={setMenuOpen}
                    setPosition={setPositionBar}
                    handleIconClick={handleIconClick}
                />
            </SidebarOverlay>
        </header>
    );
};

export default Header;
