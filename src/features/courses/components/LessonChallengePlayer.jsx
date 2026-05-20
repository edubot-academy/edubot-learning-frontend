import Loader from '@shared/ui/Loader';
import { useState, useEffect } from 'react';
import { FiCode, FiClock, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LessonChallengePlayer = ({
    challenge,
    code,
    onCodeChange,
    onSubmit,
    submitting = false,
    disabled = false,
    result = null,
    loading = false,
}) => {
    const { t } = useTranslation();
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (submitted && result && !submitting) {
            setShowResultPopup(true);
        }
    }, [result, submitting, submitted]);

    const closePopup = () => {
        setShowResultPopup(false);
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePopup();
            }
        };

        if (showResultPopup) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showResultPopup]);

    const handleSubmit = () => {
        setSubmitted(true);
        onSubmit?.();
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    if (!challenge) {
        return (
            <div className="mb-6 bg-[#262729] rounded-lg shadow-md p-6">
                <p className="text-gray-500 dark:text-gray-400">{t('courseLearning.challenge.notFound')}</p>
            </div>
        );
    }

    const visibleTests = (challenge.tests || []).filter((test) => !test.isHidden);

    return (
        <>
            <div className="mb-6 rounded-lg shadow-md overflow-hidden bg-[#303133] p-1">
                <div className="flex flex-col lg:flex-row min-h-[500px]">
                    <div className="flex-1 bg-[#262729] p-3">
                        <div className="flex flex-col h-full">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                                    <FiCode className="text-edubot-orange" /> {t('courseLearning.challenge.task')}
                                </h3>

                                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-300 mb-4">
                                    {challenge.instructions || t('courseLearning.challenge.noInstructions')}
                                </div>
                            </div>

                            {visibleTests.length > 0 && (
                                <div className="bg-[#303133] rounded p-2 border border-[#404144] mt-auto">
                                    <p className="text-sm font-semibold mb-2 text-white">
                                        {t('courseLearning.challenge.visibleTests')}
                                    </p>
                                    <ul className="space-y-3 text-sm">
                                        {visibleTests.map((test) => (
                                            <li
                                                key={test.id || test.title}
                                                className="text-gray-300"
                                            >
                                                <span className="font-medium text-white">
                                                    {test.title}:
                                                </span>{' '}
                                                <code className="bg-[#262729] px-2 py-1 rounded text-orange-400">
                                                    {t('courseLearning.challenge.args')}:{' '}
                                                    {test.args ? JSON.stringify(test.args) : '[]'}
                                                </code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-[#262729] p-6 flex flex-col">
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium mb-3 text-white">
                                    {t('courseLearning.challenge.code')}
                                </label>

                                {challenge.timeLimitMs && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                        <FiClock className="text-edubot-orange text-xl" />
                                        {t('courseLearning.challenge.timeLimitMinutes', {
                                            value: (challenge.timeLimitMs / 1000 / 60).toFixed(1),
                                        })}
                                    </div>
                                )}
                            </div>

                            <textarea
                                className="w-full border border-[#404144] rounded p-4 font-mono min-h-[350px] bg-[#0f172a] text-gray-100 focus:border-edubot-orange focus:ring-1 focus:ring-edubot-orange resize-none"
                                value={code ?? challenge.starterCode ?? ''}
                                onChange={(e) => onCodeChange?.(e.target.value)}
                                disabled={disabled}
                                placeholder={
                                    challenge.starterCode || t('courseLearning.challenge.codePlaceholder')
                                }
                            />
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#404144]">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={disabled || submitting}
                                className="w-full px-4 py-3 rounded bg-edubot-orange text-white disabled:opacity-60 hover:bg-orange-600 transition-colors font-medium"
                            >
                                {submitting ? t('courseLearning.challenge.checking') : t('courseLearning.challenge.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup */}
            {showResultPopup && result && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#262729] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[#404144]">
                        <div className="flex items-center justify-between p-4 border-b border-[#404144]">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {result.passed ? (
                                    <FiCheckCircle className="text-green-500" />
                                ) : (
                                    <FiXCircle className="text-red-500" />
                                )}
                                {t('courseLearning.challenge.resultsTitle')}
                            </h3>
                            <button
                                onClick={closePopup}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-[#303133]"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <div
                                className={`rounded p-4 mb-4 ${result.passed
                                        ? 'bg-green-900 bg-opacity-20 border border-green-800 text-green-400'
                                        : 'bg-red-900 bg-opacity-20 border border-red-800 text-red-400'
                                    }`}
                            >
                                <p className="font-semibold">
                                    {result.passed
                                        ? t('courseLearning.challenge.allPassed')
                                        : t('courseLearning.challenge.someFailed')}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {result.results?.map((testResult, idx) => (
                                    <div
                                        key={testResult.testId || idx}
                                        className={`border rounded p-3 text-sm ${testResult.passed
                                                ? 'border-green-500 bg-green-900 bg-opacity-10'
                                                : 'border-red-500 bg-red-900 bg-opacity-10'
                                            }`}
                                    >
                                        <p className="font-semibold flex items-center gap-2 text-white mb-2">
                                            {testResult.passed ? (
                                                <FiCheckCircle className="text-green-500" />
                                            ) : (
                                                <FiXCircle className="text-red-500" />
                                            )}
                                            <span>
                                                {challenge.tests?.find(
                                                    (t) => t.id === testResult.testId
                                                )?.title || t('courseLearning.challenge.testFallback', { number: idx + 1 })}
                                                {testResult.isHidden && ` ${t('courseLearning.challenge.hiddenSuffix')}`}
                                            </span>
                                        </p>

                                        {testResult.message && (
                                            <p className="text-red-400 text-xs mb-2">
                                                {testResult.message}
                                            </p>
                                        )}

                                        {!testResult.isHidden && !testResult.message && (
                                            <div className="text-gray-300 space-y-1 text-xs">
                                                {typeof testResult.actual !== 'undefined' && (
                                                    <p>
                                                        {t('courseLearning.challenge.actualResult')}:{' '}
                                                        <code className="bg-[#303133] px-2 py-1 rounded text-orange-400">
                                                            {JSON.stringify(testResult.actual)}
                                                        </code>
                                                    </p>
                                                )}
                                                {typeof testResult.expected !== 'undefined' && (
                                                    <p>
                                                        {t('courseLearning.challenge.expectedResult')}:{' '}
                                                        <code className="bg-[#303133] px-2 py-1 rounded text-green-400">
                                                            {JSON.stringify(testResult.expected)}
                                                        </code>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LessonChallengePlayer;
