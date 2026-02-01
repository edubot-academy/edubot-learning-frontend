import React from 'react';

const TEXT = {
    ky: {
        placeholder: 'Аты же email боюнча издөө',
        add: 'Тизмеге кошуу',
        empty: 'Натыйжалар табылган жок',
    },
    ru: {
        placeholder: 'Поиск по имени или email',
        add: 'Добавить',
        empty: 'Ничего не найдено',
    },
};

const StudentSearchCombobox = ({
    query,
    setQuery,
    results = [],
    onSelect,
    loading = false,
    lang = 'ky',
    autoFocus = false,
}) => {
    const copy = TEXT[lang] || TEXT.ky;
    return (
        <div className="space-y-2">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.placeholder}
                autoFocus={autoFocus}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
            />
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-52 overflow-y-auto">
                {loading && <div className="p-3 text-sm text-gray-500">Жүктөлүүдө...</div>}
                {!loading && results.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">{copy.empty}</div>
                )}
                {results.map((student) => (
                    <div
                        key={student.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.name || student.fullName || student.email}
                            </p>
                            <p className="text-xs text-gray-500">{student.email || student.phone}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelect(student)}
                            className="text-emerald-600 text-sm font-semibold"
                        >
                            {copy.add}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentSearchCombobox;
