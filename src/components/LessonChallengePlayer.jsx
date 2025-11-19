import React from "react";
import { FiCode, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

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
    if (loading) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6 min-h-[160px] flex items-center justify-center">
                <p className="text-gray-500">Код тапшырма жүктөлүүдө...</p>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500">Код тапшырма табылган жок.</p>
            </div>
        );
    }

    const visibleTests = (challenge.tests || []).filter((test) => !test.isHidden);

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <FiCode /> Код тапшырма
                    </h3>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {challenge.instructions || 'Инструкция берилген эмес.'}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Каалаган JavaScript кодун колдонсоңуз болот. Функция, класс же жылаңач скрипт болушу мүмкүн — тесттер жөн гана чыгарган жыйынтыкка карайт.
                    </p>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    {challenge.timeLimitMs && (
                        <p className="flex items-center gap-1">
                            <FiClock /> {challenge.timeLimitMs} мс
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Код</label>
                <textarea
                    className="w-full border rounded p-3 font-mono min-h-[220px] bg-[#0f172a] text-gray-100 border-[#1f2937] focus:border-edubot-orange focus:ring-1 focus:ring-edubot-orange"
                    value={code ?? challenge.starterCode ?? ''}
                    onChange={(e) => onCodeChange?.(e.target.value)}
                    disabled={disabled}
                    placeholder={challenge.starterCode || '// Каалаган JavaScript кодун жазыңыз'}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Кандай гана код стилин колдонсоңуз да болот. Натыйжа тесттердин күткөн маанисине дал келсе жетиштүү.
                </p>
            </div>

            {visibleTests.length > 0 && (
                <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm font-semibold mb-2">Ачык тесттер</p>
                    <ul className="space-y-2 text-sm">
                        {visibleTests.map((test) => (
                            <li key={test.id || test.title}>
                                <span className="font-medium">{test.title}:</span>{" "}
                                <code>args: {test.args ? JSON.stringify(test.args) : '[]'}</code>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                type="button"
                onClick={onSubmit}
                disabled={disabled || submitting}
                className="px-4 py-2 rounded bg-edubot-orange text-white disabled:opacity-60"
            >
                {submitting ? 'Текшерүүдө...' : 'Тапшыруу'}
            </button>

            {result && (
                <div className="space-y-3">
                    <div className={`rounded p-3 ${result.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {result.passed
                            ? 'Бардык тесттер ийгиликтүү өттү!'
                            : 'Айрым тесттер өтпөй калды.'}
                    </div>
                    <div className="space-y-2">
                        {result.results?.map((testResult, idx) => (
                            <div
                                key={testResult.testId || idx}
                                className={`border rounded p-3 text-sm ${testResult.passed
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                }`}
                            >
                                <p className="font-semibold flex items-center gap-2">
                                    {testResult.passed ? (
                                        <FiCheckCircle className="text-green-600" />
                                    ) : (
                                        <FiXCircle className="text-red-600" />
                                    )}
                                    <span>
                                        {challenge.tests?.find((t) => t.id === testResult.testId)?.title || `Тест ${idx + 1}`}
                                        {testResult.isHidden && ' (жашыруун)'}
                                    </span>
                                </p>
                                {testResult.message && (
                                    <p className="text-red-700">{testResult.message}</p>
                                )}
                                {!testResult.isHidden && !testResult.message && (
                                    <div className="text-gray-700 space-y-1">
                                        {typeof testResult.actual !== 'undefined' && (
                                            <p>
                                                Чыныгы: <code>{JSON.stringify(testResult.actual)}</code>
                                            </p>
                                        )}
                                        {typeof testResult.expected !== 'undefined' && (
                                            <p>
                                                Күтүлгөн: <code>{JSON.stringify(testResult.expected)}</code>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonChallengePlayer;
