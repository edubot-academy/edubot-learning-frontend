import { useState, useEffect } from 'react';

const DefaultLabel = ({
    label = 'label',
    required = false,
    error = '',
    placeholder = '',
    width = 'w-11/12',
    value: propValue,
    onChange: propOnChange,
    className = '',
}) => {
    const [value, setValue] = useState(propValue || '');
    const [focused, setFocused] = useState(false);
    const [showAsterisk, setShowAsterisk] = useState(false);

    // Синхронизация с пропсами
    useEffect(() => {
        if (propValue !== undefined) {
            setValue(propValue);
        }
    }, [propValue]);

    const hasError = !!error;
    const isActive = focused || value !== '';

    const handleFocus = () => {
        setFocused(true);
        setShowAsterisk(false);
    };

    const handleBlur = () => {
        setFocused(false);
        if (value) {
            setShowAsterisk(true);
        } else {
            setShowAsterisk(false);
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
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
            bg-white
          `}
                >
                    <label
                        className={`absolute left-2 sm:left-3 transition-all duration-200 ease-in-out
              ${
                  isActive
                      ? '-top-2 sm:-top-3 text-xs sm:text-sm'
                      : 'top-2 sm:top-3 text-gray-500 text-sm sm:text-base'
              }
              ${hasError ? 'text-red-600' : focused ? 'text-amber-600' : 'text-gray-500'}
              bg-white px-1 pointer-events-none  
            `}
                    >
                        {label}
                        {showAsterisk && <span className="text-red-600 ml-0.5">*</span>}
                    </label>

                    <input
                        type="text"
                        value={value} // Всегда используем локальное значение
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="w-full bg-transparent outline-none text-gray-900 text-sm sm:text-base"
                    />
                </div>

                {hasError && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default DefaultLabel;
