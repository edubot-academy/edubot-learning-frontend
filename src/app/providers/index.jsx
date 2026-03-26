import PropTypes from 'prop-types';
import { AuthProvider, AuthContext } from '../../context/AuthContext';

const AppProviders = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppProviders;

export { AuthContext };
