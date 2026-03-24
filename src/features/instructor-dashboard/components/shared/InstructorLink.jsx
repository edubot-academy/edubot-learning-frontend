import { Link } from 'react-router-dom';

const InstructorLink = ({ to, children, className = '', variant = 'default' }) => {
    const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105';
    
    const variantClasses = {
        default: 'border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
        orange: 'bg-edubot-orange text-white hover:bg-orange-600 shadow-lg hover:shadow-xl',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`;

    return (
        <Link to={to} className={combinedClasses}>
            {children}
        </Link>
    );
};

export default InstructorLink;
