import React from 'react';

const tabs = [
    { key: 'users', label: 'Колдонуучулар' },
    { key: 'courses', label: 'Курстар' },
    { key: 'contacts', label: 'Байланыш' },
    { key: 'pending', label: 'Каралуудагы курстар' },
    { key: 'backfill', label: 'Backfill' },
    { key: 'companies', label: 'Компаниялар' },
];

const AdminTabSwitcher = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex justify-center gap-4 mb-8">
            {tabs.map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 rounded ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default AdminTabSwitcher;
