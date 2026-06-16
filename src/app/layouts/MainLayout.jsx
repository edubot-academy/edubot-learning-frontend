import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

const Header = lazy(() => import('@shared/Header'));
const Footer = lazy(() => import('@shared/Footer'));

const MainLayout = ({ children }) => {
    const { pathname } = useLocation();
    const hideFooter = pathname === '/login' || pathname === '/register';

    return (
        <div className="flex flex-col min-h-screen">
            <Suspense fallback={<div className="sticky top-0 h-[88px] w-full" aria-hidden="true" />}>
                <Header />
            </Suspense>
            <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
                {children}
            </main>
            {!hideFooter && (
                <Suspense fallback={null}>
                    <Footer />
                </Suspense>
            )}
        </div>
    );
};

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;
