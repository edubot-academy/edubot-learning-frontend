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
        return 'Квиз маалыматтары табылган жок.';
    }

    if (!quiz.questions?.length) {
        return 'Кеминде бир суроо кошуңуз.';
    }

    for (const [index, question] of quiz.questions.entries()) {
        const prompt = question.prompt?.trim();
        if (!prompt) {
            return `Суроо ${index + 1} үчүн текст жазуу керек.`;
        }
        if (!question.options || question.options.length < 2) {
            return `Суроо ${index + 1} кеминде 2 вариантка ээ болушу керек.`;
        }
        const hasCorrect = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrect) {
            return `Суроо ${index + 1} үчүн туура жооп белгилеңиз.`;
        }
        const hasEmpty = question.options.some((opt) => !opt.text?.trim());
        if (hasEmpty) {
            return `Суроо ${index + 1} ичиндеги бардык варианттар толтурулушу керек.`;
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
