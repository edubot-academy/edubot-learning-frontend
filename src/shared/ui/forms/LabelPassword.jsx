import { useState } from 'react';
import PropTypes from 'prop-types';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const LabelPassword = ({
    label = 'label',
    name = '',
    required = false,
    error = '',
    placeholder = '',
    width = 'w-11/12',
    value: propValue,
    onChange: propOnChange,
    className = '',
    autoComplete,
    describedBy,
    onFocus,
    onBlur,
}) => {
    const [focused, setFocused] = useState(false);
    const [showAsterisk, setShowAsterisk] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasError = !!error;
    const value = propValue ?? '';
    const isActive = focused || value !== '';
    const inputId = name || `password-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const errorId = `${inputId}-error`;
    const describedByIds = [hasError ? errorId : null, describedBy].filter(Boolean).join(' ') || undefined;

    const handleFocus = () => {
        setFocused(true);
        setShowAsterisk(false);
        onFocus?.();
    };

    const handleBlur = () => {
        setFocused(false);
        if (value) {
            setShowAsterisk(true);
        } else {
            setShowAsterisk(false);
        }
        onBlur?.();
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleChange = (e) => {
        if (propOnChange) propOnChange(e);
    };

    return (
        <div className={`flex justify-center items-center w-full ${className}`}>
            <div className={`flex flex-col space-y-1 ${width}`}>
                <div
                    className={`relative border rounded-md transition-colors duration-200
            ${hasError ? 'border-red-600' : focused ? 'border-amber-600' : 'border-gray-300'}
            px-2 sm:px-3 md:px-4
            py-1.5 sm:py-2 md:py-2.5
            bg-white dark:bg-[#222222]
          `}
                >
                    <label
                        htmlFor={inputId}
                        className={`absolute left-2 sm:left-3 transition-all duration-200 ease-in-out
              ${isActive
                                ? '-top-2 sm:-top-3 text-xs sm:text-sm'
                                : 'top-2 sm:top-3 text-gray-500 dark:text-[#a6adba] text-sm sm:text-base'
                            }
              ${hasError ? 'text-red-600' : focused ? 'text-amber-600' : 'text-gray-500 dark:text-[#a6adba]'}
              bg-white dark:bg-[#222222] px-1 pointer-events-none  
            `}
                    >
                        {label}
                        {showAsterisk && <span className="text-red-600 ml-0.5">*</span>}
                    </label>

                    <input
                        id={inputId}
                        type={showPassword ? 'text' : 'password'}
                        name={name}
                        required={required}
                        value={value} // ← Используем только локальное значение
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        aria-invalid={hasError}
                        aria-describedby={describedByIds}
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-[#E8ECF3] text-sm sm:text-base flex items-center pr-10"
                    />

                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-[#a6adba] dark:hover:text-white"
                        onClick={togglePassword}
                        aria-label={showPassword ? 'Сырсөздү жашыруу' : 'Сырсөздү көрсөтүү'}
                        aria-pressed={showPassword}
                    >
                        {showPassword ? <MdVisibility size={24} /> : <MdVisibilityOff size={24} />}
                    </button>
                </div>

                {hasError && (
                    <p id={errorId} className="text-red-600 text-xs sm:text-sm">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

LabelPassword.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    width: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    autoComplete: PropTypes.string,
    describedBy: PropTypes.string,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
};

export default LabelPassword;
