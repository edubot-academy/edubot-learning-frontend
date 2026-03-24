// Preview Step component
// Shared between CreateCourse and EditInstructorCourse
// Extracted from Step 3 JSX in both components

import React from 'react';
import CoursePreviewPanel from '@features/courses/components/CoursePreviewPanel';

/**
 * Preview Step component
 * Renders the course preview interface (Step 3)
 * @param {Object} props - Component props
 * @param {Object} props.courseInfo - Course information state
 * @param {Array} props.curriculum - Curriculum state (sections with lessons)
 * @param {string} props.mode - 'create' or 'edit'
 * @param {Function} props.onBack - Back button handler
 * @param {Function} props.handleSaveDraft - Save draft handler (create mode only)
 * @param {Function} props.handleSubmitForApproval - Submit for approval handler
 * @param {boolean} props.disabled - Whether form is disabled
 * @returns {JSX.Element} - Course preview interface
 */
export const PreviewStep = ({
    courseInfo,
    curriculum,
    mode = 'create',
    onBack,
    handleSaveDraft,
    handleSubmitForApproval,
    disabled = false,
}) => {
    // Map curriculum to the format expected by CoursePreviewPanel
    const mappedSections = curriculum.map((section) => ({
        ...section,
        // Ensure both title properties exist for compatibility
        title: section.title || section.sectionTitle,
        sectionTitle: section.sectionTitle || section.title,
    }));

    // Get section title function for CoursePreviewPanel
    const getSectionTitle = (section) => section.sectionTitle || section.title || '';

    // Actions for the preview panel
    const actions = [];

    // Add save draft action for create mode
    if (mode === 'create' && handleSaveDraft) {
        actions.push({
            label: 'Сактап чыгуу',
            onClick: handleSaveDraft,
            className: 'rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white',
        });
    }

    // Add submit for approval action
    if (handleSubmitForApproval) {
        actions.push({
            label: mode === 'create' ? 'Тастыктоого жөнөтүү' : 'Тастыктоого жөнөтүү',
            onClick: handleSubmitForApproval,
            requiresClean: true,
            className: 'rounded-lg bg-edubot-teal px-6 py-2 text-sm font-medium text-white',
        });
    }

    return (
        <div className="space-y-4">
            <CoursePreviewPanel
                course={courseInfo}
                sections={mappedSections}
                getSectionTitle={getSectionTitle}
                onBack={onBack}
                coverAlt={mode === 'create' ? 'cover' : 'Курс сүрөтү'}
                actions={actions}
            />
        </div>
    );
};

export default PreviewStep;
