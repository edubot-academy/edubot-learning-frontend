import { useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';

const LabelSearch = ({
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

    // Объединяем контролируемый и локальный value
    const currentValue = propValue !== undefined ? propValue : value;

    const isActive = focused || currentValue !== '';

    const handleFocus = () => {
        setFocused(true);
        setShowAsterisk(false); // скрываем звездочку при фокусе
    };

    const handleBlur = () => {
        setFocused(false);
        // показываем звездочку только если есть текст
        if (currentValue) {
            setShowAsterisk(true);
        } else {
            setShowAsterisk(false);
        }
    };

    const handleChange = (e) => {
        setValue(e.target.value);
        if (propOnChange) propOnChange(e);
    };

    const clearInput = () => {
        setValue('');
        setShowAsterisk(false);
        if (propOnChange) propOnChange({ target: { value: '' } });
    };

    return (
        <div className={`flex justify-center items-center w-full py-6 ${className}`}>
            <div className={`flex flex-col space-y-1 ${width}`}>
                <div
                    className={`relative border rounded-md transition-colors duration-200
            ${hasError ? 'border-red-600' : focused ? 'border-[#EA580C] dark:border-[#F97316]' : 'border-gray-300 dark:border-gray-600'}
            px-2 sm:px-3 md:px-4
            py-1.5 sm:py-2 md:py-2.5
            bg-white dark:bg-gray-800
          `}
                >
                    {/* Лейбл */}
                    <label
                        className={`absolute left-2 pl-5 sm:left-3 transition-all duration-200 ease-in-out
    ${isActive
                                ? '-top-2 sm:-top-3 text-xs sm:text-sm'
                                : 'top-2 sm:top-3 text-gray-500 text-sm sm:text-base'
                            }
    ${hasError ? 'text-red-600' : focused ? 'text-[#EA580C] dark:text-[#F97316]' : 'text-gray-500'}
    bg-white dark:bg-gray-800 px-1 pointer-events-none  
  `}
                    >
                        {label}
                        {showAsterisk && <span className="text-red-600 ml-0.5">*</span>}
                    </label>

                    {/* Иконка поиска */}
                    <IoSearch className={`absolute left-2 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-[#EA580C] dark:text-[#F97316]' : 'text-gray-400 dark:text-gray-500'}`} size={20} />

                    {/* Инпут */}
                    <input
                        type="text"
                        value={currentValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="w-full pl-8 pr-8 bg-transparent outline-none text-gray-900 dark:text-white text-sm sm:text-base flex items-center focus:outline-none focus:ring-1 focus:ring-[#EA580C] dark:focus:ring-[#F97316]"
                    />

                    {/* Крестик для очистки */}
                    {currentValue && (
                        <MdOutlineClear
                            onClick={clearInput}
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer "
                            size={20}
                        />
                    )}
                </div>

                {/* Ошибка */}
                {hasError && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default LabelSearch;
