const CourseBuilderStepNav = ({ step, onStepChange, items = [] }) => {
    return (
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onStepChange(item.id)}
                    disabled={!item.enabled}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        step === item.id
                            ? 'bg-slate-900 text-white dark:bg-blue-950'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-[#1c1c1c] dark:text-slate-200'
                    }`}
                >
                    {item.id}. {item.label}
                </button>
            ))}
        </div>
    );
};

export default CourseBuilderStepNav;
