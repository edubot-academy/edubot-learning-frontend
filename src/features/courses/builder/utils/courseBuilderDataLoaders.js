import {
    fetchCourseDetails,
    fetchLessonChallenge,
    fetchLessonQuiz,
    fetchLessons,
    fetchSections,
} from '../../api';
import { fetchCategories } from '../../../categories/api';
import { fetchSkills } from '../../../skills/api';
import { createEmptyQuiz, mapQuizFromApi } from '../../../../utils/quizUtils';
import { createEmptyChallenge, mapChallengeFromApi } from '../../../../utils/challengeUtils';

export const DEFAULT_SKILL_OPTION_LABEL = 'Skill тандаңыз (опция)';
export const DEFAULT_SKILL_OPTION = { value: '', label: DEFAULT_SKILL_OPTION_LABEL };

export const mapSkillsToOptions = (skillsData, optionalSkillLabel = DEFAULT_SKILL_OPTION_LABEL) => {
    const mappedSkillOptions = Array.isArray(skillsData) && skillsData.length
        ? skillsData
            .filter((skill) => skill.slug || skill.id)
            .map((skill) => ({
                value: String(skill.id ?? skill.slug ?? ''),
                label: skill.name || skill.slug,
            }))
        : [];

    return [{ ...DEFAULT_SKILL_OPTION, label: optionalSkillLabel }, ...mappedSkillOptions];
};

export const hydrateCourseInfo = (courseData) => {
    const learningOutcomesText = Array.isArray(courseData.learningOutcomes)
        ? courseData.learningOutcomes
            .map((learningOutcome) => learningOutcome.description || '')
            .filter(Boolean)
            .join('\n')
        : courseData.learningOutcomesText || '';

    return {
        id: courseData.id,
        title: courseData.title || '',
        subtitle: courseData.subtitle || '',
        description: courseData.description || '',
        price: courseData.price || '',
        cover: courseData.cover || null,
        coverImageUrl: courseData.coverImageUrl || '',
        languageCode: courseData.languageCode || 'ky',
        isPaid: typeof courseData.isPaid === 'boolean'
            ? courseData.isPaid
            : Number(courseData.price) > 0,
        learningOutcomesText,
        aiAssistantEnabled: Boolean(courseData.aiAssistantEnabled),
        categoryId: String(courseData.category?.id ?? courseData.categoryId ?? ''),
    };
};

const createLessonExtraWarning = ({ error, kind, lesson, sectionId }) => ({
    error,
    kind,
    lessonId: lesson.id,
    lessonTitle: lesson.title || '',
    sectionId,
});

const loadLessonExtras = async ({ courseId, lesson, sectionId, warnings }) => {
    const baseLesson = {
        ...lesson,
        kind: lesson.kind || 'video',
        content: lesson.content || '',
        resourceName: lesson.resourceName || '',
        quiz: lesson.kind === 'quiz' ? createEmptyQuiz() : undefined,
        challenge: lesson.kind === 'code' ? createEmptyChallenge() : undefined,
        uploadProgress: { video: 0, resource: 0 },
        uploading: { video: false, resource: false },
    };

    if (baseLesson.kind === 'quiz') {
        try {
            const quizData = await fetchLessonQuiz(courseId, sectionId, lesson.id, true);
            baseLesson.quiz = mapQuizFromApi(quizData, true);
        } catch (error) {
            console.error('Failed to load quiz', error);
            warnings.push(createLessonExtraWarning({
                error,
                kind: 'quiz',
                lesson,
                sectionId,
            }));
        }
    }

    if (baseLesson.kind === 'code') {
        try {
            const challengeData = await fetchLessonChallenge(courseId, sectionId, lesson.id, true);
            baseLesson.challenge = mapChallengeFromApi(challengeData, true);
        } catch (error) {
            console.error('Failed to load challenge', error);
            warnings.push(createLessonExtraWarning({
                error,
                kind: 'challenge',
                lesson,
                sectionId,
            }));
        }
    }

    return baseLesson;
};

const loadSectionLessons = async ({ courseId, section, warnings }) => {
    const lessons = await fetchLessons(courseId, section.id);
    const sortedLessons = lessons.sort((a, b) => a.order - b.order);
    const lessonsWithExtras = await Promise.all(
        sortedLessons.map((lesson) =>
            loadLessonExtras({
                courseId,
                lesson,
                sectionId: section.id,
                warnings,
            })
        )
    );

    return {
        ...section,
        lessons: lessonsWithExtras,
    };
};

export const loadCreateCourseBuilderData = async ({ optionalSkillLabel } = {}) => {
    const [categories, skillsData] = await Promise.all([
        fetchCategories(),
        fetchSkills().catch(() => []),
    ]);

    return {
        categories,
        skillOptions: mapSkillsToOptions(skillsData, optionalSkillLabel),
    };
};

export const loadEditCourseBuilderData = async (courseId, { optionalSkillLabel } = {}) => {
    const [courseData, categories, sections, skillsData] = await Promise.all([
        fetchCourseDetails(courseId),
        fetchCategories(),
        fetchSections(courseId),
        fetchSkills().catch(() => []),
    ]);

    const lessonExtraWarnings = [];
    const curriculum = await Promise.all(
        sections.map((section) =>
            loadSectionLessons({
                courseId,
                section,
                warnings: lessonExtraWarnings,
            })
        )
    );

    return {
        categories,
        courseInfo: hydrateCourseInfo(courseData),
        curriculum,
        lessonExtraWarnings,
        skillOptions: mapSkillsToOptions(skillsData, optionalSkillLabel),
    };
};
