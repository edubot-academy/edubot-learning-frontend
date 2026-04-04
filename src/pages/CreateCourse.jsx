// CreateCourse Refactor component
// Uses the shared course builder architecture
// Maintains identical functionality to original CreateCourse.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
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
 * CreateCourse component
 * Refactored to use shared course builder architecture
 * Maintains identical UX and functionality to original CreateCourse.jsx
 */
const CreateCourse = () => {
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
        handleChallengeChange,
        handleFileUpload,
        handleSectionDrop,
        handleLessonDrop,
        openSection,
        expandAllSections,
        collapseAllSections,
        setSingleSectionFocus,
        jumpToNextInvalidLesson,
        loadSkillsList,

        // Mode info
        mode,
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
        toast.success('Курс каралууга сакталды');
        localStorage.removeItem('draftCourse');
        navigate('/instructor/courses');
    };

    // Handle submit for approval
    const handleSubmitForApproval = async () => {
        try {
            await markCoursePending(courseId);
            toast.success('Курс тастыктоого жөнөтүлдү');
            localStorage.removeItem('draftCourse');
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

    // Show loading state
    if (loading) return <Loader fullScreen />;

    return (
        <div className="mx-auto max-w-5xl p-6 pt-24">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm">
                <h2 className="text-2xl font-bold text-edubot-dark dark:text-white">Жаңы курс түзүү</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Курсту үч кадам менен түзүңүз: маалымат, мазмун жана финалдык текшерүү.
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
                    mode="create"
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
                />
            )}
        </div>
    );
};

export default CreateCourse;
