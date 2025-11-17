import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { GrLanguage } from "react-icons/gr";
import { BsChevronDown, BsMoon, BsSun } from "react-icons/bs";
import { AuthContext } from "../context/AuthContext";
import EduBotLogo from "../assets/images/edubot-signup.png";
import Button from "../components/UI/Button";
import BlackHeart from "../assets/icons/blackHeart.svg";
import BlackBasket from "../assets/icons/blackBasket.svg";
import BlackPerson from "../assets/icons/personBlack.svg";

const NavLinks = ({ isMobile }) => {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "text-orange-500" : "";

  const linkClass =
    "relative hover:text-black after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-black after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300";

  return (
    <div
      className={`${
        isMobile
          ? "flex flex-col space-y-4 mt-4  "
          : "flex space-x-6 items-center"
      }`}
    >
      <Link
        to="/courses"
        className={`${active("/courses")} ${linkClass} font-normal`}
      >
        Курстар
      </Link>
      <Link
        to="/about"
        className={`${active("/about")} ${linkClass} font-normal`}
      >
        Биз жөнүндө
      </Link>
      <Link
        to="/contact"
        className={`${active("/contact")} ${linkClass} font-normal`}
      >
        Байланыш
      </Link>
    </div>
  );
};

const Header = () => {
  const { user } = useContext(AuthContext);
  //   const user = null;
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 w-full bg-white dark:bg-white shadow z-50">
      <div className="px-4 md:px-10 py-3 flex flex-col items-center">
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center gap-6 flex-1">
            <Link to="/" className="flex items-center whitespace-nowrap">
              <img src={EduBotLogo} alt="logo" className="h-14 w-auto" />
              <div className="flex flex-col mt-1">
                <span className="text-2xl md:text-2xl font-bold text-orange-500">
                  EDUBOT
                </span>
                <span className="-mt-2 text-sm md:text-base text-gray-700 dark:text-gray-700 tracking-[0.14em]">
                  LEARNING
                </span>
              </div>
            </Link>

            {/* Desktop search input */}
            <div className="hidden md:flex items-center border rounded overflow-hidden flex-1 max-w-[200px] ml-6 border-[#7B818C] dark:border-[#7B818C]">
              <IoSearch className="w-5 h-5 ml-2 text-[#7B818C] dark:text-[#7B818C]" />
              <input
                type="text"
                placeholder="Издөө"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 focus:outline-none bg-transparent w-full dark:text-gray-700"
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
                <GrLanguage className="text-gray-700 dark:text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
                <BsChevronDown
                  className={`w-4 h-4 text-gray-700 dark:text-gray-700 transform transition-transform duration-300 ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-white shadow rounded z-50">
                  {["Русский", "English"].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-100 dark:text-gray-700"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle только с иконкой */}
            <button
              onClick={() => setDark((p) => !p)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-200 transition-colors duration-300"
            >
              {dark ? (
                <BsSun className="text-yellow-400 w-5 h-5" />
              ) : (
                <BsMoon className="text-gray-900 w-5 h-5" />
              )}
            </button>

            {/* Если user есть, показываем иконки вместо кнопки */}
            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={BlackHeart}
                  alt="favorites"
                  className="w-9 h-9 cursor-pointer"
                />
                <img
                  src={BlackBasket}
                  alt="cart"
                  className="w-9 h-9 cursor-pointer"
                />
                <img
                  src={BlackPerson}
                  alt="profile"
                  className="w-9 h-9 cursor-pointer"
                />
              </div>
            ) : (
              <Link to="/register">
                <Button variant="primary">Катталуу</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex flex-col items-center w-full">
          <Link to="/" className="flex items-center justify-center mb-3">
            <div className="flex flex-col ml-2 leading-tight">
              <span className="text-2xl sm:text-3xl font-bold text-orange-500">
                EDUBOT
              </span>
              <span className="text-sm -mt-2 sm:text-base text-gray-700 dark:text-gray-700 tracking-wide">
                LEARNING
              </span>
            </div>
          </Link>

          <div className="flex w-full justify-center items-center px-4 gap-x-2">
            <div className="flex items-center border rounded overflow-hidden w-[calc(100%-50px)] max-w-[280px] border-[#7B818C] dark:border-[#7B818C]">
              <IoSearch className="w-5 h-5 ml-2 text-[#7B818C] dark:text-[#7B818C]" />
              <input
                type="text"
                placeholder="Издөө"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 focus:outline-none bg-transparent w-full truncate text-sm sm:text-base dark:text-gray-700"
              />
            </div>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="text-gray-700 dark:text-gray-700 text-2xl"
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

          <div className="w-64 sm:w-72 md:w-80 bg-white dark:bg-white h-full p-4 relative shadow-lg">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 left-4 text-gray-600 dark:text-gray-600"
            >
              <FaTimes className="text-2xl" />
            </button>

            <NavLinks isMobile={true} />

            <div className="mt-6 flex flex-col gap-2">
              {/* Иконки вместо кнопки для mobile */}
              {user ? (
                <div className="flex items-center gap-3 justify-center">
                  <img
                    src={BlackHeart}
                    alt="favorites"
                    className="w-8 h-8 cursor-pointer"
                  />
                  <img
                    src={BlackBasket}
                    alt="cart"
                    className="w-8 h-8 cursor-pointer"
                  />
                  <img
                    src={BlackPerson}
                    alt="profile"
                    className="w-8 h-8 cursor-pointer"
                  />
                </div>
              ) : (
                <Link to="/register">
                  <Button variant="primary">Катталуу</Button>
                </Link>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={() => setDark((p) => !p)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-200 transition-colors duration-300 mt-2"
              >
                {dark ? (
                  <BsSun className="text-yellow-400 w-5 h-5" />
                ) : (
                  <BsMoon className="text-gray-900 w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
