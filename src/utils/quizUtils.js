import i18n from '../i18n';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createEmptyOption = (isCorrect = false) => ({
    id: undefined,
    text: '',
    isCorrect,
});

export const createEmptyQuestion = () => ({
    id: undefined,
    prompt: '',
    options: [createEmptyOption(true), createEmptyOption(false)],
});

export const createEmptyQuiz = () => ({
    passingScore: 70,
    timeLimitSeconds: null,
    questions: [createEmptyQuestion()],
});

export const cloneQuiz = (quiz) => JSON.parse(JSON.stringify(quiz ?? createEmptyQuiz()));

const stripCodeFences = (value) => value
    .trim()
    .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim();

const normalizeJsonLikeString = (value) => stripCodeFences(value)
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, '\'')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

const extractPromptFromLine = (line) => line
    .replace(/^(question|q)\s*\d*\s*[:.)-]?\s*/i, '')
    .replace(/^\d+\s*[.)-]\s*/, '')
    .trim();

const extractOptionText = (line) => line
    .replace(/^[-*]\s*/, '')
    .replace(/^[A-Z]\s*[.)-]\s*/i, '')
    .replace(/^\d+\s*[.)-]\s*/, '')
    .replace(/^\[\s*[xX ]\s*\]\s*/, '')
    .trim();

const isLikelyNumberedQuestionLine = (line, currentQuestion) => {
    if (!/^\d+\s*[.)-]\s+\S/.test(line)) {
        return false;
    }

    if (!currentQuestion) {
        return true;
    }

    if (currentQuestion.options.length === 0) {
        return false;
    }

    const promptCandidate = extractPromptFromLine(line);
    if (!promptCandidate) {
        return false;
    }

    if (promptCandidate.endsWith('?')) {
        return true;
    }

    return promptCandidate.split(/\s+/).filter(Boolean).length >= 4;
};

const findOptionIndexByAnswerHint = (hint, options) => {
    const normalizedHint = hint.trim();
    if (!normalizedHint) {
        return -1;
    }

    const directTextIndex = options.findIndex(
        (option) => option.text.localeCompare(normalizedHint, undefined, { sensitivity: 'accent' }) === 0
    );
    if (directTextIndex >= 0) {
        return directTextIndex;
    }

    const letterMatch = normalizedHint.match(/^([A-Z])$/i);
    if (letterMatch) {
        const index = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
        return index >= 0 && index < options.length ? index : -1;
    }

    const numberMatch = normalizedHint.match(/^(\d+)$/);
    if (numberMatch) {
        const oneBasedIndex = Number(numberMatch[1]) - 1;
        return oneBasedIndex >= 0 && oneBasedIndex < options.length ? oneBasedIndex : -1;
    }

    return -1;
};

const parsePlainTextQuiz = (input) => {
    if (typeof input !== 'string') {
        return null;
    }

    const normalized = stripCodeFences(input);
    if (!normalized) {
        return null;
    }

    const lines = normalized
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (!lines.length) {
        return null;
    }

    const questions = [];
    let currentQuestion = null;

    lines.forEach((line) => {
        const isQuestionLine = /^(question|q)\s*\d*\s*[:.)-]/i.test(line);
        const isNumberedQuestionLine = isLikelyNumberedQuestionLine(line, currentQuestion);
        const isOptionLine = /^([-*]|\d+\s*[.)-]|[A-Z]\s*[.)-]|\[\s*[xX ]\s*\])/.test(line);
        const isCorrectHint = /\b(correct answer|answer)\s*[:=-]/i.test(line);

        if (isQuestionLine || isNumberedQuestionLine || (!currentQuestion && !isOptionLine)) {
            const prompt = extractPromptFromLine(line);
            if (!prompt) return;
            currentQuestion = {
                id: undefined,
                prompt,
                options: [],
            };
            questions.push(currentQuestion);
            return;
        }

        if (!currentQuestion) {
            return;
        }

        if (isCorrectHint) {
            const hintedAnswer = line.replace(/^.*?[:=-]\s*/, '').trim();
            const matchedOptionIndex = findOptionIndexByAnswerHint(
                hintedAnswer.replace(/\s*\(correct\)\s*$/i, ''),
                currentQuestion.options
            );
            if (matchedOptionIndex >= 0) {
                currentQuestion.options = currentQuestion.options.map((option, optionIndex) => ({
                    ...option,
                    isCorrect: optionIndex === matchedOptionIndex,
                }));
            }
            return;
        }

        if (isOptionLine) {
            const rawOption = extractOptionText(line);
            if (!rawOption) return;
            const isCorrect = /^\[\s*[xX]\s*\]/.test(line) || /\(correct\)\s*$/i.test(rawOption);
            const optionText = rawOption.replace(/\s*\(correct\)\s*$/i, '').trim();
            if (!optionText) return;

            currentQuestion.options.push({
                id: undefined,
                text: optionText,
                isCorrect,
            });
        }
    });

    const validQuestions = questions
        .map((question) => {
            const options = question.options.slice(0, 6).filter((option) => option.text);
            if (options.length < 2 || !question.prompt) {
                return null;
            }
            if (!options.some((option) => option.isCorrect)) {
                options[0].isCorrect = true;
            }
            return {
                id: undefined,
                prompt: question.prompt,
                options,
            };
        })
        .filter(Boolean);

    if (!validQuestions.length) {
        return null;
    }

    return {
        passingScore: 70,
        timeLimitSeconds: null,
        questions: validQuestions,
    };
};

const normalizeImportedOption = (option, optionIndex, correctOptionIndexes) => {
    if (typeof option === 'string') {
        return {
            text: option.trim(),
            isCorrect: correctOptionIndexes.has(optionIndex),
        };
    }

    if (!option || typeof option !== 'object') {
        return null;
    }

    const text = typeof option.text === 'string'
        ? option.text.trim()
        : typeof option.label === 'string'
            ? option.label.trim()
            : '';

    if (!text) {
        return null;
    }

    return {
        text,
        isCorrect: Boolean(option.isCorrect) || correctOptionIndexes.has(optionIndex),
    };
};

const normalizeImportedQuestion = (question) => {
    if (!question || typeof question !== 'object') {
        return null;
    }

    const prompt = typeof question.prompt === 'string'
        ? question.prompt.trim()
        : typeof question.question === 'string'
            ? question.question.trim()
            : typeof question.text === 'string'
                ? question.text.trim()
                : '';

    if (!prompt) {
        return null;
    }

    const rawOptions = Array.isArray(question.options)
        ? question.options
        : Array.isArray(question.answers)
            ? question.answers
            : Array.isArray(question.choices)
                ? question.choices
                : [];

    const correctOptionIndexes = new Set();
    const numericCorrectIndex = Number(
        question.correctOptionIndex ?? question.correctAnswerIndex ?? question.answerIndex
    );
    if (Number.isInteger(numericCorrectIndex) && numericCorrectIndex >= 0) {
        correctOptionIndexes.add(numericCorrectIndex);
    }

    const correctAnswers = Array.isArray(question.correctAnswers)
        ? question.correctAnswers
        : Array.isArray(question.correctOptionIndexes)
            ? question.correctOptionIndexes
            : [];

    correctAnswers.forEach((value) => {
        const index = Number(value);
        if (Number.isInteger(index) && index >= 0) {
            correctOptionIndexes.add(index);
        }
    });

    const options = rawOptions
        .map((option, optionIndex) => normalizeImportedOption(option, optionIndex, correctOptionIndexes))
        .filter((option) => option?.text)
        .slice(0, 6);

    const correctAnswerText = typeof question.correctAnswer === 'string'
        ? question.correctAnswer.trim()
        : '';
    if (correctAnswerText) {
        const matchedOption = options.find((option) => option.text === correctAnswerText);
        if (matchedOption) {
            matchedOption.isCorrect = true;
        }
    }

    if (options.length < 2) {
        return null;
    }

    if (!options.some((option) => option.isCorrect)) {
        options[0].isCorrect = true;
    }

    return {
        id: undefined,
        prompt,
        options: options.map((option) => ({
            id: undefined,
            text: option.text,
            isCorrect: Boolean(option.isCorrect),
        })),
    };
};

export const parseImportedQuiz = (input) => {
    if (typeof input === 'string') {
        const normalizedInput = normalizeJsonLikeString(input);

        try {
            return parseImportedQuiz(JSON.parse(normalizedInput));
        } catch {
            return parsePlainTextQuiz(input);
        }
    }

    const source = input?.quiz && typeof input.quiz === 'object'
        ? input.quiz
        : input?.output && typeof input.output === 'object'
            ? input.output
            : input;

    if (!source || typeof source !== 'object') {
        return null;
    }

    const rawQuestions = Array.isArray(source.questions)
        ? source.questions
        : Array.isArray(source.items)
            ? source.items
            : [];

    const questions = rawQuestions
        .map(normalizeImportedQuestion)
        .filter(Boolean);

    if (!questions.length) {
        return null;
    }

    const passingScoreValue = Number(source.passingScore ?? source.passScore ?? source.passingPercentage);
    const timeLimitSecondsValue = Number(source.timeLimitSeconds);
    const timeLimitMinutesValue = Number(source.timeLimitMinutes ?? source.timeLimit);

    return {
        passingScore: Number.isFinite(passingScoreValue) ? clamp(passingScoreValue, 0, 100) : 70,
        timeLimitSeconds: Number.isFinite(timeLimitSecondsValue) && timeLimitSecondsValue > 0
            ? Math.round(timeLimitSecondsValue)
            : Number.isFinite(timeLimitMinutesValue) && timeLimitMinutesValue > 0
                ? Math.round(timeLimitMinutesValue * 60)
                : null,
        questions,
    };
};

export const normalizeQuizForApi = (quiz) => {
    if (!quiz) return null;

    const passingScore = clamp(
        Number.isFinite(Number(quiz.passingScore)) ? Number(quiz.passingScore) : 0,
        0,
        100
    );

    const timeLimitSecondsRaw = Number(quiz.timeLimitSeconds);
    const timeLimitSeconds =
        Number.isFinite(timeLimitSecondsRaw) && timeLimitSecondsRaw > 0
            ? Math.round(timeLimitSecondsRaw)
            : undefined;

    const questions = (quiz.questions || [])
        .map((question, qIdx) => {
            const options = (question.options || [])
                .map((option, oIdx) => ({
                    text: (option.text || '').trim(),
                    isCorrect: Boolean(option.isCorrect),
                    order: oIdx,
                }))
                .filter((option) => option.text.length > 0);

            return {
                prompt: (question.prompt || '').trim(),
                order: qIdx,
                options,
            };
        })
        .filter((q) => q.prompt && q.options.length >= 2);

    return {
        passingScore,
        timeLimitSeconds,
        questions,
    };
};

export const validateQuiz = (quiz) => {
    if (!quiz) {
        return i18n.t('quizUtils.validation.missingQuiz');
    }

    if (!quiz.questions?.length) {
        return i18n.t('quizUtils.validation.addQuestion');
    }

    for (const [index, question] of quiz.questions.entries()) {
        const prompt = question.prompt?.trim();
        if (!prompt) {
            return i18n.t('quizUtils.validation.questionPromptRequired', { number: index + 1 });
        }
        if (!question.options || question.options.length < 2) {
            return i18n.t('quizUtils.validation.questionNeedsOptions', { number: index + 1 });
        }
        const hasCorrect = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrect) {
            return i18n.t('quizUtils.validation.questionNeedsCorrectAnswer', { number: index + 1 });
        }
        const hasEmpty = question.options.some((opt) => !opt.text?.trim());
        if (hasEmpty) {
            return i18n.t('quizUtils.validation.questionOptionsRequired', { number: index + 1 });
        }
    }

    return null;
};

export const mapQuizFromApi = (apiQuiz = {}, includeAnswers = false) => ({
    passingScore: apiQuiz.passingScore ?? 70,
    timeLimitSeconds: apiQuiz.timeLimitSeconds ?? null,
    questions: (apiQuiz.questions || []).map((question) => ({
        id: question.id,
        prompt: question.prompt,
        order: question.order,
        options: (question.options || []).map((option) => ({
            id: option.id,
            text: option.text,
            order: option.order,
            isCorrect: includeAnswers ? Boolean(option.isCorrect) : false,
        })),
    })),
});

export const ensureQuizShape = (quiz) => quiz ?? createEmptyQuiz();
