import React from "react";

const AssistantPagination = ({ currentPage, totalPages, loading, setCurrentPage }) => {
    if (totalPages <= 1) return null;

    const visiblePages = [...Array(totalPages).keys()].filter(
        (index) =>
            index + 1 === 1 ||
            index + 1 === totalPages ||
            Math.abs(index + 1 - currentPage) <= 2
    );

    return (
        <div className="flex justify-center items-center mt-4 space-x-2">
            <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                ⟨ Мурунку
            </button>

            {visiblePages.map((page, idx) => (
                <React.Fragment key={page + 1}>
                    {idx > 0 && page - visiblePages[idx - 1] > 1 && (
                        <span className="px-2 text-gray-400 dark:text-gray-300">...</span>
                    )}

                    <button
                        onClick={() => setCurrentPage(page + 1)}
                        disabled={loading}
                        className={`px-3 py-1 rounded border ${currentPage === page + 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        {page + 1}
                    </button>
                </React.Fragment>
            ))}

            <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                Кийинки ⟩
            </button>
        </div>
    );
};

export default AssistantPagination;
