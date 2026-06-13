import { useState, useMemo, useEffect } from 'react';
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

const IconX = ({ className = 'w-3.5 h-3.5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
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
        <svg viewBox="0 0 100 100" className="w-[132px] h-[132px] -rotate-90" aria-hidden="true">
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

    useEffect(() => {
        setLocal(value ?? '');
    }, [suggestion.key, value]);

    if (!open) {
        return (
            <li className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#141619] dark:text-[#E8ECF3] leading-snug">
                        {suggestion.label}
                    </p>
                    {suggestion.hint && (
                        <p className="text-[11.5px] text-[#3E424A] dark:text-[#a6adba] mt-0.5">{suggestion.hint}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#141619] dark:bg-white px-3 py-1.5 text-[12px] font-semibold text-white dark:text-[#141619] hover:opacity-90 transition-opacity"
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
                        className="cursor-pointer rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3 py-2 text-xs font-semibold text-white"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        className="cursor-pointer inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <IconX />
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
                        className="cursor-pointer rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        className="cursor-pointer inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <IconX />
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

    // Prefer live client score whenever the user has filled in any inline-fix fields,
    // so the ring updates immediately without waiting for re-generation.
    const hasExtras = Object.keys(extras).length > 0;
    const displayScore = hasExtras ? clientScore : (apiScore ?? clientScore);
    const color = scoreColor(displayScore);

    const allSuggestions = [...missing, ...ats];
    const unfilledSuggestions = allSuggestions.filter((s) => !extras[s.key] && !s.required);
    const requiredSuggestions = allSuggestions.filter((s) => s.required);

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
            {/* ── Ring + title side by side ── */}
            <div className="flex gap-5 items-start px-7 pt-7 pb-5">
                <div className="relative flex-shrink-0">
                    <ScoreRing score={displayScore} color={color} />
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        role="status"
                        aria-label={`Resume score: ${displayScore} out of 100`}
                    >
                        <span className={`text-[30px] leading-none font-bold tabular-nums ${color.text}`} aria-hidden="true">
                            {displayScore}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5" aria-hidden="true">of 100</span>
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-2">
                    <h3 className="font-suisse font-semibold text-[18px] text-[#141619] dark:text-[#E8ECF3]">
                        Resume readiness
                    </h3>
                    <p className="text-[13px] text-[#3E424A] dark:text-[#a6adba] mt-1.5 leading-relaxed">
                        {displayScore >= 80
                            ? "Strong resume — you're in the top tier of applicants."
                            : displayScore >= 60
                            ? 'Good start. Apply the fixes below to clear ATS filters confidently.'
                            : 'A few key details missing. Add them to get past ATS quickly.'}
                    </p>
                    {hasExtrasToRegenerate && (
                        <button
                            type="button"
                            onClick={onRegenerate}
                            className="cursor-pointer mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-3.5 py-2 text-xs font-semibold text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-colors"
                        >
                            <IconSparkle className="w-3.5 h-3.5" />
                            Regenerate with improvements
                        </button>
                    )}
                </div>
            </div>

            {/* ── Strong points ── */}
            {strong.length > 0 && (
                <div className="px-7 pb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3E424A] dark:text-[#a6adba] mb-3">
                        Strong points
                    </p>
                    <ul className="space-y-2">
                        {strong.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <IconCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span className="text-[13px] text-[#3E424A] dark:text-[#a6adba]">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Required missing ── */}
            {requiredSuggestions.length > 0 && (
                <div className="px-7 pb-4">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-4 py-3">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                            Required to generate
                        </p>
                        {requiredSuggestions.map((s) => (
                            <p key={s.key} className="text-sm text-amber-600 dark:text-amber-400">
                                · {s.label}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Improve your score ── */}
            {unfilledSuggestions.length > 0 && (
                <div className="px-7 py-5 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3E424A] dark:text-[#a6adba] mb-4">
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
                <div className="px-7 py-5 border-t border-gray-100 dark:border-white/5">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            All fields filled — looking great!
                        </p>
                        {hasExtrasToRegenerate && (
                            <button
                                type="button"
                                onClick={onRegenerate}
                                className="cursor-pointer mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-2 text-xs font-semibold text-white"
                            >
                                <IconSparkle className="w-3.5 h-3.5" />
                                Regenerate with all details
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeReadinessScore;
