import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EnglishPlacementTestPage from './EnglishPlacementTestPage';

vi.mock('../api', () => ({
    getNextQuestion: vi.fn(),
    submitAnswer: vi.fn(),
    completeAttempt: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options = {}) => {
            if (key === 'assessment.test.questionOf') {
                return `Question ${options.current} of ${options.total}`;
            }
            return key;
        },
        i18n: {
            language: 'en',
        },
    }),
}));

const { getNextQuestion } = await import('../api');

const renderPage = (initialEntry = '/assessment/attempt/123') =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/assessment/attempt/:attemptId" element={<EnglishPlacementTestPage />} />
                <Route path="/assessment/attempt/:attemptId/result" element={<div>result-page</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('EnglishPlacementTestPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01T00:00:00Z').getTime());
        sessionStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('restores the timer from storage and hydrates progress from the server response', async () => {
        sessionStorage.setItem('assessment-attempt:123:expiresAt', '2026-01-01T00:10:00Z');
        getNextQuestion.mockResolvedValue({
            question: { en: 'What is your answer?' },
            id: 44,
            level: 'A2',
            skill: 'reading',
            options: [
                { id: 1, order: 0, text: { en: 'Option A' } },
                { id: 2, order: 1, text: { en: 'Option B' } },
            ],
            total: 30,
            currentIndex: 6,
            expiresAt: '2026-01-01T00:10:00Z',
        });

        renderPage();

        expect(await screen.findByText('What is your answer?')).toBeInTheDocument();
        expect(screen.getByText('Question 7 of 30')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(sessionStorage.getItem('assessment-attempt:123:expiresAt')).toBe('2026-01-01T00:10:00Z');
    });
});
