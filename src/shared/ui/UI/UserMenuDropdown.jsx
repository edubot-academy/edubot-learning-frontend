import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Lamp from '@assets/icons/lamp.svg';
import Bell from '@assets/icons/call.svg';
import Basket from '@assets/icons/basket.svg';
import Heart from '@assets/icons/heart.svg';
import Setting from '@assets/icons/seting.svg';
import Profile from '@assets/icons/profile.svg';
import ArrowRight from '@assets/icons/arrowRight.svg';
import { LuLogOut } from 'react-icons/lu';
import { AuthContext } from '../../../context/AuthContext';

function UserMenuDropdown({ user, onClose }) {
    const { logout } = useContext(AuthContext);

    const getDashboardPath = () => {
        if (!user) return '/dashboard';

        switch (user.role) {
            case 'student':
                return '/student';
            case 'instructor':
                return '/instructor';
            case 'admin':
                return '/admin';
            case 'assistant':
                return '/assistant';
            default:
                return '/dashboard';
        }
    };

    const dashboardPath = getDashboardPath();

    // Добавляем поле link для элементов, которые должны вести на другие страницы
    const menuItemsTop = [
        { label: 'Менин курстарым', icon: Lamp, link: '/my-courses' },
        { label: 'Билдирүүлөр', icon: Bell, link: '/notifications' },
        { label: 'Корзина', icon: Basket, link: '/cart' },
        { label: 'Избранные', icon: Heart, link: '/favorites' },
        { label: 'Настройка', icon: Setting, link: '/settings' },
    ];

    const handleItemClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="group/dropdown">
            <div className="w-[17rem] sm:w-[15rem] bg-white mt-[30px] ml-[20px] rounded-[0.50rem] shadow-xl border border-gray-200 transition-all duration-300 ease-in-out">
                <Link to={dashboardPath} onClick={handleItemClick} className="block">
                    <div className="flex items-center justify-between px-[1.25rem] py-[1rem] hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-[0.75rem]">
                            <img
                                src={Profile}
                                alt="Profile"
                                className="w-[2.9rem] h-[2.9rem] sm:w-[2.5rem] sm:h-[2.5rem] rounded-full"
                            />
                            <div>
                                <h3 className="text-[1rem] sm:text-[0.9rem] font-semibold text-[#141619]">
                                    {user.fullName}
                                </h3>
                                <p className="text-[0.80rem] sm:text-[0.75rem] text-[#208D28]">
                                    Идентифицированный
                                </p>
                                {user?.role && (
                                    <p className="text-[0.70rem] text-gray-500 capitalize">
                                        {user.role}
                                    </p>
                                )}
                            </div>
                        </div>
                        <img
                            src={ArrowRight}
                            alt="Arrow"
                            className="w-[1.6rem] sm:w-[1.4rem] mr-[-10px]"
                        />
                    </div>
                </Link>

                <div className="w-full h-[0.06rem] bg-gray-200 my-[0.4rem]" />

                <div className="w-[18rem] sm:w-[16rem] items-center ml-[30px] mb-6">
                    <div>
                        {menuItemsTop.map((item, index) => {
                            // Если у элемента есть ссылка, используем Link
                            if (item.link) {
                                return (
                                    <Link
                                        key={index}
                                        to={item.link}
                                        onClick={handleItemClick}
                                        className="
                                            w-[200px] sm:w-[180px]
                                            h-[50px] sm:h-[45px]
                                            flex items-center gap-[0.8rem]
                                            px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
                                            cursor-pointer
                                            text-[0.85rem] sm:text-[0.8rem]
                                            text-gray-800
                                            hover:bg-[#EA580C] hover:text-white
                                            transition-colors duration-200
                                            rounded-lg
                                            block
                                        "
                                    >
                                        <img src={item.icon} alt="" className="w-[1.2rem] sm:w-[1.1rem]" />
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            }
                            
                            // Если ссылки нет, используем обычный div
                            return (
                                <div
                                    key={index}
                                    className="
                                        w-[200px] sm:w-[180px]
                                        h-[50px] sm:h-[45px]
                                        flex items-center gap-[0.8rem]
                                        px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
                                        cursor-pointer
                                        text-[0.85rem] sm:text-[0.8rem]
                                        text-gray-800
                                        hover:bg-[#EA580C] hover:text-white
                                        transition-colors duration-200
                                        rounded-lg
                                    "
                                >
                                    <img src={item.icon} alt="" className="w-[1.2rem] sm:w-[1.1rem]" />
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-[0.35rem] border-t border-gray-200 pt-2">
                        <button
                            onClick={handleLogout}
                            className="
                                w-[200px] sm:w-[180px]
                                h-[50px] sm:h-[45px]
                                flex items-center gap-[0.8rem]
                                px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
                                cursor-pointer
                                text-[0.85rem] sm:text-[0.8rem]
                                text-red-600
                                hover:bg-red-50
                                transition-colors duration-200
                                rounded-lg
                                w-full
                            "
                        >
                            <LuLogOut className="w-[1.2rem] h-[1.2rem] sm:w-[1.1rem] sm:h-[1.1rem]" />
                            <span className="whitespace-nowrap">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserMenuDropdown;