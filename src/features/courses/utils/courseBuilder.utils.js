import { createEmptyQuiz, ensureQuizShape } from '../../../utils/quizUtils';
import { createEmptyChallenge, ensureChallengeShape } from '../../../utils/challengeUtils';

export const DEFAULT_COURSE_INFO = {
    title: '',
    subtitle: '',
    description: '',
    categoryId: '',
    price: '',
    cover: null,
    coverImageUrl: '',
    languageCode: 'ky',
    learningOutcomesText: '',
    isPaid: true,
    aiAssistantEnabled: false,
};

export const createDefaultSection = (index) => ({
    sectionTitle: `Бөлүм ${index + 1}`,
    skillId: '',
    lessons: [],
});

export const createDefaultLesson = () => ({
    title: '',
    content: '',
    kind: 'video',
    videoKey: '',
    resourceKey: '',
    resourceName: '',
    quiz: createEmptyQuiz(),
    challenge: createEmptyChallenge(),
    previewVideo: false,
    uploadProgress: { video: 0, resource: 0 },
    uploading: { video: false, resource: false },
    duration: undefined,
});

export const normalizeSkillValue = (value) => {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
};

export const toSkillValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value);
};

export const resolveSectionSkillValue = (sectionLike, options = []) => {
    const optionSet = new Set(options.map((o) => o.value));
    const candidates = [
        sectionLike?.skillId,
        sectionLike?.skill?.id,
        sectionLike?.skillSlug,
        sectionLike?.skill?.slug,
    ]
        .map(toSkillValue)
        .filter(Boolean);
    const match = candidates.find((val) => optionSet.has(val));
    return match ?? (candidates[0] || '');
};

export const buildLessonPayload = (lesson, lessonIdx) => {
    const isArticle = lesson.kind === 'article';
    const isVideo = lesson.kind === 'video';

    return {
        title: lesson.title.trim(),
        kind: lesson.kind || 'video',
        content: isArticle ? lesson.content?.trim() || undefined : undefined,
        videoKey: isVideo ? lesson.videoKey : undefined,
        resourceKey: lesson.resourceKey,
        resourceName: lesson.resourceName?.trim() || undefined,
        previewVideo: isVideo ? lesson.previewVideo : false,
        order: lessonIdx,
        duration: isVideo || isArticle ? lesson.duration : undefined,
    };
};

export const buildCoursePayload = (courseInfo) => {
    const learningOutcomes = courseInfo.learningOutcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

    return {
        title: courseInfo.title,
        description: courseInfo.description,
        categoryId: parseInt(courseInfo.categoryId, 10),
        price: Number(courseInfo.isPaid ? courseInfo.price : 0),
        subtitle: courseInfo.subtitle || undefined,
        languageCode: courseInfo.languageCode || 'ky',
        learningOutcomes: learningOutcomes.length ? learningOutcomes : undefined,
        aiAssistantEnabled: Boolean(courseInfo.aiAssistantEnabled),
        isPaid: Boolean(courseInfo.isPaid),
    };
};

export const hydrateCourseFromApi = (courseData) => {
    const learningOutcomesText = Array.isArray(courseData.learningOutcomes)
        ? courseData.learningOutcomes.join('\n')
        : '';
    
    return {
        ...courseData,
        languageCode: courseData.languageCode || 'ky',
        isPaid:
            typeof courseData.isPaid === 'boolean'
                ? courseData.isPaid
                : Number(courseData.price) > 0,
        learningOutcomesText,
        aiAssistantEnabled: Boolean(courseData.aiAssistantEnabled),
        categoryId: String(courseData.category?.id ?? courseData.categoryId ?? ''),
    };
};

export const reorderExpandedMap = (prevMap, count, fromIdx, toIdx) => {
    const flags = Array.from({ length: count }, (_, idx) => Boolean(prevMap[idx] ?? idx === 0));
    const [moved] = flags.splice(fromIdx, 1);
    flags.splice(toIdx, 0, moved);
    return flags.reduce((acc, flag, idx) => {
        acc[idx] = flag;
        return acc;
    }, {});
};

export const handleLessonKindChange = (lesson, value) => {
    const updatedLesson = { ...lesson };
    
    if (value === 'article') {
        updatedLesson.previewVideo = false;
    }
    if (value === 'quiz') {
        updatedLesson.previewVideo = false;
        updatedLesson.videoKey = '';
        updatedLesson.quiz = ensureQuizShape(updatedLesson.quiz);
    }
    if (value === 'code') {
        updatedLesson.previewVideo = false;
        updatedLesson.videoKey = '';
        updatedLesson.challenge = ensureChallengeShape(updatedLesson.challenge);
    }
    
    return updatedLesson;
};
