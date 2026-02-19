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
import { AuthContext } from '../../context/AuthContext';
import { IoChatbubblesOutline } from "react-icons/io5";

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

    const notificationsPath =
        user?.role === 'student'
            ? '/student?tab=notifications'
            : user?.role === 'instructor'
                ? '/instructor?tab=notifications'
                : user?.role === 'admin'
                    ? '/admin?tab=notifications'
                    : '/dashboard?tab=notifications';

    const myCoursesPath =
        user?.role === 'student'
            ? '/student?tab=my-courses'
            : user?.role === 'instructor'
                ? '/instructor?tab=my-courses'
                : user?.role === 'admin'
                    ? '/admin?tab=my-courses'
                    : '/dashboard?tab=my-courses';

    const menuItemsTop = [
        { label: 'Менин курстарым', icon: Lamp, path: myCoursesPath },
        { label: 'Билдирүүлөр', icon: Bell, path: notificationsPath },
        { label: 'Себет', icon: Basket, path: '/cart' },
        { label: 'Избранные', icon: Heart, path: '/favourites' },
        // { label: 'Настройка', icon: Setting, path: '/settings' },
        { label: 'Чат', icon: false, path: '/chat' },
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
            <div className="w-[17rem] sm:w-[15rem] bg-white dark:bg-gray-800 mt-[30px] ml-[20px] rounded-[0.50rem] shadow-xl dark:shadow-gray-900 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out">
                <Link to={dashboardPath} onClick={handleItemClick} className="block">
                    <div className="flex items-center justify-between px-[1.25rem] py-[1rem] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer rounded-t-[0.50rem]">
                        <div className="flex items-center gap-[0.75rem]">
                            <img
                                src={Profile}
                                alt="Profile"
                                className="w-[2.9rem] h-[2.9rem] sm:w-[2.5rem] sm:h-[2.5rem] rounded-full"
                            />
                            <div>
                                <h3 className="text-[1rem] sm:text-[0.9rem] font-semibold text-gray-900 dark:text-white">
                                    {user.fullName}
                                </h3>
                                <p className="text-[0.80rem] sm:text-[0.75rem] text-green-600 dark:text-green-400">
                                    Идентифицированный
                                </p>
                                {user?.role && (
                                    <p className="text-[0.70rem] text-gray-500 dark:text-gray-300 capitalize">
                                        {user.role}
                                    </p>
                                )}
                            </div>
                        </div>
                        <img
                            src={ArrowRight}
                            alt="Arrow"
                            className="w-[1.6rem] sm:w-[1.4rem] mr-[-10px] dark:invert dark:brightness-200"
                        />
                    </div>
                </Link>

                <div className="w-full h-[0.06rem] bg-gray-200 dark:bg-gray-700 my-[0.4rem]" />

                <div className="w-[18rem] sm:w-[10rem] items-center ml-[30px] mb-6">
                    <div>
                        {menuItemsTop.map((item, index) => {
                            const content = (
                                <div
                                    className="
                                        w-[200px] sm:w-[180px]
                                        h-[50px] sm:h-[45px]
                                        flex items-center gap-[0.8rem]
                                        px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
                                        cursor-pointer
                                        text-[0.85rem] sm:text-[0.8rem]
                                        text-gray-800 dark:text-gray-300
                                        hover:bg-orange-500 hover:text-white
                                        dark:hover:bg-orange-600
                                        transition-colors duration-200
                                        rounded-lg
                                    "
                                >
                                    {item.icon ? (
                                        <img
                                            src={item.icon}
                                            alt=""
                                            className="w-[1.2rem] sm:w-[1.1rem] dark:invert dark:brightness-200"
                                        />
                                    ) : (
                                        <IoChatbubblesOutline className="w-5 h-5 mb-0.5"/>
                                    )}

                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.label}
                                    </span>
                                </div>
                            );

                            if (item.path) {
                                return (
                                    <Link key={index} to={item.path} onClick={handleItemClick}>
                                        {content}
                                    </Link>
                                );
                            }
                            return <div key={index}>{content}</div>;
                        })}
                    </div>

                    <div className="mt-[0.35rem] border-t border-gray-200 dark:border-gray-700 pt-2">
                        <button
                            onClick={handleLogout}
                            className="
                                w-full
                                h-[50px] sm:h-[45px]
                                flex items-center gap-[0.8rem]
                                px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
                                cursor-pointer
                                text-[0.85rem] sm:text-[0.8rem]
                                text-red-600 dark:text-red-400
                                hover:bg-red-50 dark:hover:bg-gray-700
                                rounded-lg
                            "
                        >
                            <LuLogOut className="text-lg" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                Чыгуу
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UserMenuDropdown;
