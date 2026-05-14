// Course Info Step component
// Shared between CreateCourse and EditInstructorCourse
// Extracted from Step 1 JSX in both components

/**
 * Course Info Step component
 * Renders the course information form (Step 1)
 * @param {Object} props - Component props
 * @param {Object} props.courseInfo - Course information state
 * @param {Function} props.handleCourseInfoChange - Form change handler
 * @param {Object} props.courseInfoErrors - Validation errors
 * @param {Object} props.infoTouched - Touched fields state
 * @param {Array} props.categories - Available categories
 * @param {string} props.mode - 'create' or 'edit'
 * @param {Function} props.handleCourseSubmit - Submit handler
 * @param {boolean} props.disabled - Whether form is disabled
 * @returns {JSX.Element} - Course info form
 */
export const CourseInfoStep = ({
    courseInfo,
    handleCourseInfoChange,
    courseInfoErrors,
    infoTouched,
    categories,
    mode = 'create',
    handleCourseSubmit,
    disabled = false,
}) => {
    const fieldIds = {
        title: 'course-info-title',
        subtitle: 'course-info-subtitle',
        description: 'course-info-description',
        categoryId: 'course-info-category',
        price: 'course-info-price',
        languageCode: 'course-info-language',
        learningOutcomesText: 'course-info-learning-outcomes',
        cover: 'course-info-cover',
    };

    const getError = (field) => (infoTouched[field] ? courseInfoErrors[field] : '');
    const getDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

    return (
        <div className="space-y-5">
            {/* Basic Information */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Негизги маалымат</h3>
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor={fieldIds.title} className="mb-1 block text-sm font-medium">Курс аталышы</label>
                        <input
                            id={fieldIds.title}
                            name="title"
                            value={courseInfo.title || ''}
                            onChange={handleCourseInfoChange}
                            placeholder="Курс аталышы"
                            disabled={disabled}
                            aria-invalid={Boolean(getError('title'))}
                            aria-describedby={getDescribedBy(`${fieldIds.title}-error`, `${fieldIds.title}-count`)}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs">
                            <span id={`${fieldIds.title}-error`} className="text-rose-500">
                                {getError('title')}
                            </span>
                            <span id={`${fieldIds.title}-count`} className="text-gray-600 dark:text-gray-400">
                                {(courseInfo.title || '').length}/200
                            </span>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label htmlFor={fieldIds.subtitle} className="mb-1 block text-sm font-medium">Подзаголовок</label>
                        <input
                            id={fieldIds.subtitle}
                            name="subtitle"
                            value={courseInfo.subtitle || ''}
                            onChange={handleCourseInfoChange}
                            placeholder="Кыскача сүрөттөмө"
                            disabled={disabled}
                            aria-invalid={Boolean(getError('subtitle'))}
                            aria-describedby={getDescribedBy(`${fieldIds.subtitle}-error`, `${fieldIds.subtitle}-count`)}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs">
                            <span id={`${fieldIds.subtitle}-error`} className="text-rose-500">
                                {getError('subtitle')}
                            </span>
                            <span id={`${fieldIds.subtitle}-count`} className="text-gray-600 dark:text-gray-400">
                                {(courseInfo.subtitle || '').length}/255
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor={fieldIds.description} className="mb-1 block text-sm font-medium">Курс сүрөттөмөсү</label>
                        <textarea
                            id={fieldIds.description}
                            name="description"
                            value={courseInfo.description || ''}
                            onChange={handleCourseInfoChange}
                            placeholder="Курс сүрөттөмөсү"
                            disabled={disabled}
                            aria-invalid={Boolean(getError('description'))}
                            aria-describedby={`${fieldIds.description}-error`}
                            className="min-h-[120px] w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        />
                        <p id={`${fieldIds.description}-error`} className="mt-1 text-xs text-rose-500">
                            {getError('description')}
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor={fieldIds.categoryId} className="mb-1 block text-sm font-medium">Категория</label>
                        <select
                            id={fieldIds.categoryId}
                            name="categoryId"
                            value={courseInfo.categoryId || ''}
                            onChange={handleCourseInfoChange}
                            disabled={disabled || mode === 'edit'} // Category cannot be changed in edit mode
                            aria-invalid={Boolean(getError('categoryId'))}
                            aria-describedby={getDescribedBy(
                                `${fieldIds.categoryId}-error`,
                                mode === 'edit' ? `${fieldIds.categoryId}-helper` : null
                            )}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        >
                            <option value="">Категорияны тандаңыз</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p id={`${fieldIds.categoryId}-error`} className="mt-1 text-xs text-rose-500">
                            {getError('categoryId')}
                        </p>
                        {mode === 'edit' && (
                            <p id={`${fieldIds.categoryId}-helper`} className="mt-1 text-xs text-slate-500">
                                Категорияны өзгөртүү азыркы backend update API&apos;де колдоого алынбайт.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">
                    {mode === 'create' ? 'Настройкалар' : 'Орнотуулар'}
                </h3>
                <div className="space-y-4">
                    {/* Price */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor={fieldIds.price} className="block text-sm mb-1 font-medium">Курс баасы (сом)</label>
                            <input
                                id={fieldIds.price}
                                name="price"
                                type="number"
                                value={courseInfo.isPaid ? (courseInfo.price || '') : '0'}
                                onChange={handleCourseInfoChange}
                                placeholder="Курс баасы"
                                disabled={disabled || !courseInfo.isPaid}
                                aria-invalid={Boolean(getError('price'))}
                                aria-describedby={`${fieldIds.price}-error`}
                                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            />
                            <p id={`${fieldIds.price}-error`} className="mt-1 text-xs text-rose-500">
                                {getError('price')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-7">
                            <input
                                id="isPaid"
                                name="isPaid"
                                type="checkbox"
                                checked={courseInfo.isPaid ?? true}
                                onChange={handleCourseInfoChange}
                                disabled={disabled}
                                className="disabled:opacity-50"
                            />
                            <label htmlFor="isPaid" className="text-sm">
                                Бул курс акы төлөнүүчү
                            </label>
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="flex items-center gap-2">
                        <input
                            id="aiAssistantEnabled"
                            name="aiAssistantEnabled"
                            type="checkbox"
                            checked={courseInfo.aiAssistantEnabled ?? false}
                            onChange={handleCourseInfoChange}
                            disabled={disabled}
                            className="disabled:opacity-50"
                        />
                        <label htmlFor="aiAssistantEnabled" className="text-sm">
                            EDU AI ассистенттин бул курста иштешине уруксат берүү
                        </label>
                    </div>

                    {/* Language */}
                    <div>
                        <label htmlFor={fieldIds.languageCode} className="block text-sm mb-1 font-medium">
                            Сабак тили {mode === 'edit' && '(Language)'}
                        </label>
                        <select
                            id={fieldIds.languageCode}
                            name="languageCode"
                            value={courseInfo.languageCode || 'ky'}
                            onChange={handleCourseInfoChange}
                            disabled={disabled}
                            aria-invalid={Boolean(getError('languageCode'))}
                            aria-describedby={`${fieldIds.languageCode}-error`}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                        >
                            <option value="ky">Кыргызча</option>
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                        <p id={`${fieldIds.languageCode}-error`} className="mt-1 text-xs text-rose-500">
                            {getError('languageCode')}
                        </p>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                        <label htmlFor={fieldIds.learningOutcomesText} className="block text-sm mb-1 font-medium">
                            Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)
                        </label>
                        <textarea
                            id={fieldIds.learningOutcomesText}
                            name="learningOutcomesText"
                            value={courseInfo.learningOutcomesText || ''}
                            onChange={handleCourseInfoChange}
                            placeholder={
                                'Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү'
                            }
                            disabled={disabled}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[110px] disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold">Cover сүрөт</h3>
                {courseInfo.coverImageUrl && (
                    <img
                        src={courseInfo.coverImageUrl}
                        alt="Курс сүрөтү"
                        className="mb-3 max-h-52 w-full max-w-lg rounded-lg object-cover"
                    />
                )}
                <label htmlFor={fieldIds.cover} className="sr-only">Cover сүрөт файлы</label>
                <input
                    id={fieldIds.cover}
                    type="file"
                    name="cover"
                    accept="image/*"
                    onChange={handleCourseInfoChange}
                    disabled={disabled}
                    aria-describedby={getDescribedBy(
                        `${fieldIds.cover}-helper`,
                        !courseInfo.coverImageUrl && courseInfo.pendingCoverName ? `${fieldIds.cover}-pending` : null
                    )}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                {!courseInfo.coverImageUrl && courseInfo.pendingCoverName && (
                    <p id={`${fieldIds.cover}-pending`} className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                        Тандалган cover сакталган эмес: {courseInfo.pendingCoverName}. Сураныч, файлды кайра тандаңыз.
                    </p>
                )}
                <p id={`${fieldIds.cover}-helper`} className="mt-1 text-xs text-slate-500">PNG/JPG, максимум 5MB</p>
            </div>

            {/* Submit Button */}
            {!disabled && (
                <div className="sticky bottom-4 z-10 flex justify-end gap-3">
                    {mode === 'edit' && (
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 dark:border-gray-600 dark:bg-gray-700"
                        >
                            Артка
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            handleCourseSubmit();
                        }}
                        disabled={Object.keys(courseInfoErrors).length > 0}
                        className="rounded-xl bg-slate-900 px-6 py-2.5 text-white disabled:opacity-50 dark:bg-blue-950"
                    >
                        Сактоо жана улантуу
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseInfoStep;
