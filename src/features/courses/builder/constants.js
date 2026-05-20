// Course Builder Constants
// Shared constants for course builder components

export const DEFAULT_COURSE_INFO = {
    title: '',
    subtitle: '',
    description: '',
    categoryId: '',
    price: '',
    cover: null,
    coverImageUrl: '',
    languageCode: 'ky', // 'ky' | 'ru' | 'en'
    isPaid: false,
    learningOutcomesText: '',
    targetAudienceText: '',
    requirementsText: '',
};

export const getDefaultSectionTitle = (languageCode = 'ky', index = 1) => {
    const labels = {
        en: 'Section',
        ru: 'Раздел',
        ky: 'Бөлүм',
    };
    return `${labels[languageCode] || labels.ky} ${index}`;
};

export const createDefaultCurriculum = (languageCode = 'ky') => [
    {
        sectionTitle: getDefaultSectionTitle(languageCode, 1),
        skillId: '',
        lessons: [
            {
                title: '',
                content: '',
                kind: 'video',
                videoKey: '',
                videoUrl: '',
                duration: undefined,
                resources: [],
                quiz: null,
                challenge: null,
                uploading: { video: false, resource: false },
                uploadProgress: { video: 0, resource: 0 },
            },
        ],
    },
];

export const DEFAULT_CURRICULUM = createDefaultCurriculum();

export const DEFAULT_LESSON = {
    title: '',
    content: '',
    kind: 'video',
    videoKey: '',
    videoUrl: '',
    duration: undefined,
    resources: [],
    quiz: null,
    challenge: null,
    uploading: { video: false, resource: false },
    uploadProgress: { video: 0, resource: 0 },
};

export const DEFAULT_SECTION = {
    sectionTitle: '',
    skillId: '',
    lessons: [],
};

export const STEP_ITEMS = [
    { key: 'info', labelKey: 'instructorDashboard.courseBuilder.stepLabels.info', completed: false },
    { key: 'curriculum', labelKey: 'instructorDashboard.courseBuilder.stepLabels.curriculum', completed: false },
    { key: 'media', labelKey: 'instructorDashboard.courseBuilder.stepLabels.media', completed: false },
];

export const CURRICULUM_WORKSPACE_SECTIONS = Object.freeze({
    STRUCTURE: Object.freeze({
        id: 'structure',
        label: 'Course structure',
        owns: Object.freeze(['sections', 'ordering', 'skills']),
    }),
    LESSON_CONTENT: Object.freeze({
        id: 'lesson-content',
        label: 'Lesson content',
        owns: Object.freeze(['lesson metadata', 'articles', 'quizzes', 'coding challenges']),
    }),
    MEDIA_ASSETS: Object.freeze({
        id: 'media-assets',
        label: 'Media assets',
        owns: Object.freeze(['lesson video', 'lesson resources', 'upload progress']),
    }),
    VALIDATION_AND_SAVE: Object.freeze({
        id: 'validation-and-save',
        label: 'Validation and save',
        owns: Object.freeze(['readiness checks', 'invalid lesson navigation', 'curriculum submit']),
    }),
});
