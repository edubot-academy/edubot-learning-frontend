import { useState, useMemo } from 'react';
import { calculateReadinessScore, scoreColor } from '../utils/careerLimits';

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconCheck = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const IconPlus = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const IconSparkle = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
    </svg>
);

// ─── Score ring (SVG) ─────────────────────────────────────────────────────────

const RING_R = 42;
const RING_CIRC = 2 * Math.PI * RING_R;

const ScoreRing = ({ score, color }) => {
    const fill = (score / 100) * RING_CIRC;
    return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r={RING_R} fill="none" stroke="#e5e7eb" strokeWidth="9" />
            {/* Progress */}
            <circle
                cx="50" cy="50" r={RING_R}
                fill="none"
                stroke={color.ring}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${fill} ${RING_CIRC}`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
        </svg>
    );
};

// ─── Inline field input ───────────────────────────────────────────────────────

const InlineField = ({ suggestion, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState(value ?? '');

    if (!open) {
        return (
            <li className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#3E424A] dark:text-[#a6adba] leading-snug">
                    {suggestion.label}
                </span>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#E14219]/30 bg-[#E14219]/5 px-3 py-1 text-xs font-semibold text-[#E14219] hover:bg-[#E14219]/10 transition-colors"
                >
                    <IconPlus className="w-3 h-3" />
                    Add now
                </button>
            </li>
        );
    }

    const handleSave = () => {
        onChange(suggestion.key, local.trim());
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setOpen(false);
    };

    return (
        <li className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#141619] dark:text-[#E8ECF3]">
                {suggestion.label}
            </span>
            {suggestion.inputType === 'select' ? (
                <div className="flex items-center gap-2">
                    <select
                        autoFocus
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-[#141619] dark:text-[#E8ECF3] focus:outline-none focus:ring-2 focus:ring-[#E14219]/20 focus:border-[#E14219]/50"
                    >
                        <option value="">— select —</option>
                        {suggestion.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3 py-2 text-xs font-semibold text-white"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type={suggestion.inputType ?? 'text'}
                        autoFocus
                        value={local}
                        placeholder={suggestion.placeholder}
                        onChange={(e) => setLocal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-[#141619] dark:text-[#E8ECF3] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E14219]/20 focus:border-[#E14219]/50"
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!local.trim()}
                        className="rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                    >
                        ✕
                    </button>
                </div>
            )}
        </li>
    );
};

// ─── ResumeReadinessScore ──────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object} props.formData — { name, targetRole, skills, extras }
 * @param {number|null} props.apiScore — score from draft.readinessScore (API)
 * @param {Object} props.extras — extra fields added via one-click fixes
 * @param {function} props.onExtraChange — (key, value) => void
 * @param {function} props.onRegenerate — () => void
 * @param {boolean} props.hasExtrasToRegenerate — whether there are unsaved extras
 */
const ResumeReadinessScore = ({
    formData,
    apiScore = null,
    extras = {},
    onExtraChange,
    onRegenerate,
    hasExtrasToRegenerate = false,
}) => {
    const formWithExtras = useMemo(() => ({ ...formData, extras }), [formData, extras]);
    const { score: clientScore, strong, missing, ats } = useMemo(
        () => calculateReadinessScore(formWithExtras),
        [formWithExtras],
    );

    const displayScore = apiScore ?? clientScore;
    const color = scoreColor(displayScore);

    const allSuggestions = [...missing, ...ats];
    const unfilledSuggestions = allSuggestions.filter((s) => !extras[s.key] && !s.required);
    const requiredSuggestions = allSuggestions.filter((s) => s.required);

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                <h3 className="font-suisse font-semibold text-base text-[#141619] dark:text-[#E8ECF3]">
                    Resume Score
                </h3>
                {apiScore != null && (
                    <span className="text-xs text-[#3E424A] dark:text-[#a6adba]">
                        from AI analysis
                    </span>
                )}
            </div>

            <div className="p-6">
                {/* ── Score ring + number ── */}
                <div className="flex items-center gap-5 mb-6">
                    <div className="relative flex-shrink-0">
                        <ScoreRing score={displayScore} color={color} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-bold tabular-nums ${color.text}`}>
                                {displayScore}
                            </span>
                            <span className="text-[10px] text-[#3E424A] dark:text-[#a6adba]">/100</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#141619] dark:text-[#E8ECF3] mb-1">
                            {displayScore >= 80
                                ? 'Great resume — ready to send'
                                : displayScore >= 55
                                ? 'Good start — a few improvements needed'
                                : 'Fill in more fields to improve your match rate'}
                        </p>
                        <p className="text-xs text-[#3E424A] dark:text-[#a6adba]">
                            {unfilledSuggestions.length > 0
                                ? `${unfilledSuggestions.length} quick ${unfilledSuggestions.length === 1 ? 'fix' : 'fixes'} can push your score higher`
                                : 'All key fields are filled in'}
                        </p>

                        {/* Regenerate button — appears after extras are added */}
                        {hasExtrasToRegenerate && (
                            <button
                                type="button"
                                onClick={onRegenerate}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3.5 py-2 text-xs font-semibold text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-colors"
                            >
                                <IconSparkle className="w-3.5 h-3.5" />
                                Regenerate with improvements
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Strong points ── */}
                {strong.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-[#141619] dark:text-[#E8ECF3] mb-2.5 uppercase tracking-wide">
                            Strong points
                        </p>
                        <ul className="space-y-1.5">
                            {strong.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <IconCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#3E424A] dark:text-[#a6adba]">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Required missing ── */}
                {requiredSuggestions.length > 0 && (
                    <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-4 py-3">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                            Required to generate
                        </p>
                        {requiredSuggestions.map((s) => (
                            <p key={s.key} className="text-sm text-amber-600 dark:text-amber-400">
                                · {s.label}
                            </p>
                        ))}
                    </div>
                )}

                {/* ── One-click fix suggestions ── */}
                {unfilledSuggestions.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-[#141619] dark:text-[#E8ECF3] mb-3 uppercase tracking-wide">
                            Improve your score
                        </p>
                        <ul className="space-y-3">
                            {unfilledSuggestions.map((s) => (
                                <InlineField
                                    key={s.key}
                                    suggestion={s}
                                    value={extras[s.key]}
                                    onChange={onExtraChange}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {unfilledSuggestions.length === 0 && strong.length > 0 && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            All fields filled — looking great!
                        </p>
                        {hasExtrasToRegenerate && (
                            <button
                                type="button"
                                onClick={onRegenerate}
                                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2 text-xs font-semibold text-white"
                            >
                                <IconSparkle className="w-3.5 h-3.5" />
                                Regenerate with all details
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeReadinessScore;
