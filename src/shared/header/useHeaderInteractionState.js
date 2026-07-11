import { useEffect, useState } from 'react';

const getActiveIconForPath = (pathname) => {
    if (pathname === '/cart') return 'cart';
    if (pathname === '/favourites') return 'heart';
    return null;
};

export const useHeaderInteractionState = ({
    avatarUrl,
    pathname,
    setCourseSearchDropdown,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [positionBar, setPositionBar] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [activeIcon, setActiveIcon] = useState(() => getActiveIconForPath(pathname));

    useEffect(() => {
        setActiveIcon(getActiveIconForPath(pathname));
        setMenuOpen(false);
        setPositionBar(false);
        setSearchOpen(false);
        setCourseSearchDropdown(false);
        setUserMenuOpen(false);
    }, [pathname, setCourseSearchDropdown]);

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [avatarUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest?.('[data-user-menu]')) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;

            setMenuOpen(false);
            setPositionBar(false);
            setSearchOpen(false);
            setCourseSearchDropdown(false);
            setUserMenuOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [setCourseSearchDropdown]);

    const openMenu = () => {
        setMenuOpen(true);
        setPositionBar(false);
    };

    const toggleSearch = () => {
        setSearchOpen((prev) => !prev);
    };

    const handleIconClick = (iconName, callback) => {
        setActiveIcon(iconName);
        if (callback) callback();
    };

    const handleAvatarError = () => {
        setAvatarLoadFailed(true);
    };

    const closeUserMenu = () => {
        setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        handleIconClick('user');
        setUserMenuOpen((prev) => !prev);
    };

    return {
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
    };
};
