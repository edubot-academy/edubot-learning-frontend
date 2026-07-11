import PropTypes from 'prop-types';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartProvider';
import { FavouritesProvider } from '../../context/FavouritesProvider';
import { ResourceProgressProvider } from '../../context/ResourceProgressProvider';
import { DarkModeProvider } from '../../contexts/DarkModeProvider';

const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <ResourceProgressProvider>
                <FavouritesProvider>
                    <CartProvider>
                        <DarkModeProvider>{children}</DarkModeProvider>
                    </CartProvider>
                </FavouritesProvider>
            </ResourceProgressProvider>
        </AuthProvider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppProviders;

export { AuthContext };
