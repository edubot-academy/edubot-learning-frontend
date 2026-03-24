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

export const DEFAULT_CURRICULUM = [
    {
        sectionTitle: 'Бөлүм 1',
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
    { key: 'info', label: 'Курс маалыматы', completed: false },
    { key: 'curriculum', label: 'Окуу мазмуну', completed: false },
    { key: 'media', label: 'Медиа жане баскаруу', completed: false },
];
