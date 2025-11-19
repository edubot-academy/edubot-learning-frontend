export const createEmptyChallengeTest = () => ({
    title: 'Тест 1',
    argsText: '[]',
    expectedText: 'null',
    isHidden: false,
});

export const createEmptyChallenge = () => ({
    instructions: '',
    starterCode: '// Кодду бул жерге жазыңыз\n',
    timeLimitMs: 5000,
    tests: [createEmptyChallengeTest()],
});

export const cloneChallenge = (challenge = createEmptyChallenge()) =>
    JSON.parse(JSON.stringify(challenge));

export const ensureChallengeShape = (challenge) =>
    challenge ? challenge : createEmptyChallenge();

export const mapChallengeFromApi = (challenge, includeHidden = false) => {
    if (!challenge) return createEmptyChallenge();

    return {
        instructions: challenge.instructions || '',
        starterCode: challenge.starterCode || '',
        timeLimitMs: challenge.timeLimitMs || 5000,
        tests: (challenge.tests || []).map((test, idx) => ({
            id: test.id,
            title: test.title || `Тест ${idx + 1}`,
            isHidden: Boolean(test.isHidden),
            argsText:
                includeHidden || !test.isHidden
                    ? JSON.stringify(test.args ?? [], null, 2)
                    : '[]',
            expectedText:
                includeHidden || !test.isHidden
                    ? JSON.stringify(test.expected ?? null, null, 2)
                    : 'null',
        })),
    };
};

const parseJsonField = (value, fallback, label) => {
    const text = (value ?? fallback).trim();
    if (!text) return JSON.parse(fallback);
    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error(`${label} валиддүү JSON болушу керек`);
    }
};

export const normalizeChallengeForApi = (challenge) => {
    if (!challenge) {
        throw new Error('Код тапшырма маалыматтары толтурулган эмес');
    }

    const instructions = challenge.instructions?.trim();
    if (!instructions) {
        throw new Error('Код тапшырманын инструкцияларын жазыңыз');
    }

    if (!challenge.tests?.length) {
        throw new Error('Кеминде бир тест кошуңуз');
    }

    const tests = challenge.tests.map((test, index) => {
        const title = test.title?.trim();
        if (!title) {
            throw new Error(`Тест ${index + 1} үчүн аталыш жазыңыз`);
        }

        const args = parseJsonField(test.argsText || '[]', '[]', `Тест ${index + 1} аргументтери`);
        const expected = parseJsonField(
            typeof test.expectedText === 'string' ? test.expectedText : 'null',
            'null',
            `Тест ${index + 1} күткөн жыйынтыгы`
        );

        return {
            title,
            args,
            expected,
            isHidden: Boolean(test.isHidden),
            order: index,
        };
    });

    return {
        instructions,
        starterCode: challenge.starterCode || undefined,
        timeLimitMs:
            typeof challenge.timeLimitMs === 'number' && challenge.timeLimitMs > 0
                ? challenge.timeLimitMs
                : 5000,
        tests,
    };
};
