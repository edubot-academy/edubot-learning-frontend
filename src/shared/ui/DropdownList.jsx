import React, { useState, useEffect, useRef } from 'react';

export default function DropdownList() {
    const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'];

    const [isOpenSimple, setIsOpenSimple] = useState(false);
    const [isOpenCheckbox, setIsOpenCheckbox] = useState(false);
    const [isOpenSearch, setIsOpenSearch] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const simpleRef = useRef();
    const checkboxRef = useRef();
    const searchRef = useRef();

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                simpleRef.current &&
                !simpleRef.current.contains(event.target) &&
                checkboxRef.current &&
                !checkboxRef.current.contains(event.target) &&
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsOpenSimple(false);
                setIsOpenCheckbox(false);
                setIsOpenSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSelect = (item) => {
        setSelectedItems((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const filteredItems = items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-wrap gap-6 justify-center p-6">
            <div className="relative" ref={simpleRef}>
                <button
                    onClick={() => setIsOpenSimple(!isOpenSimple)}
                    className="px-4 py-2 bg-white shadow rounded-lg text-gray-700 w-60 hover:bg-gray-50 transition"
                >
                    Simple Dropdown
                </button>

                {isOpenSimple && (
                    <div className="absolute mt-2 bg-white shadow-lg rounded-lg overflow-y-auto border border-gray-200 w-[90vw] max-w-[280px] h-[260px] z-10">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" ref={checkboxRef}>
                <button
                    onClick={() => setIsOpenCheckbox(!isOpenCheckbox)}
                    className="px-4 py-2 bg-white shadow rounded-lg text-gray-700 w-60 hover:bg-gray-50 transition"
                >
                    Dropdown with checkboxes
                </button>

                {isOpenCheckbox && (
                    <div className="absolute mt-2 bg-white shadow-lg rounded-lg overflow-y-auto border border-gray-200 w-[90vw] max-w-[280px] h-[260px] z-20">
                        {items.map((item, idx) => (
                            <label
                                key={idx}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item)}
                                    onChange={() => toggleSelect(item)}
                                    className="mr-2 accent-orange-500"
                                />
                                {item}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" ref={searchRef}>
                <button
                    onClick={() => setIsOpenSearch(!isOpenSearch)}
                    className="px-4 py-2 bg-white shadow rounded-lg text-gray-700 w-60 hover:bg-gray-50 transition"
                >
                    Dropdown with search
                </button>

                {isOpenSearch && (
                    <div className="absolute mt-2 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 w-[90vw] max-w-[280px] h-[330px] flex flex-col z-30">
                        <div className="flex items-center border-b px-3 py-2">
                            <span className="text-gray-400 mr-2">🔍</span>
                            <input
                                type="text"
                                placeholder="Поиск"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredItems.map((item, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item)}
                                        onChange={() => toggleSelect(item)}
                                        className="mr-2 accent-orange-500"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsOpenSearch(false)}
                            className="bg-orange-500 text-white py-2 font-medium hover:bg-orange-600 transition"
                        >
                            Даяр болду
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
