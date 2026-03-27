import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ChatRedirect = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'student':
            return <Navigate to="/student?tab=chat" replace />;
        case 'instructor':
            return <Navigate to="/instructor?tab=chat" replace />;
        case 'admin':
            return <Navigate to="/admin?tab=notifications" replace />;
        case 'assistant':
            return <Navigate to="/assistant" replace />;
        default:
            return <Navigate to="/" replace />;
    }
};

export default ChatRedirect;
