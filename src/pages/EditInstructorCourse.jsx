// EditInstructorCourse Refactor component
// Uses the shared course builder architecture
// Maintains identical functionality to original EditInstructorCourse.jsx

import { useParams, useNavigate } from 'react-router-dom';
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

/**
 * EditInstructorCourse component
 * Refactored to use shared course builder architecture
 * Maintains identical UX and functionality to original EditInstructorCourse.jsx
 */
const EditInstructorCourse = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Use the shared course builder hook in edit mode
    const {
        // State
        step,
        setStep,
        loading,
        saving,
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

        // Course Info Operations
        handleCourseSubmit,

        // Curriculum Operations
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
        handleCurriculumSubmit,
        openSection,
        expandAllSections,
        collapseAllSections,
        setSingleSectionFocus,
        jumpToNextInvalidLesson,
        loadSkillsList,
        hasUnsavedChanges,

        courseId,
    } = useCourseBuilder({ mode: 'edit', courseId: id });

    // Handle curriculum submission (Step 2) - edit mode specific
    const handleCurriculumSubmitFromComponent = async () => {
        const success = await handleCurriculumSubmit();
        if (success) {
            setStep(3);
        }
    };

    // Handle submit for approval
    const handleSubmitForApproval = async () => {
        if (hasUnsavedChanges) {
            toast.error(t('instructorDashboard.editCoursePage.toasts.saveBeforeApproval'));
            return;
        }

        try {
            await markCoursePending(courseId);
            toast.success(t('instructorDashboard.editCoursePage.toasts.submittedForApproval'));
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Failed to submit for approval', error);
            if (isForbiddenError(error)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(error, t('instructorDashboard.editCoursePage.toasts.submitError')).message);
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

    // Handle step change with validation
    const handleStepChange = (newStep) => {
        if (newStep === 3) {
            // Validate before going to preview
            const target = getFirstInvalidLessonTarget(curriculum);
            if (target) {
                toast.error(
                    t('instructorDashboard.editCoursePage.toasts.invalidLesson', {
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
                    {t('instructorDashboard.editCoursePage.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('instructorDashboard.editCoursePage.description')}
                </p>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-100">
                    <p className="font-semibold">{t('instructorDashboard.editCoursePage.notice.title')}</p>
                    <p className="mt-1 text-amber-800 dark:text-amber-200">
                        {t('instructorDashboard.editCoursePage.notice.description')}
                    </p>
                    {hasUnsavedChanges && (
                        <p className="mt-2 font-medium text-amber-950 dark:text-amber-50">
                            {t('instructorDashboard.editCoursePage.notice.unsaved')}
                        </p>
                    )}
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
                    mode="edit"
                    handleCourseSubmit={handleCourseSubmit}
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
                    saving={saving}
                />
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <PreviewStep
                    courseInfo={courseInfo}
                    curriculum={curriculum}
                    mode="edit"
                    onBack={() => setStep(2)}
                    handleSubmitForApproval={handleSubmitForApproval}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            )}
        </div>
    );
};

export default EditInstructorCourse;
