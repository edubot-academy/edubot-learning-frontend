import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Header from '@shared/Header';
import Footer from '@shared/Footer';

const MainLayout = ({ children }) => {
    const { pathname } = useLocation();
    const hideFooter = pathname === '/login' || pathname === '/register';

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
};

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;
