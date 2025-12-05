import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

const LabelArrow = ({
    label = 'Label',
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
        setValue(e.target.value);
        if (propOnChange) propOnChange(e);
    };

    return (
        <div className={`flex justify-center items-center w-full py-6 ${className}`}>
            <div className={`flex flex-col space-y-1 ${width}`}>
                <div
                    className={`relative border rounded-md transition-colors duration-200
            ${hasError ? 'border-red-600' : focused ? 'border-amber-600' : 'border-gray-300'}
            px-2 sm:px-3 md:px-4
            py-1.5 sm:py-2 md:py-2.5
            bg-white
          `}
                >
                    {/* Лейбл - ДОБАВЛЕНО pointer-events-none */}
                    <label
                        className={`absolute left-2 sm:left-3 transition-all duration-200 ease-in-out
              ${
                  isActive
                      ? '-top-2 sm:-top-3 text-xs sm:text-sm'
                      : 'top-2 sm:top-3 text-gray-500 text-sm sm:text-base'
              }
              ${hasError ? 'text-red-600' : focused ? 'text-amber-600' : 'text-gray-500'}
              bg-white px-1 pointer-events-none  // ← ВОТ ЭТО ДОБАВЬ
            `}
                    >
                        {label}
                        {showAsterisk && <span className="text-red-600 ml-0.5">*</span>}
                    </label>

                    {/* Инпут */}
                    <input
                        type="text"
                        value={propValue !== undefined ? propValue : value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="w-full bg-transparent outline-none text-gray-900 text-sm sm:text-base flex items-center"
                    />

                    {/* Иконка стрелки */}
                    <IoIosArrowDown className="absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Ошибка */}
                {hasError && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default LabelArrow;
