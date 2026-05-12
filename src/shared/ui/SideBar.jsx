import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { AuthContext } from '@app/providers';
import { isPublicVideoSignupEnabled } from '@shared/auth-config';
import { getUserMenuItems, getUserNavigationPaths } from '@shared/utils/navigation';
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
        'relative hover:text-white hover:bg-[#EA580C] m-0 px-3 py-4 text-base sm:text-lg md:text-xl rounded-md flex justify-start gap-[10px] w-full items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#141619]';

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
                    type="button"
                    onClick={() => {
                        closeMenus();
                    }}
                    className="  text-gray-600 dark:text-gray-300"
                    aria-label="Менюну жабуу"
                >
                    <FaTimes className="text-2xl" aria-hidden="true" />
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
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-5 py-3 text-sm font-medium text-white orange__shadow transition hover:from-[#C2410C] hover:to-[#C2410C] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                Кирүү
                            </Link>
                        </div>
                    )}
                </div>

                {user ? (
                    <nav aria-label="Аккаунт менюсу">
                        <ul className="flex flex-col justify-between items-start">
                            <li className="w-full">
                                <Link to={paths.dashboardOverview} onClick={closeMenus} className={`${active(paths.dashboardOverview)} ${linkClass}`} aria-current={location.pathname === paths.dashboardOverview ? 'page' : undefined}>
                                    <FiBarChart2 className="w-6 h-6" aria-hidden="true" />
                                    Дашборд
                                </Link>
                            </li>
                            {userMenuItems.map((item) => {
                                const Icon = menuIcons[item.id] || FiBarChart2;
                                return (
                                    <li key={item.id} className="w-full">
                                        <Link to={item.path} onClick={closeMenus} className={`${active(item.path)} ${linkClass}`} aria-current={location.pathname === item.path ? 'page' : undefined}>
                                            <Icon className="w-6 h-6" aria-hidden="true" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                ) : (
                    <nav aria-label="Конок менюсу">
                        <ul className="flex flex-col justify-between items-start">
                            <li className="w-full">
                                <Link to="/cart" onClick={closeMenus} className={`${active('/cart')} ${linkClass}`} aria-current={location.pathname === '/cart' ? 'page' : undefined}>
                                    <BsCart2 className='w-6 h-6' aria-hidden="true" />
                                    Себет
                                </Link>
                            </li>
                            <li className="w-full">
                                <Link to="/favourites" onClick={closeMenus} className={`${active('/favourites')} ${linkClass}`} aria-current={location.pathname === '/favourites' ? 'page' : undefined}>
                                    <IoHeartOutline className='w-6 h-6' aria-hidden="true" />
                                    Тандалгандар
                                </Link>
                            </li>
                        </ul>
                    </nav>
                )}

                <nav className={`flex flex-col ${user !== null ? 'mt-0' : 'mt-4'}`} aria-label="Негизги навигация">
                    <Link to="/courses" onClick={closeMenus} className={`${active('/courses')} ${linkClass}`} aria-current={location.pathname === '/courses' ? 'page' : undefined}>
                        Курстар
                    </Link>
                    <Link to="/about" onClick={closeMenus} className={`${active('/about')} ${linkClass}`} aria-current={location.pathname === '/about' ? 'page' : undefined}>
                        Биз жөнүндө
                    </Link>
                    <Link to="/contact" onClick={closeMenus} className={`${active('/contact')} ${linkClass}`} aria-current={location.pathname === '/contact' ? 'page' : undefined}>
                        Байланышуу
                    </Link>
                    {user !== null ? (
                        <>
                            <button
                                type="button"
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
                            {isPublicVideoSignupEnabled ? (
                                <Link to="/register" onClick={closeMenus} className={`${active('/register')} ${linkClass}`} aria-current={location.pathname === '/register' ? 'page' : undefined}>
                                    Катталуу
                                </Link>
                            ) : null}
                        </>
                    )}
                </nav>
            </div>
        </>
    );
};

SideBar.propTypes = {
    setMenuOpen: PropTypes.func.isRequired,
    setPosition: PropTypes.func.isRequired,
};

export default SideBar;
