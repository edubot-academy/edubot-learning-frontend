// EditInstructorCourse Refactor component
// Uses the shared course builder architecture
// Maintains identical functionality to original EditInstructorCourse.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../shared/ui/Loader';

// Import shared course builder architecture
import { useCourseBuilder } from '../features/courses/builder';
import { CourseInfoStep, CurriculumStep, PreviewStep } from '../features/courses/builder/components';
import CourseBuilderStepNav from '../features/courses/components/CourseBuilderStepNav';
import { validateCurriculumStructure, getFirstInvalidLessonTarget } from '../features/courses/builder/validation';

// API imports (same as original)
import { markCoursePending } from '../features/courses/api';
import { isForbiddenError, parseApiError } from '../shared/api/error';

/**
 * EditInstructorCourse component
 * Refactored to use shared course builder architecture
 * Maintains identical UX and functionality to original EditInstructorCourse.jsx
 */
const EditInstructorCourse = () => {
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
        singleSectionFocus,
        dragSectionIndex,
        setDragSectionIndex,
        dragLesson,
        setDragLesson,
        originalCourse,
        originalSections,
        deletedLessons,
        showCancelConfirm,
        setShowCancelConfirm,
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
        handleChallengeChange,
        handleFileUpload,
        handleSectionDrop,
        handleLessonDrop,
        handleCurriculumSubmit,
        openSection,
        expandAllSections,
        collapseAllSections,
        setSingleSectionFocus,
        jumpToNextInvalidLesson,
        loadSkillsList,

        // Mode info
        mode,
        courseId,
    } = useCourseBuilder({ mode: 'edit', courseId: id });

    // Handle curriculum submission (Step 2) - edit mode specific
    const handleCurriculumSubmitFromComponent = async () => {
        const success = await handleCurriculumSubmit();
        if (success) {
            setStep(3);
        }
    };

    // Handle save all changes (edit mode specific)
    const handleSaveAll = async () => {
        // This would be implemented in the hook for edit mode
        // For now, we'll use the existing curriculum submit
        const success = await handleCurriculumSubmit();
        if (success) {
            toast.success('Бардык өзгөрүүлөр сакталды!');
        }
    };

    // Handle submit for approval
    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(courseId);
            toast.success('Курс тастыктоого жөнөтүлдү');
            navigate('/instructor/courses');
        } catch (error) {
            console.error('Failed to submit for approval', error);
            if (isForbiddenError(error)) {
                navigate('/unauthorized');
                return;
            }
            toast.error(parseApiError(error, 'Жөнөтүүдө ката кетти').message);
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
                    `Жөнөтүүдөн мурун текшерүү керек: ${target.issue} (Бөлүм ${target.sIdx + 1}, Сабак ${target.lIdx + 1})`
                );
                return;
            }
        }
        setStep(newStep);
    };

    // Handle cancel with unsaved changes
    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        navigate('/instructor/courses');
    };

    const cancelCancel = () => {
        setShowCancelConfirm(false);
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/instructor/courses');
    };

    // Show loading state
    if (loading) return <Loader fullScreen />;

    return (
        <div className="mx-auto max-w-5xl p-6 pt-24">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">Курсду оңдоо</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Курсту үч кадам менен оңдоңуз: маалымат, мазмун жана финалдык текшерүү.
                </p>
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
                    handleChallengeChange={handleChallengeChange}
                    handleFileUpload={handleFileUpload}
                    handleSectionDrop={handleSectionDrop}
                    handleLessonDrop={handleLessonDrop}
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
                />
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-sm w-full border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Сактоо өчүрүлдү</h4>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            Сиз сактабай эле чыгып кетүүдөнсыз. Бардык өзгөрүүлөр жоголот.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelCancel}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Жокко
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Ооба, чыгып кетүү
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditInstructorCourse;
