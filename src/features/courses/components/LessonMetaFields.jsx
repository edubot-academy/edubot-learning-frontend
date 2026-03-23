import { LESSON_KIND_OPTIONS } from '../../../constants/lessons';

const LessonMetaFields = ({
    lesson,
    sectionIndex,
    lessonIndex,
    updateLesson,
    // Legacy props for backward compatibility
    title,
    kind,
    kindOptions,
    onTitleChange,
    onKindChange,
}) => {
    // Use new pattern if available, otherwise fall back to legacy props
    const lessonTitle = lesson?.title || title || '';
    const lessonKind = lesson?.kind || kind || 'video';
    const options = kindOptions || LESSON_KIND_OPTIONS;

    const handleTitleChange = (value) => {
        if (onTitleChange) {
            onTitleChange(value);
        } else if (updateLesson) {
            updateLesson(sectionIndex, lessonIndex, 'title', value);
        }
    };

    const handleKindChange = (value) => {
        if (onKindChange) {
            onKindChange(value);
        } else if (updateLesson) {
            updateLesson(sectionIndex, lessonIndex, 'kind', value);
        }
    };

    return (
        <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
                <label className="mb-1 block text-sm font-medium">Сабак аталышы</label>
                <input
                    className="w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={lessonTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Сабак аталышы"
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Сабактын тиби</label>
                <select
                    className="w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={lessonKind}
                    onChange={(e) => handleKindChange(e.target.value)}
                >
                    {options.map((option) => (
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
