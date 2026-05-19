import { useTranslation } from 'react-i18next';

const LessonMetaFields = ({
    title,
    kind,
    kindOptions,
    onTitleChange,
    onKindChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
                <label className="mb-1 block text-sm font-medium">{t('instructorDashboard.courseBuilder.lessonFields.title')}</label>
                <input
                    className="w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder={t('instructorDashboard.courseBuilder.placeholders.lessonTitle')}
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">{t('instructorDashboard.courseBuilder.lessonFields.type')}</label>
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
