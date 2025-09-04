

const Button = ({ children, onClick, className = "", type = "button", disabled = false, loading = false, ...props }) => {



    const baseStyles =
        "px-4 py-2 rounded-lg text-white font-medium transition focus:outline-none focus:ring-0";

    const defaultStyles =
        "bg-[#19B08F] hover:shadow-[0_0_10px_#FF6A00CC] focus:ring-2 focus:ring-[#FF6A00CC] active:bg-[#D9D9D9]";

    const disabledStyles =
        "bg-[#D9D9D9] text-gray-500 cursor-not-allowed shadow-none";

    const finalStyles = `${baseStyles} ${disabled || loading ? disabledStyles : defaultStyles
        } ${className}`;

    return (
        <div>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled || loading}
                className={finalStyles}
                {...props}
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                ) : (
                    children
                )}
            </button>
        </div>
    )
}

export default Button
