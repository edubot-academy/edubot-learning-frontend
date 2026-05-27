// CreateCourse Refactor component
// Uses the shared course builder architecture
// Maintains identical functionality to original CreateCourse.jsx

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Loader from '../shared/ui/Loader';

// Import shared course builder architecture
import { useCourseBuilder } from '../features/courses/builder';
import { CourseInfoStep, CurriculumStep, PreviewStep } from '../features/courses/builder/components';
import CourseBuilderStepNav from '../features/courses/components/CourseBuilderStepNav';
import { getFirstInvalidLessonTarget } from '../features/courses/builder/validation';

// API imports (same as original)
import { markCoursePending } from '../features/courses/api';
import { isForbiddenError, parseApiError } from '../shared/api/error';

const formatDraftTime = (isoValue, language) => {
    if (!isoValue) return '';
    const parsed = new Date(isoValue);
    if (Number.isNaN(parsed.getTime())) return '';

    return parsed.toLocaleString(language || undefined, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * CreateCourse component
 * Refactored to use shared course builder architecture
 * Maintains identical UX and functionality to original CreateCourse.jsx
 */
const CreateCourse = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Use the shared course builder hook in create mode
    const {
        // State
        step,
        setStep,
        loading,
        courseInfo,
        handleCourseInfoChange,
        courseInfoErrors,
        infoTouched,
        curriculum,
        curriculumStats,
        isUploading,
        expandedSections,
        setExpandedSections,
        singleSectionFocus,
        dragSectionIndex,
        setDragSectionIndex,
        dragLesson,
        setDragLesson,
        categories,
        skillOptions,
        skillsLoading,
        confirmDelete,
        setConfirmDelete,
        stepItems,
        draftLoadedAt,
        lastDraftSavedAt,
        aiCourseDraftEnabled,
        aiCourseDraft,
        aiCourseDrafting,
        aiCourseDraftError,
        discardDraft,
        requestAiCourseDraft,
        useAiCourseDraft,
        cancelAiCourseDraft,

        // Course Info Operations
        handleCourseSubmit,

        // Curriculum Operations
        handleCurriculumSubmit,
        handleAddSection,
        handleUpdateSectionTitle,
        handleUpdateSectionSkill,
        handleDeleteSection,
        handleAddLesson,
        handleUpdateLesson,
        handleDeleteLesson,
        handleQuizChange,
        aiLessonQuizDraftEnabled,
        aiLessonQuizDraft,
        aiLessonQuizDraftingKey,
        aiLessonQuizDraftError,
        handleRequestAiLessonQuizDraft,
        handleUseAiLessonQuizDraft,
        handleCancelAiLessonQuizDraft,
        aiLessonKitDraftEnabled,
        aiLessonKitDraft,
        aiLessonKitDraftingKey,
        aiLessonKitDraftError,
        handleRequestAiLessonKitDraft,
        handleUseAiLessonKitDraft,
        handleCancelAiLessonKitDraft,
        handleChallengeChange,
        handleFileUpload,
        handleSectionDrop,
        handleMoveSection,
        handleLessonDrop,
        handleMoveLesson,
        openSection,
        expandAllSections,
        collapseAllSections,
        setSingleSectionFocus,
        jumpToNextInvalidLesson,
        loadSkillsList,
        hasUnsavedChanges,

        courseId,
    } = useCourseBuilder({ mode: 'create' });

    // Handle curriculum submission (Step 2)
    const handleCurriculumSubmitFromComponent = async () => {
        const success = await handleCurriculumSubmit();
        if (success) {
            setStep(3);
        }
    };

    // Handle save draft (create mode specific)
    const handleSaveDraft = () => {
        toast.success(t('instructorDashboard.createCoursePage.toasts.savedForReview'));
        localStorage.removeItem('draftCourse');
        navigate('/instructor/courses');
    };

    // Handle submit for approval
    const handleSubmitForApproval = async () => {
        if (hasUnsavedChanges) {
            toast.error(t('instructorDashboard.createCoursePage.toasts.saveBeforeApproval'));
            return;
        }

        try {
            await markCoursePending(courseId);
            toast.success(t('instructorDashboard.createCoursePage.toasts.submittedForApproval'));
            localStorage.removeItem('draftCourse');
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Failed to submit for approval', error);
            if (isForbiddenError(error)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(error, t('instructorDashboard.createCoursePage.toasts.submitError')).message);
        }
    };

    // Handle confirmed delete
    const handleConfirmedDelete = () => {
        const { sectionIndex, lessonIndex } = confirmDelete;

        if (confirmDelete.type === 'section') {
            handleDeleteSection(sectionIndex);
        } else if (confirmDelete.type === 'lesson') {
            handleDeleteLesson(sectionIndex, lessonIndex);
        }

        setConfirmDelete({
            type: null,
            sectionIndex: null,
            lessonIndex: null,
            title: '',
        });
    };

    const handleDiscardDraft = () => {
        const result = discardDraft();

        if (result?.preservedServerDraft) {
            toast.success(t('instructorDashboard.createCoursePage.toasts.localDraftClearedServerPreserved'));
            return;
        }

        if (result?.cleared) {
            toast.success(t('instructorDashboard.createCoursePage.toasts.localDraftCleared'));
        }
    };

    // Handle step change with validation
    const handleStepChange = (newStep) => {
        if (newStep === 3) {
            // Validate before going to preview
            const target = getFirstInvalidLessonTarget(curriculum);
            if (target) {
                toast.error(
                    t('instructorDashboard.createCoursePage.toasts.invalidLesson', {
                        issue: target.issue,
                        section: target.sIdx + 1,
                        lesson: target.lIdx + 1,
                    })
                );
                openSection(target.sIdx);
                setStep(2);
                return;
            }
        }
        setStep(newStep);
    };

    // Show loading state
    if (loading) return <Loader fullScreen />;

    return (
        <div className="mx-auto max-w-5xl p-6 pt-24">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">
                    {t('instructorDashboard.createCoursePage.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('instructorDashboard.createCoursePage.description')}
                </p>
                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:grid-cols-3">
                    <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700">
                        {t('instructorDashboard.createCoursePage.steps.info')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700">
                        {t('instructorDashboard.createCoursePage.steps.lessons')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700">
                        {t('instructorDashboard.createCoursePage.steps.submit')}
                    </span>
                </div>
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="font-semibold">{t('instructorDashboard.createCoursePage.draft.title')}</p>
                            <p className="mt-1 text-blue-800 dark:text-blue-200">
                                {draftLoadedAt
                                    ? t('instructorDashboard.createCoursePage.draft.restored', {
                                        time: formatDraftTime(draftLoadedAt, i18n.language),
                                    })
                                    : t('instructorDashboard.createCoursePage.draft.description')}
                                {lastDraftSavedAt
                                    ? ` ${t('instructorDashboard.createCoursePage.draft.lastSaved', {
                                        time: formatDraftTime(lastDraftSavedAt, i18n.language),
                                    })}`
                                    : ''}
                            </p>
                        </div>
                        {(draftLoadedAt || lastDraftSavedAt) && (
                            <button
                                type="button"
                                onClick={handleDiscardDraft}
                                className="self-start rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-900/60"
                            >
                                {t('instructorDashboard.createCoursePage.actions.clearDraft')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Step Navigation */}
            <CourseBuilderStepNav step={step} onStepChange={handleStepChange} items={stepItems} />

            {/* Step 1: Course Information */}
            {step === 1 && (
                <CourseInfoStep
                    courseInfo={courseInfo}
                    handleCourseInfoChange={handleCourseInfoChange}
                    courseInfoErrors={courseInfoErrors}
                    infoTouched={infoTouched}
                    categories={categories}
                    mode="create"
                    handleCourseSubmit={handleCourseSubmit}
                    aiCourseDraftEnabled={aiCourseDraftEnabled}
                    aiCourseDraft={aiCourseDraft?.output}
                    aiCourseDrafting={aiCourseDrafting}
                    aiCourseDraftError={aiCourseDraftError}
                    onRequestAiCourseDraft={requestAiCourseDraft}
                    onUseAiCourseDraft={useAiCourseDraft}
                    onCancelAiCourseDraft={cancelAiCourseDraft}
                />
            )}

            {/* Step 2: Curriculum */}
            {step === 2 && (
                <CurriculumStep
                    curriculum={curriculum}
                    curriculumStats={curriculumStats}
                    isUploading={isUploading}
                    expandedSections={expandedSections}
                    setExpandedSections={setExpandedSections}
                    singleSectionFocus={singleSectionFocus}
                    dragSectionIndex={dragSectionIndex}
                    setDragSectionIndex={setDragSectionIndex}
                    dragLesson={dragLesson}
                    setDragLesson={setDragLesson}
                    skillOptions={skillOptions}
                    skillsLoading={skillsLoading}
                    courseId={courseId}
                    handleAddSection={handleAddSection}
                    handleUpdateSectionTitle={handleUpdateSectionTitle}
                    handleUpdateSectionSkill={handleUpdateSectionSkill}
                    handleDeleteSection={handleDeleteSection}
                    handleAddLesson={handleAddLesson}
                    handleUpdateLesson={handleUpdateLesson}
                    handleDeleteLesson={handleDeleteLesson}
                    handleQuizChange={handleQuizChange}
                    aiLessonQuizDraftEnabled={aiLessonQuizDraftEnabled}
                    aiLessonQuizDraft={aiLessonQuizDraft}
                    aiLessonQuizDraftingKey={aiLessonQuizDraftingKey}
                    aiLessonQuizDraftError={aiLessonQuizDraftError}
                    handleRequestAiLessonQuizDraft={handleRequestAiLessonQuizDraft}
                    handleUseAiLessonQuizDraft={handleUseAiLessonQuizDraft}
                    handleCancelAiLessonQuizDraft={handleCancelAiLessonQuizDraft}
                    aiLessonKitDraftEnabled={aiLessonKitDraftEnabled}
                    aiLessonKitDraft={aiLessonKitDraft}
                    aiLessonKitDraftingKey={aiLessonKitDraftingKey}
                    aiLessonKitDraftError={aiLessonKitDraftError}
                    handleRequestAiLessonKitDraft={handleRequestAiLessonKitDraft}
                    handleUseAiLessonKitDraft={handleUseAiLessonKitDraft}
                    handleCancelAiLessonKitDraft={handleCancelAiLessonKitDraft}
                    handleChallengeChange={handleChallengeChange}
                    handleFileUpload={handleFileUpload}
                    handleSectionDrop={handleSectionDrop}
                    handleMoveSection={handleMoveSection}
                    handleLessonDrop={handleLessonDrop}
                    handleMoveLesson={handleMoveLesson}
                    openSection={openSection}
                    expandAllSections={expandAllSections}
                    collapseAllSections={collapseAllSections}
                    setSingleSectionFocus={setSingleSectionFocus}
                    jumpToNextInvalidLesson={jumpToNextInvalidLesson}
                    loadSkillsList={loadSkillsList}
                    handleCurriculumSubmit={handleCurriculumSubmitFromComponent}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    handleConfirmedDelete={handleConfirmedDelete}
                />
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <PreviewStep
                    courseInfo={courseInfo}
                    curriculum={curriculum}
                    mode="create"
                    onBack={() => setStep(2)}
                    handleSaveDraft={handleSaveDraft}
                    handleSubmitForApproval={handleSubmitForApproval}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            )}
        </div>
    );
};

export default CreateCourse;
