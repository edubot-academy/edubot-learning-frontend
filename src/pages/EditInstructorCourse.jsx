import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseBuilder } from '@features/courses/hooks/useCourseBuilder';
import { getCourseInfoErrors } from '@features/courses/utils/courseBuilder.validation';
import LessonQuizEditor from '@features/courses/components/LessonQuizEditor';
import LessonChallengeEditor from '@features/courses/components/LessonChallengeEditor';
import ArticleEditor from '@features/courses/components/ArticleEditor';
import Loader from '@shared/ui/Loader';
import CourseBuilderStepNav from '@features/courses/components/CourseBuilderStepNav';
import CoursePreviewPanel from '@features/courses/components/CoursePreviewPanel';
import LessonCardHeader from '@features/courses/components/LessonCardHeader';
import LessonMetaFields from '@features/courses/components/LessonMetaFields';
import LessonAssetsPanel from '@features/courses/components/LessonAssetsPanel';
import { minutesInputToSeconds, secondsToMinutesInput } from '@utils/timeUtils';

const EditInstructorCourse = () => {
    const { id } = useParams();
    const {
        step,
        courseId,
        courseInfo,
        infoTouched,
        curriculum,
        categories,
        skillOptions,
        skillsLoading,
        loading,
        saving,
        showCancelConfirm,
        confirmDelete,
        expandedSections,
        singleSectionFocus,
        dragSectionIndex,
        dragLesson,
        isUploading,
        totalLessons,
        readyLessons,
        completionPercent,
        stepItems,
        setStep,
        setCourseId,
        setShowCancelConfirm,
        setConfirmDelete,
        setExpandedSections,
        setSingleSectionFocus,
        setDragSectionIndex,
        setDragLesson,
        loadInitialData,
        handleCourseInfoChange,
        addSection,
        addLesson,
        updateSectionTitle,
        updateSectionSkill,
        updateLesson,
        handleChallengeChange,
        handleQuizChange,
        deleteLesson,
        handleDelete,
        handleFileUpload,
        handleCourseSubmit,
        handleCurriculumSubmit,
        openSection,
        jumpToNextInvalidLesson,
        expandAllSections,
        collapseAllSections,
        scrollToSection,
        handleSectionDrop,
        handleLessonDrop,
        handleSubmitForApproval,
        handleSaveDraft,
    } = useCourseBuilder({ mode: 'edit', courseId: id });

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const renderPreview = () => (
        <CoursePreviewPanel
            course={courseInfo}
            sections={curriculum}
            getSectionTitle={(section) => section.title}
            onBack={() => setStep(2)}
            coverAlt="Курс сүрөтү"
            actions={[
                {
                    label: 'Тастыктоого жөнөтүү',
                    onClick: handleSubmitForApproval,
                    requiresClean: true,
                    className: 'rounded-lg bg-edubot-teal px-6 py-2 text-sm font-medium text-white',
                },
            ]}
        />
    );

    if (loading) return <Loader fullScreen />;
    if (!courseInfo) return <div className="p-6 text-red-500">Курс табылган жок</div>;

    const courseInfoErrors = getCourseInfoErrors(courseInfo || {});

    return (
        <div className="mx-auto max-w-5xl p-6 pt-24">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">Курсту түзөтүү</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Өзгөртүүлөрдү кадам-кадам менен текшерип, акырында превью аркылуу бекитиңиз.
                </p>
            </div>

            <CourseBuilderStepNav step={step} onStepChange={setStep} items={stepItems} />

            {step === 1 && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-4 text-lg font-semibold">Негизги маалымат</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Курс аталышы</label>
                                <input
                                    name="title"
                                    value={courseInfo.title || ''}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Курс аталышы"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.title ? courseInfoErrors.title : ''}</span>
                                    <span className="text-slate-500">{(courseInfo.title || '').length}/200</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Подзаголовок</label>
                                <input
                                    name="subtitle"
                                    value={courseInfo.subtitle || ''}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Кыскача сүрөттөмө"
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-rose-500">{infoTouched.subtitle ? courseInfoErrors.subtitle : ''}</span>
                                    <span className="text-slate-500">{(courseInfo.subtitle || '').length}/255</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Курс сүрөттөмөсү</label>
                                <textarea
                                    name="description"
                                    value={courseInfo.description || ''}
                                    onChange={handleCourseInfoChange}
                                    placeholder="Курс сүрөттөмөсү"
                                    className="min-h-[120px] w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                />
                                <p className="mt-1 text-xs text-rose-500">
                                    {infoTouched.description ? courseInfoErrors.description : ''}
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Категория</label>
                                <select
                                    name="categoryId"
                                    value={courseInfo.categoryId || ''}
                                    disabled
                                    className="w-full rounded-lg border p-2.5 bg-slate-100 text-slate-500 dark:bg-[#1c1c1c] dark:text-slate-400"
                                >
                                    <option value="">Категорияны тандаңыз</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">
                                    Категорияны өзгөртүү азыркы backend update API'де колдоого алынбайт.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-4 text-lg font-semibold">Орнотуулар</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Курс баасы (сом)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={courseInfo.price || ''}
                                        onChange={handleCourseInfoChange}
                                        placeholder="Курс баасы"
                                        disabled={!courseInfo.isPaid}
                                        className="w-full rounded-lg border p-2.5 bg-white disabled:bg-slate-100 dark:bg-[#222222] dark:text-white dark:disabled:bg-[#1c1c1c]"
                                    />
                                    <p className="mt-1 text-xs text-rose-500">{infoTouched.price ? courseInfoErrors.price : ''}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <label htmlFor="isPaid" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                                        <input
                                            id="isPaid"
                                            name="isPaid"
                                            type="checkbox"
                                            checked={courseInfo.isPaid ?? true}
                                            onChange={handleCourseInfoChange}
                                        />
                                        Бул курс акы төлөнүүчү
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <label htmlFor="aiAssistantEnabled" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                                    <input
                                        id="aiAssistantEnabled"
                                        name="aiAssistantEnabled"
                                        type="checkbox"
                                        checked={courseInfo.aiAssistantEnabled ?? false}
                                        onChange={handleCourseInfoChange}
                                    />
                                    EDU AI ассистентин бул курста колдонууга уруксат берүү
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Сабак тили (Language)</label>
                                <select
                                    name="languageCode"
                                    value={courseInfo.languageCode || 'ky'}
                                    onChange={handleCourseInfoChange}
                                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                >
                                    <option value="ky">Кыргызча</option>
                                    <option value="ru">Русский</option>
                                    <option value="en">English</option>
                                </select>
                                <p className="mt-1 text-xs text-rose-500">
                                    {infoTouched.languageCode ? courseInfoErrors.languageCode : ''}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 font-medium">
                                    Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)
                                </label>
                                <textarea
                                    name="learningOutcomesText"
                                    value={courseInfo.learningOutcomesText || ''}
                                    onChange={handleCourseInfoChange}
                                    placeholder={
                                        'Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү'
                                    }
                                    className="w-full rounded-lg border p-2.5 text-sm min-h-[110px] bg-white dark:bg-[#222222] dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]">
                        <h3 className="mb-3 text-lg font-semibold">Cover сүрөт</h3>
                        {courseInfo.coverImageUrl && (
                            <img
                                src={courseInfo.coverImageUrl}
                                alt="Курс сүрөтү"
                                className="mb-3 max-h-52 w-full max-w-lg rounded-lg object-cover"
                            />
                        )}
                        <input
                            type="file"
                            name="cover"
                            accept="image/*"
                            onChange={handleCourseInfoChange}
                            className="w-full rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                        />
                        <p className="mt-1 text-xs text-slate-500">PNG/JPG, максимум 5MB</p>
                    </div>

                    <div className="sticky bottom-4 z-10 flex justify-end gap-3">
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 dark:border-slate-700 dark:bg-[#1c1c1c]"
                        >
                            Артка
                        </button>
                        <button
                            onClick={handleCourseSubmit}
                            disabled={Object.keys(courseInfoErrors).length > 0}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-white disabled:opacity-50 dark:bg-blue-950"
                        >
                            Сактоо жана улантуу
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="sticky top-20 z-20 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-[#151515]/90">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Курулуш режими</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Бөлүмдөр: {curriculum.length} • Сабактар: {totalLessons}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Даярдык: {readyLessons}/{totalLessons} ({completionPercent}%)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => expandAllSections(curriculum.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын ачуу
                                </button>
                                <button
                                    onClick={() => collapseAllSections(curriculum.length)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    Баарын жабуу
                                </button>
                                <button
                                    onClick={() => setSingleSectionFocus(!singleSectionFocus)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f1f1f] dark:text-slate-200"
                                >
                                    {singleSectionFocus ? 'Single focus: ON' : 'Single focus: OFF'}
                                </button>
                                <button
                                    onClick={addSection}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    + Бөлүм кошуу
                                </button>
                                <button
                                    onClick={jumpToNextInvalidLesson}
                                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                                >
                                    Кийинки катаны табуу
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {curriculum.map((section, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                id={`section-${sectionIndex}`}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111111]"
                                draggable
                                onDragStart={() => setDragSectionIndex(sectionIndex)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleSectionDrop(sectionIndex)}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                        className="flex-1 rounded-lg border p-2.5 mr-2 bg-white dark:bg-[#222222] dark:text-white"
                                        placeholder="Бөлүм аталышы"
                                    />
                                    <select
                                        value={section.skillId}
                                        onChange={(e) => updateSectionSkill(sectionIndex, e.target.value)}
                                        className="rounded-lg border p-2.5 mr-2 bg-white dark:bg-[#222222] dark:text-white"
                                        disabled={skillsLoading}
                                    >
                                        <option value="">Skill тандаңыз</option>
                                        {skillOptions.map((skill) => (
                                            <option key={skill.value} value={skill.value}>
                                                {skill.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setConfirmDelete({
                                            type: 'section',
                                            sectionIndex,
                                            title: section.title,
                                        })}
                                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                                        disabled={curriculum.length === 1}
                                    >
                                        Өчүрүү
                                    </button>
                                    <button
                                        onClick={() => openSection(sectionIndex)}
                                        className="ml-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        {expandedSections[sectionIndex] ? 'Жабуу' : 'Ачуу'}
                                    </button>
                                </div>

                                {expandedSections[sectionIndex] && (
                                    <div className="space-y-4">
                                        {section.lessons.map((lesson, lessonIndex) => (
                                            <div
                                                key={lessonIndex}
                                                id={`lesson-${sectionIndex}-${lessonIndex}`}
                                                className="rounded-lg border border-gray-200 p-4"
                                                draggable
                                                onDragStart={() => setDragLesson({ sectionIdx: sectionIndex, lessonIdx: lessonIndex })}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => handleLessonDrop(sectionIndex, lessonIndex)}
                                            >
                                                <LessonCardHeader
                                                    lesson={lesson}
                                                    lessonIndex={lessonIndex}
                                                    sectionIndex={sectionIndex}
                                                    onDelete={() => setConfirmDelete({
                                                        type: 'lesson',
                                                        sectionIndex,
                                                        lessonIndex,
                                                        title: lesson.title || 'Сабак',
                                                    })}
                                                />
                                                
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                                            className="flex-1 rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                                            placeholder="Сабак аталышы"
                                                        />
                                                        <select
                                                            value={lesson.kind}
                                                            onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'kind', e.target.value)}
                                                            className="rounded-lg border p-2.5 bg-white dark:bg-[#222222] dark:text-white"
                                                        >
                                                            <option value="video">Видео</option>
                                                            <option value="article">Макала</option>
                                                            <option value="quiz">Квиз</option>
                                                            <option value="code">Код тапшырма</option>
                                                        </select>
                                                    </div>

                                                    <LessonMetaFields
                                                        lesson={lesson}
                                                        sectionIndex={sectionIndex}
                                                        lessonIndex={lessonIndex}
                                                        updateLesson={updateLesson}
                                                    />

                                                    {lesson.kind === 'article' && (
                                                        <ArticleEditor
                                                            content={lesson.content}
                                                            onChange={(content) => updateLesson(sectionIndex, lessonIndex, 'content', content)}
                                                            duration={lesson.duration}
                                                            onDurationChange={(duration) => updateLesson(sectionIndex, lessonIndex, 'duration', duration)}
                                                        />
                                                    )}

                                                    {lesson.kind === 'quiz' && (
                                                        <LessonQuizEditor
                                                            quiz={lesson.quiz}
                                                            onChange={(quiz) => handleQuizChange(sectionIndex, lessonIndex, quiz)}
                                                        />
                                                    )}

                                                    {lesson.kind === 'code' && (
                                                        <LessonChallengeEditor
                                                            challenge={lesson.challenge}
                                                            onChange={(challenge) => handleChallengeChange(sectionIndex, lessonIndex, challenge)}
                                                        />
                                                    )}

                                                    <LessonAssetsPanel
                                                        lesson={lesson}
                                                        sectionIndex={sectionIndex}
                                                        lessonIndex={lessonIndex}
                                                        onFileUpload={handleFileUpload}
                                                        updateLesson={updateLesson}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button
                                            onClick={() => addLesson(sectionIndex)}
                                            className="w-full rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600 hover:border-gray-400"
                                        >
                                            Сабак кошуу
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="sticky bottom-4 z-10 flex justify-end gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 dark:border-slate-700 dark:bg-[#1c1c1c]"
                        >
                            Артка
                        </button>
                        <button
                            onClick={handleCurriculumSubmit}
                            disabled={saving || isUploading}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-950"
                        >
                            {saving ? 'Сакталууда...' : 'Сактоо'}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && renderPreview()}

            {confirmDelete.type && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Өчүрүүгө ишенимиңиз келеми?</h3>
                        <p className="text-gray-600 mb-6">
                            {confirmDelete.type === 'section' 
                                ? `"${confirmDelete.title}" бөлүмүн жана анын ичиндеги бардык сабактарды өчүрөсүзбү?`
                                : `"${confirmDelete.title}" сабагын өчүрөсүзбү?`
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDelete({ type: null, sectionIndex: null, lessonIndex: null, title: '' })}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Жок
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Ооба, өчүрүү
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Сакталбаган өзгөртүүлөр бар</h3>
                        <p className="text-gray-600 mb-6">
                            Чыгуу үчүн сакталбаган өзгөртүүлөрдү жоготууга ишенимиңиз келеми?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Жок
                            </button>
                            <button
                                onClick={() => window.location.href = '/instructor/courses'}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Ооба, чыгуу
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
