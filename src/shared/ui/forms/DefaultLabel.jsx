import { useState } from 'react';
import PropTypes from 'prop-types';

const DefaultLabel = ({
    label = 'label',
    name = '',
    id,
    type = 'text',
    required = false,
    error = '',
    placeholder = '',
    width = 'w-11/12',
    value: propValue,
    onChange: propOnChange,
    className = '',
    autoComplete,
    onFocus,
    onBlur,
}) => {
    const [focused, setFocused] = useState(false);

    const hasError = !!error;
    const value = propValue ?? '';
    const isActive = focused || value !== '';
    const inputId = id || name || `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const errorId = `${inputId}-error`;

    const handleFocus = () => {
        setFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setFocused(false);
        onBlur?.();
    };

    const handleChange = (e) => {
        if (propOnChange) propOnChange(e);
    };

    return (
        <div className={`flex justify-center items-center w-full ${className}`}>
            <div className={`flex flex-col space-y-1 ${width}`}>
                <div
                    className={`relative border rounded-md transition-colors duration-200
            ${hasError ? 'border-red-600 bg-red-50/60 dark:border-red-500 dark:bg-red-950/20' : focused ? 'border-amber-600 dark:border-amber-500 bg-white dark:bg-[#222222]' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222]'}
            px-2 sm:px-3 md:px-4
            py-1.5 sm:py-2 md:py-2.5
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
              ${hasError ? 'bg-red-50 dark:bg-[#251b1b]' : 'bg-white dark:bg-[#222222]'} px-1 pointer-events-none
            `}
                    >
                        {label}
                        {required && (
                            <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>

                    <input
                        id={inputId}
                        type={type}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        required={required}
                        autoComplete={autoComplete}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? errorId : undefined}
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-[#E8ECF3] text-sm sm:text-base"
                    />
                </div>

                {hasError && <p id={errorId} className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>}
            </div>
        </div>
    );
};

DefaultLabel.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    width: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    className: PropTypes.string,
    autoComplete: PropTypes.string,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
};

export default DefaultLabel;
