const CHALLENGE_STORAGE_PREFIX = 'lessonChallengeState';

export const getChallengeStorageKey = (courseId, lessonId) =>
    `${CHALLENGE_STORAGE_PREFIX}:${courseId}:${lessonId}`;

export const loadChallengeStateFromStorage = (courseId, lessonId) => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(getChallengeStorageKey(courseId, lessonId));
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('Failed to read challenge state', error);
        return null;
    }
};

export const saveChallengeStateToStorage = (courseId, lessonId, updates) => {
    if (typeof window === 'undefined') return;
    try {
        const existing = loadChallengeStateFromStorage(courseId, lessonId) || {};
        const next = { ...existing, ...updates };
        localStorage.setItem(getChallengeStorageKey(courseId, lessonId), JSON.stringify(next));
    } catch (error) {
        console.warn('Failed to persist challenge state', error);
    }
};

export const getActiveSectionStorageKey = (courseId) => `active_section_${courseId}`;

export const getStoredActiveSectionId = (courseId) => {
    if (typeof window === 'undefined') return null;

    const storedSection = localStorage.getItem(getActiveSectionStorageKey(courseId));
    return storedSection ? Number(storedSection) : null;
};

export const saveActiveSectionId = (courseId, sectionId) => {
    if (typeof window === 'undefined' || !sectionId) return;
    localStorage.setItem(getActiveSectionStorageKey(courseId), String(sectionId));
};

export const parseResumeParams = (searchParams) => {
    const resumeLessonIdParam = searchParams.get('resumeLessonId');
    const resumeTimeParam = searchParams.get('resumeTime');
    const resumeLessonId = resumeLessonIdParam ? Number(resumeLessonIdParam) : null;
    const resumeTimeSeconds =
        resumeTimeParam && !Number.isNaN(Number(resumeTimeParam)) ? Number(resumeTimeParam) : null;

    return { resumeLessonId, resumeTimeSeconds };
};

export const normalizeCourseSections = (sectionData = [], isEnrolled = false) =>
    sectionData
        .map((section) => ({
            ...section,
            lessons: (section.lessons || [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((lesson) => ({
                    ...lesson,
                    kind: lesson.kind || 'video',
                    content: lesson.content || '',
                    resourceName: lesson.resourceName || '',
                    sectionId: section.id,
                    locked: !isEnrolled && !lesson.previewVideo,
                })),
        }))
        .sort((a, b) => a.order - b.order);

export const findLessonById = (sections, lessonId) => {
    if (!lessonId) return null;

    for (const section of sections) {
        const lesson = (section.lessons || []).find((item) => item.id === lessonId);
        if (lesson) return lesson;
    }

    return null;
};

export const findLastCompletedLesson = (sections, completedLessonIds) => {
    let lastCompletedLesson = null;

    for (const section of sections) {
        for (const lesson of section.lessons || []) {
            if (completedLessonIds.includes(lesson.id)) {
                lastCompletedLesson = lesson;
            }
        }
    }

    return lastCompletedLesson;
};

export const getFirstLesson = (sections) => sections[0]?.lessons?.[0] || null;

export const selectInitialLesson = ({
    sections,
    resumeLessonId,
    lastViewedLessonId,
    completedLessonIds,
}) => {
    const resumeLesson = findLessonById(sections, resumeLessonId);
    if (resumeLesson) {
        return { lesson: resumeLesson, fromResumeParam: true };
    }

    const lastViewedLesson = findLessonById(sections, lastViewedLessonId);
    if (lastViewedLesson) {
        return { lesson: lastViewedLesson, fromResumeParam: false };
    }

    return {
        lesson: findLastCompletedLesson(sections, completedLessonIds) || getFirstLesson(sections),
        fromResumeParam: false,
    };
};

export const findAdjacentLessons = (sections, activeLessonId) => {
    if (!activeLessonId) return { prev: undefined, next: undefined };

    const flatLessons = sections.flatMap((section) => section.lessons || []);
    const index = flatLessons.findIndex((lesson) => lesson.id === activeLessonId);

    if (index < 0) return { prev: undefined, next: undefined };

    return {
        prev: flatLessons[index - 1],
        next: flatLessons[index + 1],
    };
};

export const isRuntimeActivityLesson = (lesson) =>
    lesson?.kind === 'article' || lesson?.kind === 'quiz' || lesson?.kind === 'code';

export const shouldUseSavedVideoTime = (videoTime, lesson, completedLessons = []) =>
    Boolean(
        videoTime?.time &&
        videoTime.time < (lesson?.duration || 9999) * 0.95 &&
        !completedLessons.includes(lesson?.id)
    );

export const buildQuizAnswersPayload = ({ quiz, currentAnswers, preparedAnswers }) => {
    if (preparedAnswers) {
        const answeredQuestions = preparedAnswers.filter(
            (answer) => answer.optionId && !answer.isSkipped
        );

        return {
            hasAnsweredQuestions: answeredQuestions.length > 0,
            payload: {
                answers: answeredQuestions.map((answer) => ({
                    questionId: answer.questionId,
                    optionId: answer.optionId,
                })),
            },
        };
    }

    const unanswered = quiz.questions.some((question) => !currentAnswers[question.id]);

    return {
        hasUnansweredQuestions: unanswered,
        payload: {
            answers: quiz.questions.map((question) => ({
                questionId: question.id,
                optionId: currentAnswers[question.id],
            })),
        },
    };
};

export const addSkippedQuestionsToQuizResult = ({ quiz, result, preparedAnswers }) => {
    const skippedQuestions = preparedAnswers.filter((answer) => answer.isSkipped);
    if (skippedQuestions.length === 0) return result;

    const totalQuestions = quiz.questions.length;
    const correctFromServer = result.correctAnswers || 0;
    const newScore = Math.round((correctFromServer / totalQuestions) * 100);
    const updatedAnswers = [...(result.answers || [])];

    skippedQuestions.forEach((skipped) => {
        updatedAnswers.push({
            questionId: skipped.questionId,
            selectedOptionId: null,
            isCorrect: false,
            correctOptionId:
                quiz.questions
                    .find((question) => question.id === skipped.questionId)
                    ?.options?.find((option) => option.isCorrect)?.id || null,
        });
    });

    return {
        ...result,
        score: newScore,
        correctAnswers: correctFromServer,
        totalQuestions,
        passed: newScore >= (result.passingScore || 70),
        answers: updatedAnswers,
    };
};
