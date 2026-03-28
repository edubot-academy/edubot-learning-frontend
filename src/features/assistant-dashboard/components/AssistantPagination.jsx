const AssistantPagination = ({ currentPage, totalPages, loading, setCurrentPage }) => {
    if (totalPages <= 1) return null;

    const visiblePages = [...Array(totalPages).keys()].filter(
        (index) =>
            index + 1 === 1 ||
            index + 1 === totalPages ||
            Math.abs(index + 1 - currentPage) <= 2
    );

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-5">
            <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="dashboard-button-secondary disabled:opacity-50"
            >
                ⟨ Мурунку
            </button>

            {visiblePages.map((page, idx) => (
                <div key={page + 1} className="flex items-center gap-2">
                    {idx > 0 && page - visiblePages[idx - 1] > 1 ? (
                        <span className="px-1 text-edubot-muted dark:text-slate-400">...</span>
                    ) : null}

                    <button
                        onClick={() => setCurrentPage(page + 1)}
                        disabled={loading}
                        className={`h-10 min-w-10 rounded-2xl border px-3 text-sm font-semibold transition ${
                            currentPage === page + 1
                                ? 'border-edubot-orange bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                                : 'border-edubot-line bg-white text-edubot-ink hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                        }`}
                    >
                        {page + 1}
                    </button>
                </div>
            ))}

            <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="dashboard-button-secondary disabled:opacity-50"
            >
                Кийинки ⟩
            </button>
        </div>
    );
};

export default AssistantPagination;
