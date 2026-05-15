import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Lamp from '@assets/icons/lamp.svg';
import Bell from '@assets/icons/call.svg';
import Basket from '@assets/icons/basket.svg';
import Heart from '@assets/icons/heart.svg';
import Profile from '@assets/icons/profile.svg';
import ArrowRight from '@assets/icons/arrowRight.svg';
import { LuLogOut } from 'react-icons/lu';
import { AuthContext } from '../../context/AuthContext';
import { IoCalendarOutline, IoChatbubblesOutline } from 'react-icons/io5';
import { getUserMenuItems, getUserNavigationPaths } from '@shared/utils/navigation';

const menuIcons = {
    'my-courses': Lamp,
    courses: Lamp,
    attendance: IoCalendarOutline,
    notifications: Bell,
    cart: Basket,
    favourites: Heart,
};

const renderMenuIcon = (itemId) => {
    const Icon = menuIcons[itemId];

    if (typeof Icon === 'string') {
        return (
            <img
                src={Icon}
                alt=""
                className="h-5 w-5 shrink-0 dark:invert dark:brightness-200"
            />
        );
    }

    if (Icon) {
        return <Icon className="h-5 w-5 shrink-0" />;
    }

    return <IoChatbubblesOutline className="h-5 w-5 shrink-0" />;
};

function UserMenuDropdown({ user, onClose }) {
    const { t } = useTranslation();
    const { logout } = useContext(AuthContext);
    const paths = getUserNavigationPaths(user);
    const menuItemsTop = getUserMenuItems(user);

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
        <div className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-colors dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900">
            <Link to={paths.dashboard} onClick={handleItemClick} className="block">
                <div className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src={Profile}
                            alt=""
                            aria-hidden="true"
                            className="h-11 w-11 shrink-0 rounded-full"
                        />
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {user.fullName}
                            </h3>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {t('common.activeAccount')}
                            </p>
                            {user?.role && (
                                <p className="text-xs capitalize text-gray-500 dark:text-gray-300">
                                    {user.role}
                                </p>
                            )}
                        </div>
                    </div>
                    <img
                        src={ArrowRight}
                        alt=""
                        aria-hidden="true"
                        className="w-5 shrink-0 dark:invert dark:brightness-200"
                    />
                </div>
            </Link>

            <nav className="border-t border-gray-200 p-2 dark:border-gray-700" aria-label={t('common.userMenu')}>
                {menuItemsTop.map((item) => (
                    <Link
                        key={`${item.id}-${item.path}`}
                        to={item.path}
                        onClick={handleItemClick}
                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-orange-500 hover:text-white dark:text-gray-300 dark:hover:bg-orange-600"
                    >
                        {renderMenuIcon(item.id)}
                        <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                ))}
            </nav>

            <div className="border-t border-gray-200 p-2 dark:border-gray-700">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                >
                    <LuLogOut className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t('common.logout')}</span>
                </button>
            </div>
        </div>
    );
}
export default UserMenuDropdown;
