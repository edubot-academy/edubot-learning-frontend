import { validateQuiz, ensureQuizShape } from '../../../utils/quizUtils';
import { ensureChallengeShape, normalizeChallengeForApi } from '../../../utils/challengeUtils';

export const getCourseInfoErrors = (info) => {
    const errors = {};
    if (!info.title?.trim()) errors.title = 'Курс аталышы милдеттүү';
    if (info.title?.length > 200) errors.title = 'Максимум 200 символ';
    if (info.subtitle?.length > 255) errors.subtitle = 'Максимум 255 символ';
    if (!info.description?.trim()) {
        errors.description = 'Сүрөттөмө милдеттүү';
    } else if (info.description?.trim().length < 10) {
        errors.description = 'Сүрөттөмө минималдуу 10 символ болуу керек';
    }
    if (!info.categoryId) errors.categoryId = 'Категория тандаңыз';
    if (!info.languageCode) errors.languageCode = 'Тилди тандаңыз';
    if (info.isPaid && (!Number.isFinite(Number(info.price)) || Number(info.price) <= 0)) {
        errors.price = 'Акы төлөнүүчү курс үчүн баа 0дөн чоң болушу керек';
    }
    return errors;
};

export const getLessonIssue = (lesson) => {
    if (!lesson.title?.trim()) return 'Аталыш жок';
    if (lesson.kind === 'video' && !lesson.videoKey) return 'Видео жүктөлө элек';
    if (
        lesson.kind === 'article' &&
        (!lesson.content?.trim() || !lesson.duration || lesson.duration <= 0)
    ) {
        return 'Макала толук эмес';
    }
    if (lesson.kind === 'quiz') {
        const quizErr = validateQuiz(ensureQuizShape(lesson.quiz));
        if (quizErr) return 'Квиз толук эмес';
    }
    if (lesson.kind === 'code') {
        try {
            normalizeChallengeForApi(ensureChallengeShape(lesson.challenge));
        } catch {
            return 'Код тапшырма толук эмес';
        }
    }
    return null;
};

export const getSectionIssueCount = (section) =>
    section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count + 1 : count), 0);

export const getSectionReadyCount = (section) =>
    section.lessons.reduce((count, lesson) => (getLessonIssue(lesson) ? count : count + 1), 0);

export const getFirstInvalidLessonTarget = (curriculum) => {
    for (let sIdx = 0; sIdx < curriculum.length; sIdx += 1) {
        const section = curriculum[sIdx];
        for (let lIdx = 0; lIdx < section.lessons.length; lIdx += 1) {
            const issue = getLessonIssue(section.lessons[lIdx]);
            if (issue) return { sIdx, lIdx, issue };
        }
    }
    return null;
};

export const validateCurriculum = (curriculum) => {
    const invalidSectionIndexes = curriculum
        .map((section, idx) => (getSectionIssueCount(section) > 0 ? idx : null))
        .filter((idx) => idx !== null);

    return {
        isValid: invalidSectionIndexes.length === 0,
        invalidSectionIndexes,
        firstInvalid: getFirstInvalidLessonTarget(curriculum),
    };
};
