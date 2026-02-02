const PillTabs = ({ tabs = [], activeId, onChange }) => {
    return (
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-4 py-2 text-sm rounded-full transition ${
                        activeId === tab.id
                            ? 'bg-white dark:bg-gray-900 shadow text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default PillTabs;
