const LessonMetaFields = ({
    title,
    kind,
    kindOptions,
    onTitleChange,
    onKindChange,
}) => {
    return (
        <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
                <label className="mb-1 block text-sm font-medium">Сабак аталышы</label>
                <input
                    className="w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Сабак аталышы"
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Сабактын тиби</label>
                <select
                    className="w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={kind || 'video'}
                    onChange={(e) => onKindChange(e.target.value)}
                >
                    {kindOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LessonMetaFields;
