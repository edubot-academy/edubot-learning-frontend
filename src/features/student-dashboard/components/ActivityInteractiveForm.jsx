import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX, FiVolume2 } from 'react-icons/fi';

// ── Vocabulary Flashcard ─────────────────────────────────────────────────────

function VocabularyFlashcard({ payload, answers, onChange }) {
    const { t } = useTranslation();
    const words = Array.isArray(payload?.words) ? payload.words : [];
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const current = words[index];
    const known = answers?.known ?? [];
    const unknown = answers?.unknown ?? [];
    const total = words.length;
    const reviewed = known.length + unknown.length;

    const markKnown = useCallback(() => {
        const next = { known: [...(answers?.known ?? []), index], unknown: answers?.unknown ?? [] };
        onChange(next);
        setFlipped(false);
        if (index < total - 1) setIndex((i) => i + 1);
    }, [answers, index, onChange, total]);

    const markUnknown = useCallback(() => {
        const next = { known: answers?.known ?? [], unknown: [...(answers?.unknown ?? []), index] };
        onChange(next);
        setFlipped(false);
        if (index < total - 1) setIndex((i) => i + 1);
    }, [answers, index, onChange, total]);

    if (!words.length) return <p className="text-sm text-edubot-muted">{t('studentDashboard.tasks.interactive.noContent')}</p>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-edubot-muted">
                <span>{t('studentDashboard.tasks.interactive.vocab.progress', { reviewed, total })}</span>
                <span>{t('studentDashboard.tasks.interactive.vocab.card', { current: index + 1, total })}</span>
            </div>

            <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="w-full min-h-[140px] rounded-2xl border-2 border-edubot-line bg-white/80 dark:bg-slate-900/70 dark:border-slate-700 p-6 text-center transition hover:border-edubot-orange cursor-pointer"
            >
                {flipped ? (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.tasks.interactive.vocab.definition')}
                        </p>
                        <p className="text-lg font-semibold text-edubot-ink dark:text-white">{current?.definition ?? '—'}</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.tasks.interactive.vocab.word')}
                        </p>
                        <p className="text-2xl font-bold text-edubot-ink dark:text-white">{current?.word ?? '—'}</p>
                        <p className="text-xs text-edubot-muted mt-2">{t('studentDashboard.tasks.interactive.vocab.tapToFlip')}</p>
                    </div>
                )}
            </button>

            <div className="flex items-center gap-3">
                <button type="button" disabled={index === 0} onClick={() => { setIndex((i) => i - 1); setFlipped(false); }}
                    className="rounded-xl border border-edubot-line px-3 py-2 text-sm text-edubot-muted disabled:opacity-40 hover:border-edubot-orange hover:text-edubot-orange transition">
                    <FiChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={markUnknown}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 transition">
                    <FiX className="h-4 w-4" /> {t('studentDashboard.tasks.interactive.vocab.notYet')}
                </button>
                <button type="button" onClick={markKnown}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 transition">
                    <FiCheck className="h-4 w-4" /> {t('studentDashboard.tasks.interactive.vocab.gotIt')}
                </button>
                <button type="button" disabled={index === total - 1} onClick={() => { setIndex((i) => i + 1); setFlipped(false); }}
                    className="rounded-xl border border-edubot-line px-3 py-2 text-sm text-edubot-muted disabled:opacity-40 hover:border-edubot-orange hover:text-edubot-orange transition">
                    <FiChevronRight className="h-4 w-4" />
                </button>
            </div>

            {reviewed === total && (
                <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {t('studentDashboard.tasks.interactive.vocab.allReviewed', { known: known.length, unknown: unknown.length })}
                </p>
            )}
        </div>
    );
}

// ── Fill Blank ───────────────────────────────────────────────────────────────

function FillBlankForm({ payload, answers, onChange }) {
    const { t } = useTranslation();
    const sentences = Array.isArray(payload?.sentences) ? payload.sentences : [];

    if (!sentences.length) return <p className="text-sm text-edubot-muted">{t('studentDashboard.tasks.interactive.noContent')}</p>;

    return (
        <div className="space-y-4">
            {sentences.map((sentence, sentenceIndex) => {
                const parts = String(sentence.sentence ?? '').split('___');
                const gaps = parts.length - 1;
                return (
                    <div key={sentenceIndex} className="rounded-2xl border border-edubot-line/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.tasks.interactive.fillBlank.sentence', { n: sentenceIndex + 1 })}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 text-sm text-edubot-ink dark:text-white">
                            {parts.map((part, partIndex) => (
                                <span key={partIndex} className="flex items-center gap-1">
                                    <span>{part}</span>
                                    {partIndex < gaps && (
                                        <input
                                            type="text"
                                            value={answers?.[sentenceIndex]?.[partIndex] ?? ''}
                                            onChange={(e) => {
                                                const next = { ...(answers ?? {}) };
                                                next[sentenceIndex] = { ...(next[sentenceIndex] ?? {}), [partIndex]: e.target.value };
                                                onChange(next);
                                            }}
                                            placeholder="..."
                                            className="w-24 rounded-lg border border-edubot-orange/60 bg-amber-50/60 px-2 py-1 text-center text-sm font-medium text-edubot-ink focus:outline-none focus:ring-2 focus:ring-edubot-orange dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-white"
                                        />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Word Match ───────────────────────────────────────────────────────────────

function WordMatchForm({ payload, answers, onChange }) {
    const { t } = useTranslation();
    const pairs = Array.isArray(payload?.pairs) ? payload.pairs : [];
    const [selectedWord, setSelectedWord] = useState(null);

    const matched = answers ?? {};
    const leftWords = pairs.map((p) => p.word ?? p.left ?? '');
    const [shuffledRight] = useState(() => [...pairs.map((p) => p.definition ?? p.right ?? '')].sort(() => 0.5 - Math.random()));

    const handleLeft = (word) => {
        if (Object.keys(matched).includes(word)) return;
        setSelectedWord((prev) => (prev === word ? null : word));
    };

    const handleRight = (def) => {
        if (Object.values(matched).includes(def)) return;
        if (!selectedWord) return;
        const next = { ...matched, [selectedWord]: def };
        onChange(next);
        setSelectedWord(null);
    };

    if (!pairs.length) return <p className="text-sm text-edubot-muted">{t('studentDashboard.tasks.interactive.noContent')}</p>;

    return (
        <div className="space-y-3">
            <p className="text-xs text-edubot-muted">{t('studentDashboard.tasks.interactive.wordMatch.instructions')}</p>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    {leftWords.map((word) => {
                        const isMatched = word in matched;
                        const isSelected = selectedWord === word;
                        return (
                            <button key={word} type="button" onClick={() => handleLeft(word)}
                                className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                                    isMatched
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 cursor-default'
                                        : isSelected
                                        ? 'border-edubot-orange bg-orange-50 text-edubot-ink dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-white'
                                        : 'border-edubot-line text-edubot-ink hover:border-edubot-orange dark:border-slate-700 dark:text-white'
                                }`}>
                                {word}
                                {isMatched && <FiCheck className="ml-2 inline h-3.5 w-3.5" />}
                            </button>
                        );
                    })}
                </div>
                <div className="space-y-2">
                    {shuffledRight.map((def) => {
                        const isMatched = Object.values(matched).includes(def);
                        return (
                            <button key={def} type="button" onClick={() => handleRight(def)}
                                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                                    isMatched
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 cursor-default'
                                        : !selectedWord
                                        ? 'border-edubot-line text-edubot-muted dark:border-slate-700 dark:text-slate-400 cursor-default'
                                        : 'border-edubot-line text-edubot-ink hover:border-sky-400 dark:border-slate-700 dark:text-white cursor-pointer'
                                }`}>
                                {def}
                            </button>
                        );
                    })}
                </div>
            </div>
            {Object.keys(matched).length === pairs.length && pairs.length > 0 && (
                <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {t('studentDashboard.tasks.interactive.wordMatch.allMatched')}
                </p>
            )}
        </div>
    );
}

// ── Listening ────────────────────────────────────────────────────────────────

function ListeningForm({ payload, answers, onChange }) {
    const { t } = useTranslation();
    const audioUrl = payload?.audioUrl ?? null;
    const prompt = payload?.prompt ?? '';

    return (
        <div className="space-y-4">
            {audioUrl ? (
                <div className="rounded-2xl border border-edubot-line/70 bg-sky-50/60 dark:border-slate-700 dark:bg-sky-500/5 p-4">
                    <div className="flex items-center gap-2 mb-3 text-sky-700 dark:text-sky-300">
                        <FiVolume2 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            {t('studentDashboard.tasks.interactive.listening.audioTitle')}
                        </span>
                    </div>
                    <audio controls className="w-full rounded-xl" src={audioUrl}>
                        {t('studentDashboard.tasks.interactive.listening.noAudio')}
                    </audio>
                </div>
            ) : (
                <p className="text-sm text-edubot-muted">{t('studentDashboard.tasks.interactive.listening.noAudioFile')}</p>
            )}

            <div className="rounded-2xl border border-edubot-line/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70 p-4">
                {prompt && (
                    <p className="mb-2 text-sm font-semibold text-edubot-ink dark:text-white">{prompt}</p>
                )}
                <input
                    type="text"
                    value={answers?.response ?? ''}
                    onChange={(e) => onChange({ response: e.target.value })}
                    placeholder={t('studentDashboard.tasks.interactive.listening.answerPlaceholder')}
                    className="dashboard-field"
                />
            </div>
        </div>
    );
}

// ── Writing Correction ───────────────────────────────────────────────────────

function WritingCorrectionForm({ payload, answers, onChange }) {
    const { t } = useTranslation();
    const prompt = payload?.prompt ?? '';
    const rubric = payload?.rubric ?? null;

    return (
        <div className="space-y-4">
            {prompt && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/60 dark:border-violet-500/30 dark:bg-violet-500/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-2">
                        {t('studentDashboard.tasks.interactive.writing.prompt')}
                    </p>
                    <p className="text-sm text-edubot-ink dark:text-white leading-relaxed">{prompt}</p>
                </div>
            )}
            {rubric && (
                <div className="rounded-2xl border border-edubot-line/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400 mb-2">
                        {t('studentDashboard.tasks.interactive.writing.rubric')}
                    </p>
                    <p className="text-sm text-edubot-muted dark:text-slate-300 leading-relaxed">{rubric}</p>
                </div>
            )}
            <textarea
                rows={8}
                value={answers?.text ?? ''}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder={t('studentDashboard.tasks.interactive.writing.placeholder')}
                className="dashboard-field"
            />
        </div>
    );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function ActivityInteractiveForm({ task, answers, onChange }) {
    const { activityType, payload } = task;
    if (activityType === 'vocabulary') return <VocabularyFlashcard payload={payload} answers={answers} onChange={onChange} />;
    if (activityType === 'fill_blank') return <FillBlankForm payload={payload} answers={answers} onChange={onChange} />;
    if (activityType === 'word_match') return <WordMatchForm payload={payload} answers={answers} onChange={onChange} />;
    if (activityType === 'listening') return <ListeningForm payload={payload} answers={answers} onChange={onChange} />;
    if (activityType === 'writing_correction') return <WritingCorrectionForm payload={payload} answers={answers} onChange={onChange} />;
    return null;
}

export const INTERACTIVE_ACTIVITY_TYPES = new Set(['vocabulary', 'fill_blank', 'word_match', 'listening', 'writing_correction']);
