import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCheck, FiChevronLeft, FiChevronRight, FiRefreshCw, FiX } from 'react-icons/fi';
import { DashboardSectionHeader } from '@components/ui/dashboard';
import { getDueVocabularyCards, recordVocabularyReview } from '@features/student/api';

// ── Leitner box colour tokens ─────────────────────────────────────────────────
const BOX_COLORS = [
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
];
const boxColor = (box) => BOX_COLORS[Math.max(0, Math.min(4, (box ?? 1) - 1))];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ReviewSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-4 w-40 rounded bg-edubot-surfaceAlt dark:bg-slate-800" />
            <div className="h-44 rounded-2xl bg-edubot-surfaceAlt dark:bg-slate-800" />
            <div className="flex gap-3">
                <div className="h-10 flex-1 rounded-xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                <div className="h-10 flex-1 rounded-xl bg-edubot-surfaceAlt dark:bg-slate-800" />
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function AllCaughtUp({ onRefresh, t }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">🎉</span>
            <p className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                {t('studentDashboard.vocabularyReviews.empty.title')}
            </p>
            <p className="mt-1 max-w-xs text-sm text-edubot-muted dark:text-slate-400">
                {t('studentDashboard.vocabularyReviews.empty.description')}
            </p>
            <button
                type="button"
                onClick={onRefresh}
                className="mt-6 flex items-center gap-2 rounded-xl border border-edubot-line px-5 py-2.5 text-sm font-semibold text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-400 transition-colors"
            >
                <FiRefreshCw className="h-4 w-4" />
                {t('studentDashboard.vocabularyReviews.empty.refresh')}
            </button>
        </div>
    );
}

// ── Session complete ──────────────────────────────────────────────────────────
function SessionDone({ knownCount, totalCount, onRestart, t }) {
    const stillLearning = totalCount - knownCount;
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">✅</span>
            <p className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                {t('studentDashboard.vocabularyReviews.done.title')}
            </p>
            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                {t('studentDashboard.vocabularyReviews.done.subtitle')}
            </p>
            <div className="mt-6 flex gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-700 dark:bg-emerald-900/20">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{knownCount}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {t('studentDashboard.vocabularyReviews.done.known', { count: knownCount })}
                    </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-700 dark:bg-amber-900/20">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stillLearning}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        {t('studentDashboard.vocabularyReviews.done.stillLearning', { count: stillLearning })}
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={onRestart}
                className="mt-8 flex items-center gap-2 rounded-xl bg-edubot-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-edubot-orange/90 transition-colors"
            >
                <FiRefreshCw className="h-4 w-4" />
                {t('studentDashboard.vocabularyReviews.done.reviewAgain')}
            </button>
        </div>
    );
}

// ── Flashcard ─────────────────────────────────────────────────────────────────
function Flashcard({ card, index, total, onKnown, onUnknown, onPrev, onNext, recording, t }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => { setFlipped(false); }, [card]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${boxColor(card.box)}`}>
                    {t('studentDashboard.vocabularyReviews.boxLabel', { box: card.box ?? 1 })}
                </span>
                <span className="text-xs text-edubot-muted dark:text-slate-400">
                    {t('studentDashboard.vocabularyReviews.card', { current: index + 1, total })}
                </span>
            </div>

            {/* Flip card */}
            <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="w-full min-h-[160px] rounded-2xl border-2 border-edubot-line bg-white/80 dark:bg-slate-900/70 dark:border-slate-700 p-6 text-center transition hover:border-edubot-orange cursor-pointer"
            >
                {flipped ? (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.vocabularyReviews.definition')}
                        </p>
                        <p className="text-lg font-semibold text-edubot-ink dark:text-white">
                            {card.definition ?? '—'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.vocabularyReviews.word')}
                        </p>
                        <p className="text-3xl font-bold text-edubot-ink dark:text-white">
                            {card.word ?? '—'}
                        </p>
                        <p className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.vocabularyReviews.tapToFlip')}
                        </p>
                    </div>
                )}
            </button>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={index === 0}
                    onClick={onPrev}
                    className="rounded-xl border border-edubot-line px-3 py-2 text-sm text-edubot-muted disabled:opacity-40 hover:border-edubot-orange hover:text-edubot-orange transition"
                >
                    <FiChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={recording}
                    onClick={onUnknown}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 transition"
                >
                    <FiX className="h-4 w-4" />
                    {t('studentDashboard.vocabularyReviews.notYet')}
                </button>
                <button
                    type="button"
                    disabled={recording}
                    onClick={onKnown}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 transition"
                >
                    <FiCheck className="h-4 w-4" />
                    {t('studentDashboard.vocabularyReviews.gotIt')}
                </button>
                <button
                    type="button"
                    disabled={index === total - 1}
                    onClick={onNext}
                    className="rounded-xl border border-edubot-line px-3 py-2 text-sm text-edubot-muted disabled:opacity-40 hover:border-edubot-orange hover:text-edubot-orange transition"
                >
                    <FiChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
const VocabularyReviewsTab = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
    const [knownIds, setKnownIds] = useState([]);
    const [done, setDone] = useState(false);
    const [recording, setRecording] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setDone(false);
        setIndex(0);
        setKnownIds([]);
        try {
            const data = await getDueVocabularyCards();
            setCards(Array.isArray(data) ? data : data?.items ?? data?.data ?? []);
        } catch {
            toast.error(t('studentDashboard.vocabularyReviews.toasts.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    const advance = useCallback((currentIndex, total) => {
        if (currentIndex < total - 1) {
            setIndex((i) => i + 1);
        } else {
            setDone(true);
        }
    }, []);

    const handleKnown = useCallback(async () => {
        const card = cards[index];
        if (!card) return;
        setRecording(true);
        try {
            await recordVocabularyReview(card.id, true);
            setKnownIds((prev) => [...prev, card.id]);
        } catch {
            // non-fatal — still advance
        } finally {
            setRecording(false);
            advance(index, cards.length);
        }
    }, [cards, index, advance]);

    const handleUnknown = useCallback(async () => {
        const card = cards[index];
        if (!card) return;
        setRecording(true);
        try {
            await recordVocabularyReview(card.id, false);
        } catch {
            // non-fatal — still advance
        } finally {
            setRecording(false);
            advance(index, cards.length);
        }
    }, [cards, index, advance]);

    const handleRestart = () => {
        load();
    };

    const dueCount = cards.length;

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('studentDashboard.vocabularyReviews.eyebrow')}
                title={t('studentDashboard.vocabularyReviews.title')}
                description={t('studentDashboard.vocabularyReviews.description')}
            />

            <div className="rounded-2xl border border-edubot-line/60 bg-white/90 p-6 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950">
                {loading ? (
                    <ReviewSkeleton />
                ) : dueCount === 0 ? (
                    <AllCaughtUp onRefresh={load} t={t} />
                ) : done ? (
                    <SessionDone
                        knownCount={knownIds.length}
                        totalCount={dueCount}
                        onRestart={handleRestart}
                        t={t}
                    />
                ) : (
                    <>
                        <p className="mb-4 text-xs font-medium text-edubot-muted dark:text-slate-400">
                            {t('studentDashboard.vocabularyReviews.dueCount_other', { count: dueCount })}
                        </p>
                        <Flashcard
                            card={cards[index]}
                            index={index}
                            total={dueCount}
                            onKnown={handleKnown}
                            onUnknown={handleUnknown}
                            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
                            onNext={() => setIndex((i) => Math.min(dueCount - 1, i + 1))}
                            recording={recording}
                            t={t}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default VocabularyReviewsTab;
