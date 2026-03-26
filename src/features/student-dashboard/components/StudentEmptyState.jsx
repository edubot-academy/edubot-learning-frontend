import { FiMessageCircle } from 'react-icons/fi';

const StudentEmptyState = ({ title, description }) => {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {description}
            </p>
        </div>
    );
};

export default StudentEmptyState;
