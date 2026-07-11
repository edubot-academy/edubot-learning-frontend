import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { BsCart2 } from 'react-icons/bs';
import { FaRegUser } from 'react-icons/fa';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const UserMenuDropdown = lazy(() => import('@shared-ui/UserMenuDropdown'));

const renderAvatar = ({
    active,
    avatarLoadFailed,
    avatarUrl,
    iconClassName,
    imageClassName,
    onAvatarError,
    user,
}) => {
    if (avatarUrl && !avatarLoadFailed) {
        return (
            <img
                src={avatarUrl}
                alt={user?.fullName ? `${user.fullName} avatar` : 'User avatar'}
                className={imageClassName}
                onError={onAvatarError}
            />
        );
    }

    return <FaRegUser className={iconClassName(active)} />;
};

const CartButton = ({
    active,
    cartItemsCount,
    isCartPage,
    onClick,
}) => {
    const { t } = useTranslation();
    const selected = active || isCartPage;

    return (
        <div className="relative">
            <button
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    selected
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-black dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300'
                }`}
                onClick={onClick}
                aria-label={t('common.cart')}
                aria-current={isCartPage ? 'page' : undefined}
            >
                <BsCart2
                    className={`w-5 h-5 transition-colors duration-300 ${
                        selected ? 'text-white' : 'text-black dark:text-gray-300'
                    }`}
                />
                {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {cartItemsCount}
                    </span>
                )}
            </button>
        </div>
    );
};

const FavouriteButton = ({
    active,
    favouritesCount,
    isFavouritesPage,
    loggedIn,
    onClick,
}) => {
    const { t } = useTranslation();
    const selected = active || isFavouritesPage;
    const activeClass = loggedIn ? 'bg-orange-500 border-orange-500' : 'border-orange-500';
    const inactiveClass = loggedIn
        ? 'border-black dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300'
        : 'border-black dark:border-[#E8ECF3] hover:border-gray-600 dark:hover:border-[#E8ECF3]/70';

    return (
        <button
            className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                selected ? activeClass : inactiveClass
            }`}
            onClick={onClick}
            aria-label={t('common.favourites')}
            aria-current={isFavouritesPage ? 'page' : undefined}
        >
            {loggedIn && favouritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Math.min(favouritesCount, 99)}
                </span>
            )}
            {loggedIn && selected ? (
                <IoHeart className="w-5 h-5 text-white" />
            ) : (
                <IoHeartOutline className={`w-5 h-5 ${loggedIn ? 'text-black dark:text-gray-300' : 'text-black dark:text-[#E8ECF3]'}`} />
            )}
        </button>
    );
};

export const HeaderUserMenu = ({
    active,
    avatarLoadFailed,
    avatarUrl,
    buttonClassName = 'w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300',
    dropdownClassName = 'absolute top-full right-0 pt-2 transform transition-all duration-300 ease-out z-60 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
    iconClassName,
    imageClassName = 'w-10 h-10 rounded-full object-cover',
    mobile = false,
    onAvatarError,
    onClose,
    onToggle,
    unreadNotifications = 0,
    user,
    userMenuOpen,
}) => {
    const { t } = useTranslation();
    const selected = active || userMenuOpen;
    const defaultIconClassName = (isActive) =>
        `w-5 h-5 transition-colors duration-300 ${
            isActive ? 'text-white' : 'text-black dark:text-gray-300'
        }`;

    return (
        <div className={mobile ? 'relative hidden md:block' : 'relative group'} data-user-menu>
            <button
                className={`${buttonClassName} ${
                    selected
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-black dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300'
                }`}
                onClick={onToggle}
                aria-label={t('common.userMenu')}
                aria-expanded={userMenuOpen}
            >
                {renderAvatar({
                    active: selected,
                    avatarLoadFailed,
                    avatarUrl,
                    iconClassName: iconClassName || defaultIconClassName,
                    imageClassName,
                    onAvatarError,
                    user,
                })}

                {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 right-0 bg-[#FF2C2C] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"></span>
                )}
            </button>

            {(mobile ? userMenuOpen : true) && (
                <div
                    className={
                        mobile
                            ? 'absolute right-0 top-full mt-2 z-50'
                            : `${dropdownClassName} ${
                                  userMenuOpen
                                      ? 'visible translate-y-0 opacity-100'
                                      : 'invisible translate-y-2 opacity-0'
                              }`
                    }
                >
                    <div className="relative">
                        {!mobile && <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>}
                        <Suspense fallback={null}>
                            <UserMenuDropdown
                                user={user}
                                onClose={onClose}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
};

const HeaderActions = ({
    activeIcon,
    avatarLoadFailed,
    avatarUrl,
    cartItemsCount,
    favouritesCount,
    isCartPage,
    isFavouritesPage,
    onAvatarError,
    onCartClick,
    onFavouriteClick,
    onUserMenuClose,
    onUserMenuToggle,
    unreadNotifications,
    user,
    userMenuOpen,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3">
            <FavouriteButton
                active={activeIcon === 'heart'}
                favouritesCount={favouritesCount}
                isFavouritesPage={isFavouritesPage}
                loggedIn={Boolean(user)}
                onClick={onFavouriteClick}
            />
            <CartButton
                active={activeIcon === 'cart'}
                cartItemsCount={cartItemsCount}
                isCartPage={isCartPage}
                onClick={onCartClick}
            />
            {user ? (
                <HeaderUserMenu
                    active={activeIcon === 'user'}
                    avatarLoadFailed={avatarLoadFailed}
                    avatarUrl={avatarUrl}
                    onAvatarError={onAvatarError}
                    onClose={onUserMenuClose}
                    onToggle={onUserMenuToggle}
                    unreadNotifications={unreadNotifications}
                    user={user}
                    userMenuOpen={userMenuOpen}
                />
            ) : (
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
                >
                    {t('common.login')}
                </Link>
            )}
        </div>
    );
};

export default HeaderActions;
