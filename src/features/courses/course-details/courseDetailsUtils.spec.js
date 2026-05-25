import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    addSkippedQuestionsToQuizResult,
    buildQuizAnswersPayload,
    findAdjacentLessons,
    getChallengeStorageKey,
    getStoredActiveSectionId,
    isCourseInStudentPortalList,
    isRuntimeActivityLesson,
    loadChallengeStateFromStorage,
    normalizeCourseSections,
    parseResumeParams,
    saveActiveSectionId,
    saveChallengeStateToStorage,
    selectInitialLesson,
    shouldUseSavedVideoTime,
} from './courseDetailsUtils';

const sections = [
    {
        id: 1,
        lessons: [
            { id: 10, sectionId: 1, title: 'Intro', duration: 100 },
            { id: 11, sectionId: 1, title: 'Middle', duration: 100 },
        ],
    },
    {
        id: 2,
        lessons: [{ id: 20, sectionId: 2, title: 'Advanced', duration: 100 }],
    },
];

describe('courseDetailsUtils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('normalizes section and lesson order while applying lock state', () => {
        const normalized = normalizeCourseSections(
            [
                {
                    id: 2,
                    order: 2,
                    lessons: [
                        { id: 20, order: 2 },
                        { id: 21, order: 1, previewVideo: true },
                    ],
                },
                {
                    id: 1,
                    order: 1,
                    lessons: [{ id: 10, order: 1, kind: 'quiz', content: 'body' }],
                },
            ],
            false
        );

        expect(normalized.map((section) => section.id)).toEqual([1, 2]);
        expect(normalized[1].lessons.map((lesson) => lesson.id)).toEqual([21, 20]);
        expect(normalized[0].lessons[0]).toMatchObject({
            kind: 'quiz',
            content: 'body',
            resourceName: '',
            sectionId: 1,
            locked: true,
        });
        expect(normalized[1].lessons[0].locked).toBe(false);
    });

    it('detects active student portal course access across response shapes', () => {
        expect(isCourseInStudentPortalList([{ courseId: 7 }], 7)).toBe(true);
        expect(isCourseInStudentPortalList({ items: [{ id: 7 }] }, '7')).toBe(true);
        expect(isCourseInStudentPortalList({ items: [{ course: { id: 7 } }] }, 7)).toBe(true);
        expect(isCourseInStudentPortalList({ items: [{ courseId: 8 }] }, 7)).toBe(false);
        expect(isCourseInStudentPortalList(null, 7)).toBe(false);
    });

    it('selects initial lessons by resume, last viewed, completed, then first lesson priority', () => {
        expect(
            selectInitialLesson({
                sections,
                resumeLessonId: 20,
                lastViewedLessonId: 11,
                completedLessonIds: [10],
            })
        ).toEqual({ lesson: sections[1].lessons[0], fromResumeParam: true });

        expect(
            selectInitialLesson({
                sections,
                resumeLessonId: 999,
                lastViewedLessonId: 11,
                completedLessonIds: [10],
            })
        ).toEqual({ lesson: sections[0].lessons[1], fromResumeParam: false });

        expect(
            selectInitialLesson({
                sections,
                resumeLessonId: null,
                lastViewedLessonId: null,
                completedLessonIds: [10, 20],
            })
        ).toEqual({ lesson: sections[1].lessons[0], fromResumeParam: false });

        expect(
            selectInitialLesson({
                sections,
                resumeLessonId: null,
                lastViewedLessonId: null,
                completedLessonIds: [],
            })
        ).toEqual({ lesson: sections[0].lessons[0], fromResumeParam: false });
    });

    it('finds adjacent lessons across sections and guards missing active lessons', () => {
        expect(findAdjacentLessons(sections, 11)).toEqual({
            prev: sections[0].lessons[0],
            next: sections[1].lessons[0],
        });
        expect(findAdjacentLessons(sections, 10)).toEqual({
            prev: undefined,
            next: sections[0].lessons[1],
        });
        expect(findAdjacentLessons(sections, null)).toEqual({ prev: undefined, next: undefined });
        expect(findAdjacentLessons(sections, 999)).toEqual({ prev: undefined, next: undefined });
    });

    it('parses resume query params and video resume eligibility', () => {
        expect(parseResumeParams(new URLSearchParams('resumeLessonId=20&resumeTime=33'))).toEqual({
            resumeLessonId: 20,
            resumeTimeSeconds: 33,
        });
        expect(parseResumeParams(new URLSearchParams('resumeTime=bad'))).toEqual({
            resumeLessonId: null,
            resumeTimeSeconds: null,
        });

        expect(shouldUseSavedVideoTime({ time: 80 }, { id: 10, duration: 100 }, [])).toBe(true);
        expect(shouldUseSavedVideoTime({ time: 96 }, { id: 10, duration: 100 }, [])).toBe(false);
        expect(shouldUseSavedVideoTime({ time: 80 }, { id: 10, duration: 100 }, [10])).toBe(false);
    });

    it('builds quiz answer payloads and accounts for skipped prepared answers', () => {
        const quiz = {
            questions: [
                { id: 1, options: [{ id: 101, isCorrect: true }] },
                { id: 2, options: [{ id: 201, isCorrect: true }] },
            ],
        };

        expect(buildQuizAnswersPayload({ quiz, currentAnswers: { 1: 101, 2: 201 } })).toEqual({
            hasUnansweredQuestions: false,
            payload: {
                answers: [
                    { questionId: 1, optionId: 101 },
                    { questionId: 2, optionId: 201 },
                ],
            },
        });

        expect(
            buildQuizAnswersPayload({
                quiz,
                currentAnswers: {},
                preparedAnswers: [
                    { questionId: 1, optionId: 101 },
                    { questionId: 2, isSkipped: true },
                ],
            })
        ).toEqual({
            hasAnsweredQuestions: true,
            payload: { answers: [{ questionId: 1, optionId: 101 }] },
        });

        expect(
            addSkippedQuestionsToQuizResult({
                quiz,
                result: { correctAnswers: 1, passingScore: 70, answers: [] },
                preparedAnswers: [
                    { questionId: 1, optionId: 101 },
                    { questionId: 2, isSkipped: true },
                ],
            })
        ).toMatchObject({
            score: 50,
            correctAnswers: 1,
            totalQuestions: 2,
            passed: false,
            answers: [{ questionId: 2, selectedOptionId: null, correctOptionId: 201 }],
        });
    });

    it('identifies runtime activity lessons', () => {
        expect(isRuntimeActivityLesson({ kind: 'article' })).toBe(true);
        expect(isRuntimeActivityLesson({ kind: 'quiz' })).toBe(true);
        expect(isRuntimeActivityLesson({ kind: 'code' })).toBe(true);
        expect(isRuntimeActivityLesson({ kind: 'video' })).toBe(false);
        expect(isRuntimeActivityLesson(null)).toBe(false);
    });

    it('persists active section and challenge state safely', () => {
        saveActiveSectionId(12, 7);
        expect(getStoredActiveSectionId(12)).toBe(7);

        saveChallengeStateToStorage(12, 34, { code: 'print(1)' });
        saveChallengeStateToStorage(12, 34, { result: { passed: true } });

        expect(getChallengeStorageKey(12, 34)).toBe('lessonChallengeState:12:34');
        expect(loadChallengeStateFromStorage(12, 34)).toEqual({
            code: 'print(1)',
            result: { passed: true },
        });
    });
});
