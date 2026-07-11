import { lazy, Suspense, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../contexts/DarkModeContext';

import { AuthContext } from '@app/providers';
import { getUserAvatarUrl } from '@shared/utils/avatar';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './header/BrandLogo';
import CourseSearchBox from './header/CourseSearchBox';
import HeaderActions, { HeaderUserMenu } from './header/HeaderActions';
import HeaderNavLinks from './header/HeaderNavLinks';
import { useCourseSearch } from './header/useCourseSearch';
import { useHeaderInteractionState } from './header/useHeaderInteractionState';
import { useUnreadNotifications } from './header/useUnreadNotifications';

const ThemeToggle = lazy(() => import('@shared-ui/ThemeToggle'));
const LanguageSwitcher = lazy(() => import('@shared-ui/LanguageSwitcher'));
const SideBar = lazy(() => import('@shared-ui/SideBar'));
const SidebarOverlay = lazy(() => import('@shared-ui/SidebarOverlay'));

const headerControlFallback = <div className="h-10 w-10" aria-hidden="true" />;

const Header = () => {
    const { t } = useTranslation();
    const { getUniqueItemsCount } = useCart();
    const cartItemsCount = getUniqueItemsCount();

    const { user } = useContext(AuthContext);
    const avatarUrl = getUserAvatarUrl(user);
    const location = useLocation();
    const navigate = useNavigate();
    const { darkMode, setDarkMode } = useDarkMode();
    const { favourites } = useFavourites();
    const unreadNotifications = useUnreadNotifications(user);
    const courseSearch = useCourseSearch();
    const { setShowDropdown: setCourseSearchDropdown } = courseSearch;
    const {
        activeIcon,
        avatarLoadFailed,
        closeUserMenu,
        handleAvatarError,
        handleIconClick,
        menuOpen,
        openMenu,
        positionBar,
        searchOpen,
        setMenuOpen,
        setPositionBar,
        setSearchOpen,
        setUserMenuOpen,
        toggleSearch,
        toggleUserMenu,
        userMenuOpen,
    } = useHeaderInteractionState({
        avatarUrl,
        pathname: location.pathname,
        setCourseSearchDropdown,
    });

    const handleCartClick = () => {
        handleIconClick('cart', () => navigate('/cart'));
    };

    const handleFavouriteClick = () => {
        navigate('/favourites');
        handleIconClick('heart');
    };

    const isCartPage = location.pathname === '/cart';
    const isFavouritesPage = location.pathname === '/favourites';

    return (
        <header className="sticky top-0 w-full bg-white dark:bg-[#1A1A1A] text-black dark:text-[#E8ECF3] shadow dark:shadow-gray-900 z-[80]">
            <div className="px-4 md:px-10 py-3">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between">
                    {/* Logo + Search */}
                    <div className="flex items-center  flex-1">
                        <BrandLogo />

                        <CourseSearchBox
                            id="desktop-course-search-results"
                            searchState={courseSearch}
                        />

                        {/* Navigation Links - Desktop */}
                        <div className="flex items-center  ml-11 max-w-[419px] w-full">
                            <HeaderNavLinks isMobile={false} user={user} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Suspense fallback={headerControlFallback}>
                            <LanguageSwitcher />
                        </Suspense>

                        <div className="relative top-[-12px]">
                            <Suspense fallback={headerControlFallback}>
                                <ThemeToggle dark={darkMode} setDark={setDarkMode} />
                            </Suspense>
                        </div>

                        <HeaderActions
                            activeIcon={activeIcon}
                            avatarLoadFailed={avatarLoadFailed}
                            avatarUrl={avatarUrl}
                            cartItemsCount={cartItemsCount}
                            favouritesCount={favourites.length}
                            isCartPage={isCartPage}
                            isFavouritesPage={isFavouritesPage}
                            onAvatarError={handleAvatarError}
                            onCartClick={handleCartClick}
                            onFavouriteClick={handleFavouriteClick}
                            onUserMenuClose={closeUserMenu}
                            onUserMenuToggle={toggleUserMenu}
                            unreadNotifications={unreadNotifications}
                            user={user}
                            userMenuOpen={userMenuOpen}
                        />
                    </div>
                </div>

                <div className="lg:hidden">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={openMenu}
                            className="text-gray-700 dark:text-gray-300 text-2xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            aria-label={t('common.openMenu')}
                            aria-expanded={menuOpen}
                        >
                            <FaBars />
                        </button>

                        <BrandLogo compact />

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSearch}
                                className="text-gray-700 dark:text-gray-300 text-2xl p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                aria-label={t('common.openSearch')}
                                aria-expanded={searchOpen}
                            >
                                <IoSearch />
                            </button>

                            {user && (
                                <HeaderUserMenu
                                    avatarLoadFailed={avatarLoadFailed}
                                    avatarUrl={avatarUrl}
                                    buttonClassName="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                                    iconClassName={(isActive) =>
                                        `w-4 h-4 transition-colors duration-300 ${
                                            isActive ? 'text-white' : 'text-black dark:text-gray-300'
                                        }`
                                    }
                                    imageClassName="w-9 h-9 rounded-full object-cover"
                                    mobile
                                    onAvatarError={handleAvatarError}
                                    onClose={closeUserMenu}
                                    onToggle={() => setUserMenuOpen((prev) => !prev)}
                                    user={user}
                                    userMenuOpen={userMenuOpen}
                                />
                            )}
                        </div>
                    </div>

                    {searchOpen && (
                        <CourseSearchBox
                            id="mobile-course-search-results"
                            mode="mobile"
                            searchState={courseSearch}
                            onResultSelect={() => setSearchOpen(false)}
                        />
                    )}
                </div>
            </div>

            {/* SideBar Overlays */}
            {(menuOpen || positionBar) && (
                <Suspense fallback={null}>
                    <SidebarOverlay
                        isOpen={menuOpen}
                        onClose={() => setMenuOpen(false)}
                        position="left"
                    >
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
                </Suspense>
            )}
        </header>
    );
};

export default Header;
