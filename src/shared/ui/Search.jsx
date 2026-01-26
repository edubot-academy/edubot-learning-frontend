import React, { useState } from 'react';
import { BiSearch } from 'react-icons/bi'; // иконка search

export default function Search() {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState('');

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                className={`flex items-center w-full max-w-[274px] h-14 border rounded-lg px-4 transition-colors duration-200
                    ${isFocused 
                        ? 'border-[#EA580C] dark:border-[#F97316] shadow-sm dark:shadow-sm' 
                        : 'border-[#7B818C] dark:border-white'} 
                    bg-white dark:bg-gray-800`}
            >
                <BiSearch
                    className={`text-xl transition-colors duration-200
                        ${isFocused || value 
                            ? 'text-[#EA580C] dark:text-[#F97316]' 
                            : 'text-[#7B818C] dark:text-gray-400'}`}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isFocused || value ? '' : 'Поиск'}
                    className={`ml-2 w-full h-full outline-none text-base bg-transparent
                        ${isFocused || value 
                            ? 'text-[#EA580C] dark:text-[#F97316]' 
                            : 'text-[#7B818C] dark:text-gray-300'}
                        placeholder:text-[#7B818C] dark:placeholder:text-gray-500`}
                />
            </div>
        </div>
    );
}