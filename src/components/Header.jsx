import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { GrLanguage } from "react-icons/gr";
import { BsChevronDown } from "react-icons/bs";
import Logo from "../assets/images/logotip-hero.png";
import { AuthContext } from "../context/AuthContext";

const NavLinks = ({ isMobile }) => {
    const location = useLocation();
    const active = (path) =>
        location.pathname === path ? "text-orange-500" : "";

    const linkClass =
        "relative hover:text-black after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-black after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300";

    return (
        <div
            className={`${isMobile ? "flex flex-col space-y-4 mt-4" : "flex space-x-6 items-center"
                }`}
        >
            <Link to="/courses" className={`${active("/courses")} ${linkClass}`}>
                Курстар
            </Link>
            <Link to="/about" className={`${active("/about")} ${linkClass}`}>
                Биз жөнүндө
            </Link>
            <Link to="/contact" className={`${active("/contact")} ${linkClass}`}>
                Байланыш
            </Link>
        </div>
    );
};

const Header = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [langOpen, setLangOpen] = useState(false);
    const [lang, setLang] = useState("Кыргызча");
    const [dark, setDark] = useState(false);

    const langRef = useRef(null);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("dark", dark);
    }, [dark]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 w-full bg-white dark:bg-gray-900 shadow z-50">
            <div className="px-4 md:px-10 py-3 flex flex-col items-center">

                <div className="hidden lg:flex items-center justify-between w-full">

                    <div className="flex items-center gap-6 flex-1">
                        <Link to="/" className="flex items-center whitespace-nowrap">
                            <img
                                src={Logo}
                                alt="logo"
                                className="h-14 w-auto"
                            />
                            <div className="flex flex-col mt-1">
                                <span className="text-2xl md:text-2xl font-bold text-orange-500">
                                    EDUBOT
                                </span>
                                <span className="-mt-2 text-sm md:text-base text-gray-700 dark:text-gray-200 tracking-[0.14em]">
                                    LEARNING
                                </span>
                            </div>
                        </Link>


                        <div className="hidden md:flex items-center border border-black rounded overflow-hidden flex-1 max-w-[200px] ml-6">
                            <IoSearch className="w-5 h-5 ml-2 text-gray-700 dark:text-gray-200" />
                            <input
                                type="text"
                                placeholder="Издөө"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-2 focus:outline-none bg-transparent w-full"
                            />
                        </div>


                        <div className="hidden md:flex items-center ml-6">
                            <NavLinks isMobile={false} />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4 ml-auto">
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen((p) => !p)}
                                className="flex items-center space-x-1 p-2"
                            >
                                <GrLanguage className="text-gray-700 dark:text-gray-200 w-5 h-5 sm:w-6 sm:h-6" />
                                <BsChevronDown
                                    className={`w-4 h-4 text-gray-700 dark:text-gray-200 transform transition-transform duration-300 ${langOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow rounded z-50">
                                    {["Русский", "English"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => {
                                                setLang(l);
                                                setLangOpen(false);
                                            }}
                                            className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setDark((p) => !p)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${dark ? "bg-gray-700" : "bg-blue-300"
                                }`}
                        >
                            <span
                                className={`absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-300 ${dark ? "right-[2px]" : "left-[2px]"
                                    }`}
                            ></span>
                        </button>

                        <Link
                            to="/register"
                            className="bg-orange-500 hover:bg-orange-500 text-white rounded-md px-4 py-2 md:text-base font-semibold shadow-[0_0_5px_2px_rgba(255,165,0,0.8)]"
                        >
                            Катталуу
                        </Link>
                    </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden flex flex-col items-center w-full">
                    <Link to="/" className="flex items-center justify-center mb-3">
                        <img src={Logo} alt="logo" className="h-14 md:h-16 w-auto" />
                        <div className="flex flex-col ml-2 leading-tight">
                            <span className="text-2xl sm:text-3xl font-bold text-orange-500">
                                EDUBOT
                            </span>
                            <span className="text-sm -mt-2 sm:text-base text-gray-700 dark:text-gray-200 tracking-wide">
                                LEARNING
                            </span>
                        </div>
                    </Link>

                    <div className="flex w-full justify-center items-center px-4 gap-x-2">
                        <div className="flex items-center border border-black rounded overflow-hidden w-[calc(100%-50px)] max-w-[280px]">
                            <IoSearch className="w-5 h-5 ml-2 text-gray-700 dark:text-gray-200" />
                            <input
                                type="text"
                                placeholder="Издөө"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-2 focus:outline-none bg-transparent w-full truncate text-sm sm:text-base"
                            />
                        </div>
                        <button
                            onClick={() => setMenuOpen((p) => !p)}
                            className="text-gray-700 dark:text-gray-200 text-2xl"
                        >
                            <FaBars />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu modal */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="flex-1 bg-black/50"
                        onClick={() => setMenuOpen(false)}
                    ></div>

                    <div className="w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 h-full p-4 relative shadow-lg">
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="absolute top-4 left-4 text-gray-600 dark:text-gray-300"
                        >
                            <FaTimes className="text-2xl" />
                        </button>

                        <NavLinks isMobile={true} />

                        <div className="mt-6">
                            <Link
                                to="/register"
                                className="block w-full text-left text-gray-700 dark:text-gray-200 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Катталуу
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
