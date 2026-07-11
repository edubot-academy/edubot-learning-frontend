import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isPlatformAdmin } from '@shared/utils/roles';

const HeaderNavLinks = ({ isMobile, user }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const active = (path) =>
        location.pathname === path ? 'text-orange-500 dark:text-orange-400' : '';

    const linkClass =
        'relative inline-block cursor-pointer dark:text-[#E8ECF3] dark:hover:text-white ' +
        "after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 " +
        'after:bg-black dark:after:bg-[#E8ECF3] after:transition-all after:duration-300 ' +
        'hover:after:left-0 hover:after:w-full';

    return (
        <nav
            aria-label={t(
                isMobile ? 'nav.mobilePrimaryNavigation' : 'nav.primaryNavigation'
            )}
            className={
                isMobile
                    ? 'flex flex-col space-y-4 mt-4'
                    : 'flex justify-around  w-full  items-center gap-3'
            }
        >
            <Link
                to="/courses"
                className={`${active('/courses')} ${linkClass}  lg:text-sm xl:text-base 2xl:text-lg `}
            >
                {t('nav.courses')}
            </Link>

            <Link
                to="/about"
                className={`${active('/about')} ${linkClass}   lg:text-sm xl:text-base 2xl:text-lg`}
            >
                {t('nav.about')}
            </Link>
            <Link
                to="/contact"
                className={`${active('/contact')} ${linkClass} lg:text-sm xl:text-base 2xl:text-lg`}
            >
                {t('nav.contact')}
            </Link>

            {user && user.role === 'instructor' && (
                <Link to="/instructor" className={`${active('/instructor')} ${linkClass}`}>
                    {t('nav.dashboard')}
                </Link>
            )}
            {user && isPlatformAdmin(user) && (
                <Link to="/admin" className={`${active('/admin')} ${linkClass}`}>
                    {t('nav.dashboard')}
                </Link>
            )}
            {user && user.role === 'assistant' && (
                <Link to="/assistant" className={`${active('/assistant')} ${linkClass}`}>
                    {t('nav.dashboard')}
                </Link>
            )}
            {user && user.role === 'student' && (
                <Link to="/student" className={`${active('/student')} ${linkClass}`}>
                    {t('nav.dashboard')}
                </Link>
            )}
        </nav>
    );
};

export default HeaderNavLinks;
