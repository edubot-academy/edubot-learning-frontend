import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import { FaTimes } from 'react-icons/fa';
import Person from '@assets/icons/grayPerson.svg';
import BlackHeart from '@assets/icons/baseHeart.svg';
import BlubIcon from '@assets/icons/blub.svg';
import BellIcon from '@assets/icons/bell.svg';
import BasketIcon from '@assets/icons/baseBasket.svg';
import SettingIcon from '@assets/icons/setting.svg';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const SideBar = ({ setMenuOpen, setPosition }) => {
    const { user, setUser } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

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

    const active = (path) => (location.pathname === path ? 'text-orange-500' : '');

    const linkClass =
        'relative hover:text-white hover:bg-[#EA580C]  m-0 pt-4 pb-4 pl-3 sm:text-lg md:text-xl rounded-md flex justify-start gap-[10px] w-full items-center ';

    const handleProfileClick = () => {
        navigate(getDashboardPath());
        setMenuOpen(false);
        setPosition(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };
    return (
        <>
            <div className="flex justify-end mt-5 mr-2 ">
                <button
                    onClick={() => {
                        setMenuOpen(false);
                        setPosition(false);
                    }}
                    className="  text-gray-600 dark:text-gray-300"
                >
                    <FaTimes className="text-2xl" />
                </button>
            </div>

            <div className="mt-8">
                <div
                    className="flex justify-between gap-1 pb-6 border-b border-gray-300 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
                    onClick={handleProfileClick}
                >
                    <div className="flex ">
                        <img src={Person} alt="Person" />
                    </div>

                    {user !== null ? (
                        <div className="w-full flex items-center justify-between ml-5">
                            <div className="flex flex-col items-start">
                                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                                <span className="text-[#208D28]">Идентифицированный</span>
                                {/* Показываем роль пользователя */}
                                <span className="text-sm text-gray-500 capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex  items-center justify-center">
                            <Button variant="primary">
                                <Link
                                    to="/register"
                                    className="block w-full px-5 text-left text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                                >
                                    Катталуу
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {user !== null ? (
                    <div className="">
                        <ul className="flex flex-col justify-between items-start">
                            <div className={`${linkClass}`}>
                                <img src={BellIcon} alt="" className="max-w-6 pb-1" />
                                Билдирүүлөр
                            </div>
                            <div className={`${linkClass}`}>
                                <img src={BasketIcon} alt="" className="max-w-6 pb-1" />
                                Корзина
                            </div>
                            <div className={`${linkClass}`}>
                                <img src={BlackHeart} alt="" className="max-w-6 pb-1" />
                                Избранные
                            </div>
                            <div className={`${linkClass}`}>
                                <img src={SettingIcon} alt="" className="max-w-6 pb-1" />
                                Настройка
                            </div>
                        </ul>
                    </div>
                ) : null}

                <div className={`flex flex-col ${user !== null ? 'mt-0' : 'mt-4'}`}>
                    <Link to="/courses" className={`${active('/courses')} ${linkClass}`}>
                        Курстар
                    </Link>
                    <Link to="/about" className={`${active('/about')} ${linkClass}`}>
                        Биз жөнүндө
                    </Link>
                    <Link to="/contact" className={`${active('/contact')}  ${linkClass}`}>
                        Байланышуу
                    </Link>
                    {user !== null ? (
                        <>
                            <button
                                className={`${linkClass} mt-0.5`}
                                onClick={() => {
                                    logout();
                                }}
                            >
                                Чыгуу
                            </button>
                        </>
                    ) : (
                        <Link to="/register" className={`${active('/register')} ${linkClass}`}>
                            Катталуу
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default SideBar;
