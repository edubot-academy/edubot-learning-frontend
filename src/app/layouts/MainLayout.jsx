import PropTypes from 'prop-types';
import Header from '@shared/Header';
import Footer from '@shared/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-grow" tabIndex={-1}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;
