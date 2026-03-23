const LessonCardHeader = ({
    lessonIndex,
    lessonKind,
    lessonIssue,
    onDragStart,
    onDragEnd,
    onDelete,
}) => {
    return (
        <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Сабак #{lessonIndex + 1}
                </span>
                <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    {lessonKind || 'video'}
                </span>
                {lessonIssue ? (
                    <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                        {lessonIssue}
                    </span>
                ) : (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Даяр
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    draggable
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    className="group relative cursor-grab rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-300"
                    title="Сабакты жылдыруу"
                    aria-label="Сабакты жылдыруу"
                >
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                        <circle cx="5" cy="4" r="1.1" />
                        <circle cx="11" cy="4" r="1.1" />
                        <circle cx="5" cy="8" r="1.1" />
                        <circle cx="11" cy="8" r="1.1" />
                        <circle cx="5" cy="12" r="1.1" />
                        <circle cx="11" cy="12" r="1.1" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                >
                    Өчүрүү
                </button>
            </div>
        </div>
    );
};

export default LessonCardHeader;
