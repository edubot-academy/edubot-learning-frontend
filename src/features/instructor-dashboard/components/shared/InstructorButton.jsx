const InstructorButton = ({ 
    children, 
    onClick, 
    type = 'button', 
    className = '', 
    variant = 'default',
    disabled = false,
    loading = false 
}) => {
    const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';
    
    const variantClasses = {
        default: 'border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
        orange: 'bg-edubot-orange text-white hover:bg-orange-600 shadow-lg hover:shadow-xl',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            className={combinedClasses}
            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Жүктөлүүдө...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default InstructorButton;
