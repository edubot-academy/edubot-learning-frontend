import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { AuthContext } from '@app/providers';
import { isPublicVideoSignupEnabled } from '@shared/auth-config';
import { getUserMenuItems, getUserNavigationPaths } from '@shared/utils/navigation';
import Button from './Button';
import Person from '@assets/icons/grayPerson.svg';
import { IoChatbubblesOutline, IoHeartOutline } from 'react-icons/io5';
import { FaRegBell } from 'react-icons/fa';
import { BsCart2 } from 'react-icons/bs';
import { FiBarChart2, FiBookOpen, FiCalendar } from 'react-icons/fi';

const menuIcons = {
    'my-courses': FiBookOpen,
    courses: FiBookOpen,
    attendance: FiCalendar,
    notifications: FaRegBell,
    cart: BsCart2,
    favourites: IoHeartOutline,
    chat: IoChatbubblesOutline,
};

const SideBar = ({ setMenuOpen, setPosition }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const paths = getUserNavigationPaths(user);
    const userMenuItems = getUserMenuItems(user);

    const closeMenus = () => {
        setMenuOpen(false);
        setPosition(false);
    };

    const active = (path) => (location.pathname === path ? 'text-orange-500' : '');

    const linkClass =
        'relative hover:text-white hover:bg-[#EA580C]  m-0 pt-4 pb-4 pl-3 sm:text-lg md:text-xl rounded-md flex justify-start gap-[10px] w-full items-center ';

    const handleProfileClick = () => {
        if (user) {
            navigate(paths.dashboardOverview);
            closeMenus();
        }
    };

    return (
        <>
            <div className="flex justify-end mt-5 mr-2 ">
                <button
                    onClick={() => {
                        closeMenus();
                    }}
                    className="  text-gray-600 dark:text-gray-300"
                >
                    <FaTimes className="text-2xl" />
                </button>
            </div>

            <div className="mt-8">
                <div className="flex justify-between gap-1 pb-6 border-b border-gray-300 rounded-lg p-2">
                    <div className="flex">
                        <img src={Person} alt="Person" />
                    </div>

                    {user ? (
                        <div
                            className="w-full flex items-center justify-between ml-5 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
                            onClick={handleProfileClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
                        >
                            <div className="flex flex-col items-start">
                                <h2 className="text-xl font-semibold">{user?.fullName || 'Колдонуучу'}</h2>
                                <span className="text-[#208D28]">Идентифицированный</span>
                                <span className="text-sm text-gray-500 capitalize">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-between ml-5">
                            <Link
                                to="/login"
                                onClick={() => {
                                    closeMenus();
                                }}
                            >
                                <Button variant="primary">Кирүү</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {user ? (
                    <div className="">
                        <ul className="flex flex-col justify-between items-start">
                            <Link to={paths.dashboardOverview} onClick={closeMenus} className={`${linkClass}`}>
                                <FiBarChart2 className="w-6 h-6" />
                                Дашборд
                            </Link>
                            {userMenuItems.map((item) => {
                                const Icon = menuIcons[item.id] || FiBarChart2;
                                return (
                                    <Link key={item.id} to={item.path} onClick={closeMenus} className={`${linkClass}`}>
                                        <Icon className="w-6 h-6" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <div className="">
                        <ul className="flex flex-col justify-between items-start">
                            <Link to="/cart" onClick={closeMenus} className={`${linkClass}`}>
                                <BsCart2 className='w-6 h-6' />
                                Себет
                            </Link>
                            <Link to="/favourites" onClick={closeMenus} className={`${linkClass}`}>
                                <IoHeartOutline className='w-6 h-6' />
                                Тандалгандар
                            </Link>
                        </ul>
                    </div>
                )}

                <div className={`flex flex-col ${user !== null ? 'mt-0' : 'mt-4'}`}>
                    <Link to="/courses" onClick={closeMenus} className={`${active('/courses')} ${linkClass}`}>
                        Курстар
                    </Link>
                    <Link to="/about" onClick={closeMenus} className={`${active('/about')} ${linkClass}`}>
                        Биз жөнүндө
                    </Link>
                    <Link to="/contact" onClick={closeMenus} className={`${active('/contact')}  ${linkClass}`}>
                        Байланышуу
                    </Link>
                    {user !== null ? (
                        <>
                            <button
                                className={`${linkClass} mt-0.5`}
                                onClick={() => {
                                    logout();
                                    closeMenus();
                                }}
                            >
                                Аккаунттан чыгуу
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" onClick={closeMenus} className={`${active('/cart')} ${linkClass}`}>
                                Себет
                            </Link>
                            {isPublicVideoSignupEnabled ? (
                                <Link to="/register" onClick={closeMenus} className={`${active('/register')} ${linkClass}`}>
                                    Катталуу
                                </Link>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SideBar;
