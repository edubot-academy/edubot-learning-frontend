import PropTypes from 'prop-types';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import { ResourceProgressProvider } from '../../context/ResourceProgressProvider';

const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <ResourceProgressProvider>
                {children}
            </ResourceProgressProvider>
        </AuthProvider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppProviders;

export { AuthContext };
