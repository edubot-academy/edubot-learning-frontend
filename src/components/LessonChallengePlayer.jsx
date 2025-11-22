import React, { useState, useEffect } from "react";
import { FiCode, FiClock, FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

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
    const [showResultPopup, setShowResultPopup] = useState(false);

    // Показываем popup когда появляется результат
    useEffect(() => {
        if (result && !submitting) {
            setShowResultPopup(true);
        }
    }, [result, submitting]);

    const closePopup = () => {
        setShowResultPopup(false);
    };

    // Закрытие popup при клике вне области
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

    if (loading) {
        return (
            <div className="mb-6 bg-[#262729] rounded-lg shadow-md p-6 min-h-[160px] flex items-center justify-center">
                <p className="text-gray-500">Код тапшырма жүктөлүүдө...</p>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="mb-6 bg-[#262729] rounded-lg shadow-md p-6">
                <p className="text-gray-500">Код тапшырма табылган жок.</p>
            </div>
        );
    }

    const visibleTests = (challenge.tests || []).filter((test) => !test.isHidden);

    return (
        <>
            {/* Основной контейнер с горизонтальным разделением */}
            <div className="mb-6 rounded-lg shadow-md overflow-hidden bg-[#303133] p-1">
                <div className="flex flex-col lg:flex-row min-h-[500px]">
                    
                    {/* Секция 1: Задание - левая часть */}
                    <div className="flex-1 bg-[#262729] p-6">
                        <div className="h-full flex flex-col">
                            {/* Заголовок и инструкции */}
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                                    <FiCode className="text-edubot-orange" /> Код тапшырма
                                </h3>
                                
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-300 mb-4">
                                    {challenge.instructions || 'Инструкция берилген эмес.'}
                                </div>

                                {/* Ограничение по времени */}
                                {challenge.timeLimitMs && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <FiClock className="text-edubot-orange" />
                                        Убакыт чектөөсү: {challenge.timeLimitMs} мс
                                    </div>
                                )}

                                {/* Видимые тесты */}
                                {visibleTests.length > 0 && (
                                    <div className="bg-[#303133] rounded p-4 border border-[#404144]">
                                        <p className="text-sm font-semibold mb-3 text-white">Ачык тесттер</p>
                                        <ul className="space-y-3 text-sm">
                                            {visibleTests.map((test) => (
                                                <li key={test.id || test.title} className="text-gray-300">
                                                    <span className="font-medium text-white">{test.title}:</span>{" "}
                                                    <code className="bg-[#262729] px-2 py-1 rounded text-orange-400">
                                                        args: {test.args ? JSON.stringify(test.args) : '[]'}
                                                    </code>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Подсказка внизу левой секции */}
                            <div className="mt-4 p-3 bg-[#303133] rounded border border-[#404144]">
                                <p className="text-xs text-gray-400">
                                    Каалаган JavaScript кодун колдонсоңуз болот. Функция, класс же жылаңач скрипт болушу мүмкүн — тесттер жөн гана чыгарган жыйынтыкка карайт.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Секция 2: Редактор кода - правая часть */}
                    <div className="flex-1 bg-[#262729] p-6 flex flex-col">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-3 text-white">Код</label>
                            <textarea
                                className="w-full border border-[#404144] rounded p-4 font-mono min-h-[350px] bg-[#0f172a] text-gray-100 focus:border-edubot-orange focus:ring-1 focus:ring-edubot-orange resize-none"
                                value={code ?? challenge.starterCode ?? ''}
                                onChange={(e) => onCodeChange?.(e.target.value)}
                                disabled={disabled}
                                placeholder={challenge.starterCode || '// Каалаган JavaScript кодун жазыңыз'}
                            />
                            
                            <p className="text-xs text-gray-400 mt-2">
                                Кандай гана код стилин колдонсоңуз да болот. Натыйжа тесттердин күткөн маанисине дал келсе жетиштүү.
                            </p>
                        </div>

                        {/* Кнопка отправки - внизу правой секции */}
                        <div className="mt-6 pt-4 border-t border-[#404144]">
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={disabled || submitting}
                                className="w-full px-4 py-3 rounded bg-edubot-orange text-white disabled:opacity-60 hover:bg-orange-600 transition-colors font-medium"
                            >
                                {submitting ? 'Текшерүүдө...' : 'Тапшыруу'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup для результатов */}
            {showResultPopup && result && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#262729] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[#404144]">
                        {/* Заголовок popup */}
                        <div className="flex items-center justify-between p-4 border-b border-[#404144]">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {result.passed ? (
                                    <FiCheckCircle className="text-green-500" />
                                ) : (
                                    <FiXCircle className="text-red-500" />
                                )}
                                Тест натыйжалары
                            </h3>
                            <button
                                onClick={closePopup}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-[#303133]"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Контент popup */}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {/* Общий статус */}
                            <div className={`rounded p-4 mb-4 ${
                                result.passed 
                                    ? 'bg-green-900 bg-opacity-20 border border-green-800 text-green-400' 
                                    : 'bg-red-900 bg-opacity-20 border border-red-800 text-red-400'
                            }`}>
                                <p className="font-semibold">
                                    {result.passed
                                        ? '🎉 Бардык тесттер ийгиликтүү өттү!'
                                        : '❌ Айрым тесттер өтпөй калды.'}
                                </p>
                            </div>

                            {/* Детали по тестам */}
                            <div className="space-y-3">
                                {result.results?.map((testResult, idx) => (
                                    <div
                                        key={testResult.testId || idx}
                                        className={`border rounded p-3 text-sm ${
                                            testResult.passed
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
                                                {challenge.tests?.find((t) => t.id === testResult.testId)?.title || `Тест ${idx + 1}`}
                                                {testResult.isHidden && ' (жашыруун)'}
                                            </span>
                                        </p>
                                        
                                        {testResult.message && (
                                            <p className="text-red-400 text-xs mb-2">{testResult.message}</p>
                                        )}
                                        
                                        {!testResult.isHidden && !testResult.message && (
                                            <div className="text-gray-300 space-y-1 text-xs">
                                                {typeof testResult.actual !== 'undefined' && (
                                                    <p>
                                                        Чыныгы натыйжа: <code className="bg-[#303133] px-2 py-1 rounded text-orange-400">{JSON.stringify(testResult.actual)}</code>
                                                    </p>
                                                )}
                                                {typeof testResult.expected !== 'undefined' && (
                                                    <p>
                                                        Күтүлгөн натыйжа: <code className="bg-[#303133] px-2 py-1 rounded text-green-400">{JSON.stringify(testResult.expected)}</code>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Футер popup */}
                        <div className="p-4 border-t border-[#404144] bg-[#303133]">
                            <button
                                onClick={closePopup}
                                className="w-full px-4 py-2 rounded bg-edubot-orange text-white hover:bg-orange-600 transition-colors"
                            >
                                Жабуу
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LessonChallengePlayer;