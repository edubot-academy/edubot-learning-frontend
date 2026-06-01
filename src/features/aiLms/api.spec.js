import { describe, expect, it, vi, beforeEach } from 'vitest';
import api from '../../shared/api/client';
import {
    generateAiCourseDraft,
    generateAiHomeworkDraft,
    generateAiLessonKit,
    generateAiLessonQuizDraft,
    generateAiMessageDraft,
    generateAiSessionQuizDraft,
    generateAiWorksheetDraft,
} from './api';

vi.mock('../../shared/api/client', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

describe('AI LMS API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.post.mockResolvedValue({ data: { generationId: 1, status: 'draft', output: {} } });
    });

    it('routes Sprint 7 draft helpers to backend endpoints', async () => {
        await generateAiLessonQuizDraft(11, { questionCount: 3 });
        await generateAiSessionQuizDraft(22, { questionCount: 4 });
        await generateAiHomeworkDraft(33, { topic: 'Homework', instructions: 'Create 5 tasks.' });
        await generateAiLessonKit(44, { focus: 'Lesson' });
        await generateAiWorksheetDraft(55, { topic: 'Worksheet' });
        await generateAiCourseDraft({ topic: 'Course' });
        await generateAiMessageDraft(66, { recipient: 'guardian' });

        expect(api.post).toHaveBeenNthCalledWith(1, '/ai-lms/lessons/11/quiz-draft', { questionCount: 3 });
        expect(api.post).toHaveBeenNthCalledWith(2, '/ai-lms/sessions/22/quiz-draft', { questionCount: 4 });
        expect(api.post).toHaveBeenNthCalledWith(3, '/ai-lms/sessions/33/homework-draft', {
            topic: 'Homework',
            instructions: 'Create 5 tasks.',
        });
        expect(api.post).toHaveBeenNthCalledWith(4, '/ai-lms/lessons/44/lesson-kit', { focus: 'Lesson' });
        expect(api.post).toHaveBeenNthCalledWith(5, '/ai-lms/sessions/55/worksheet-draft', { topic: 'Worksheet' });
        expect(api.post).toHaveBeenNthCalledWith(6, '/ai-lms/courses/course-draft', { topic: 'Course' });
        expect(api.post).toHaveBeenNthCalledWith(7, '/ai-lms/students/66/message-draft', { recipient: 'guardian' });
    });
});
