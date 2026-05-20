import { FiInfo } from 'react-icons/fi';
import {
    createEmptyChallenge,
    createEmptyChallengeTest,
    cloneChallenge,
} from '@utils/challengeUtils';
import { useTranslation } from 'react-i18next';

const InfoTooltip = ({ text }) => (
    <span className="relative group inline-flex items-center">
        <FiInfo className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        <span className="absolute z-20 w-64 -right-2 translate-x-full top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
            {text}
        </span>
    </span>
);

const LessonChallengeEditor = ({ challenge, onChange, disabled = false }) => {
    const { t } = useTranslation();
    const safeChallenge = challenge ?? createEmptyChallenge();

    const updateChallenge = (updater) => {
        const next = cloneChallenge(safeChallenge);
        updater(next);
        onChange?.(next);
    };

    const handleTestChange = (index, field, value) => {
        updateChallenge((next) => {
            next.tests[index][field] = value;
        });
    };

    const addTest = () => {
        updateChallenge((next) => {
            next.tests.push(createEmptyChallengeTest());
        });
    };

    const removeTest = (index) => {
        updateChallenge((next) => {
            if (next.tests.length <= 1) return;
            next.tests.splice(index, 1);
        });
    };

    const handleTimeLimitChange = (value) => {
        updateChallenge((next) => {
            const ms = Number(value);
            next.timeLimitMs = Number.isFinite(ms) && ms > 0 ? ms : 5000;
        });
    };

    return (
        <div className={`space-y-4 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    {t('instructorDashboard.courseBuilder.challenge.instructions')}
                    <InfoTooltip text={t('instructorDashboard.courseBuilder.challenge.instructionsTooltip')} />
                </label>
                <textarea
                    className="w-full border rounded p-2 min-h-[120px] bg-[#0f172a] text-gray-100 border-[#1f2937] font-mono"
                    value={safeChallenge.instructions}
                    onChange={(e) =>
                        updateChallenge((next) => (next.instructions = e.target.value))
                    }
                    placeholder={t('instructorDashboard.courseBuilder.challenge.instructionsPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {t('instructorDashboard.courseBuilder.challenge.instructionsHelp')}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    {t('instructorDashboard.courseBuilder.challenge.timeLimit')}
                    <InfoTooltip text={t('instructorDashboard.courseBuilder.challenge.timeLimitTooltip')} />
                </label>
                <input
                    type="number"
                    min="1000"
                    className="w-full border rounded p-2"
                    value={safeChallenge.timeLimitMs || 5000}
                    onChange={(e) => handleTimeLimitChange(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    {t('instructorDashboard.courseBuilder.challenge.starterCode')}
                    <FiInfo
                        className="text-gray-500 cursor-help"
                        title={t('instructorDashboard.courseBuilder.challenge.starterCodeTooltip')}
                    />
                </label>
                <textarea
                    className="w-full border rounded p-2 font-mono min-h-[140px] bg-[#0f172a] text-gray-100 border-[#1f2937]"
                    value={safeChallenge.starterCode || ''}
                    onChange={(e) => updateChallenge((next) => (next.starterCode = e.target.value))}
                    // l10n-audit-ignore: code starter placeholder
                    placeholder={'function solution() {\n  // ...\n}'}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {t('instructorDashboard.courseBuilder.challenge.starterCodeHelp')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{t('instructorDashboard.courseBuilder.challenge.tests')}</h4>
                    <button
                        type="button"
                        onClick={addTest}
                        className="text-sm text-edubot-orange hover:underline"
                    >
                        {t('instructorDashboard.courseBuilder.challenge.addTest')}
                    </button>
                </div>

                {safeChallenge.tests.map((test, index) => (
                    <div
                        key={index}
                        className="border border-edubot-teal rounded p-4 space-y-3 bg-white"
                    >
                        <div className="flex justify-between items-center gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium flex items-center gap-1">
                                    {t('instructorDashboard.courseBuilder.challenge.testTitle')}
                                    <InfoTooltip text={t('instructorDashboard.courseBuilder.challenge.testTitleTooltip')} />
                                </label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={test.title}
                                    onChange={(e) =>
                                        handleTestChange(index, 'title', e.target.value)
                                    }
                                    placeholder={t('instructorDashboard.courseBuilder.challenge.testPlaceholder', {
                                        number: index + 1,
                                    })}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm mt-6">
                                <input
                                    type="checkbox"
                                    checked={test.isHidden}
                                    onChange={(e) =>
                                        handleTestChange(index, 'isHidden', e.target.checked)
                                    }
                                />
                                {t('instructorDashboard.courseBuilder.challenge.hidden')}
                            </label>
                            <button
                                type="button"
                                onClick={() => removeTest(index)}
                                className="text-sm text-red-600 hover:underline disabled:text-gray-400"
                                disabled={safeChallenge.tests.length <= 1}
                            >
                                {t('instructorDashboard.courseBuilder.actions.delete')}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium flex items-center gap-1">
                                {t('instructorDashboard.courseBuilder.challenge.args')}
                                <InfoTooltip
                                    text={
                                        t('instructorDashboard.courseBuilder.challenge.argsTooltip')
                                    }
                                />
                            </label>
                            <textarea
                                className="w-full border rounded p-2 font-mono bg-[#0f172a] text-gray-100 border-[#1f2937]"
                                rows={3}
                                value={test.argsText}
                                onChange={(e) =>
                                    handleTestChange(index, 'argsText', e.target.value)
                                }
                                placeholder="[1, 2]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium flex items-center gap-1">
                                {t('instructorDashboard.courseBuilder.challenge.expected')}
                                <InfoTooltip
                                    text={
                                        t('instructorDashboard.courseBuilder.challenge.expectedTooltip')
                                    }
                                />
                            </label>
                            <textarea
                                className="w-full border rounded p-2 font-mono bg-[#0f172a] text-gray-100 border-[#1f2937]"
                                rows={3}
                                value={test.expectedText}
                                onChange={(e) =>
                                    handleTestChange(index, 'expectedText', e.target.value)
                                }
                                placeholder="3"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonChallengeEditor;
