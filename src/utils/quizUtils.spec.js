import { describe, expect, it } from 'vitest';

import { parseImportedQuiz } from './quizUtils';

describe('parseImportedQuiz', () => {
    it('parses direct quiz payloads with object options', () => {
        expect(parseImportedQuiz({
            passingScore: 80,
            timeLimitMinutes: 5,
            questions: [
                {
                    prompt: 'What is 2 + 2?',
                    options: [
                        { text: '3', isCorrect: false },
                        { text: '4', isCorrect: true },
                    ],
                },
            ],
        })).toEqual({
            passingScore: 80,
            timeLimitSeconds: 300,
            questions: [
                {
                    id: undefined,
                    prompt: 'What is 2 + 2?',
                    options: [
                        { id: undefined, text: '3', isCorrect: false },
                        { id: undefined, text: '4', isCorrect: true },
                    ],
                },
            ],
        });
    });

    it('parses wrapped payloads with string options and correctAnswerIndex', () => {
        expect(parseImportedQuiz({
            quiz: {
                passScore: 65,
                items: [
                    {
                        question: 'Pick the color of the sky',
                        choices: ['Green', 'Blue', 'Red'],
                        correctAnswerIndex: 1,
                    },
                ],
            },
        })).toEqual({
            passingScore: 65,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'Pick the color of the sky',
                    options: [
                        { id: undefined, text: 'Green', isCorrect: false },
                        { id: undefined, text: 'Blue', isCorrect: true },
                        { id: undefined, text: 'Red', isCorrect: false },
                    ],
                },
            ],
        });
    });

    it('defaults the first option to correct when imported data omits one', () => {
        expect(parseImportedQuiz({
            output: {
                questions: [
                    {
                        text: 'Select any valid answer',
                        answers: [{ label: 'A' }, { label: 'B' }],
                    },
                ],
            },
        })).toEqual({
            passingScore: 70,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'Select any valid answer',
                    options: [
                        { id: undefined, text: 'A', isCorrect: true },
                        { id: undefined, text: 'B', isCorrect: false },
                    ],
                },
            ],
        });
    });

    it('returns null when there are no valid questions', () => {
        expect(parseImportedQuiz({ questions: [{ prompt: '', options: [] }] })).toBeNull();
        expect(parseImportedQuiz('invalid')).toBeNull();
    });

    it('parses fenced JSON with smart quotes and trailing commas', () => {
        expect(parseImportedQuiz(`\`\`\`json
{
  “passingScore”: 90,
  “questions”: [
    {
      “prompt”: “Capital of France?”,
      “options”: [
        { “text”: “Paris”, “isCorrect”: true, },
        { “text”: “Rome”, “isCorrect”: false, },
      ],
    },
  ],
}
\`\`\``)).toEqual({
            passingScore: 90,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'Capital of France?',
                    options: [
                        { id: undefined, text: 'Paris', isCorrect: true },
                        { id: undefined, text: 'Rome', isCorrect: false },
                    ],
                },
            ],
        });
    });

    it('parses plain text quiz content', () => {
        expect(parseImportedQuiz(`Question 1: What is 2 + 2?
A. 3
B. 4 (correct)

Question 2: Select a primary color
- Green
- Blue
Answer: Blue`)).toEqual({
            passingScore: 70,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'What is 2 + 2?',
                    options: [
                        { id: undefined, text: '3', isCorrect: false },
                        { id: undefined, text: '4', isCorrect: true },
                    ],
                },
                {
                    id: undefined,
                    prompt: 'Select a primary color',
                    options: [
                        { id: undefined, text: 'Green', isCorrect: false },
                        { id: undefined, text: 'Blue', isCorrect: true },
                    ],
                },
            ],
        });
    });

    it('parses numbered plain text questions', () => {
        expect(parseImportedQuiz(`1. What is 2 + 2?
1. 3
2. 4
Answer: 2`)).toEqual({
            passingScore: 70,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'What is 2 + 2?',
                    options: [
                        { id: undefined, text: '3', isCorrect: false },
                        { id: undefined, text: '4', isCorrect: true },
                    ],
                },
            ],
        });
    });

    it('resolves answer hints by option letter', () => {
        expect(parseImportedQuiz(`Question 1: Capital of France?
A. Berlin
B. Paris
C. Rome
Correct answer: B`)).toEqual({
            passingScore: 70,
            timeLimitSeconds: null,
            questions: [
                {
                    id: undefined,
                    prompt: 'Capital of France?',
                    options: [
                        { id: undefined, text: 'Berlin', isCorrect: false },
                        { id: undefined, text: 'Paris', isCorrect: true },
                        { id: undefined, text: 'Rome', isCorrect: false },
                    ],
                },
            ],
        });
    });
});
