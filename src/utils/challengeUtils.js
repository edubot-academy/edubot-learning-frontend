import i18n from '../i18n';

export const createEmptyChallengeTest = () => ({
    title: i18n.t('challengeUtils.defaults.testTitle', { number: 1 }),
    argsText: '[]',
    expectedText: 'null',
    isHidden: false,
});

export const createEmptyChallenge = () => ({
    instructions: '',
    starterCode: i18n.t('challengeUtils.defaults.starterCode'),
    timeLimitMs: 5000,
    tests: [createEmptyChallengeTest()],
});

export const cloneChallenge = (challenge = createEmptyChallenge()) =>
    JSON.parse(JSON.stringify(challenge));

export const ensureChallengeShape = (challenge) => (challenge ? challenge : createEmptyChallenge());

export const mapChallengeFromApi = (challenge, includeHidden = false) => {
    if (!challenge) return createEmptyChallenge();

    return {
        instructions: challenge.instructions || '',
        starterCode: challenge.starterCode || '',
        timeLimitMs: challenge.timeLimitMs || 5000,
        tests: (challenge.tests || []).map((test, idx) => ({
            id: test.id,
            title: test.title || i18n.t('challengeUtils.defaults.testTitle', { number: idx + 1 }),
            isHidden: Boolean(test.isHidden),
            argsText:
                includeHidden || !test.isHidden ? JSON.stringify(test.args ?? [], null, 2) : '[]',
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
    } catch {
        throw new Error(i18n.t('challengeUtils.errors.invalidJson', { label }));
    }
};

export const normalizeChallengeForApi = (challenge) => {
    if (!challenge) {
        throw new Error(i18n.t('challengeUtils.errors.missingChallenge'));
    }

    const instructions = challenge.instructions?.trim();
    if (!instructions) {
        throw new Error(i18n.t('challengeUtils.errors.missingInstructions'));
    }

    if (!challenge.tests?.length) {
        throw new Error(i18n.t('challengeUtils.errors.addTest'));
    }

    const tests = challenge.tests.map((test, index) => {
        const title = test.title?.trim();
        if (!title) {
            throw new Error(i18n.t('challengeUtils.errors.testTitleRequired', { number: index + 1 }));
        }

        const args = parseJsonField(
            test.argsText || '[]',
            '[]',
            i18n.t('challengeUtils.labels.testArgs', { number: index + 1 })
        );
        const expected = parseJsonField(
            typeof test.expectedText === 'string' ? test.expectedText : 'null',
            'null',
            i18n.t('challengeUtils.labels.testExpected', { number: index + 1 })
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
