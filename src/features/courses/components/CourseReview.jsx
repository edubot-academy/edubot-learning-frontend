import { useMemo } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const RATING_LEVELS = [5, 4, 3, 2, 1];

/**
 * Read-only course review summary that matches the provided design.
 * Shows total reviews, per-star counts with bars, and average rating with stars.
 */
const CourseReview = ({ ratingAverage = 0, ratingCount, ratingBreakdown = {}, onViewAll }) => {
    const countsByLevel = useMemo(() => {
        const map = {};
        let hasData = false;

        RATING_LEVELS.forEach((lvl) => {
            const val = Number(ratingBreakdown?.[lvl]) || 0;
            if (val > 0) hasData = true;
            map[lvl] = val;
        });

        // Fallback: if backend didn't send breakdown, allocate all ratings to the rounded average
        if (!hasData && ratingCount) {
            const bucket = Math.min(5, Math.max(1, Math.round(ratingAverage || 0)));
            map[bucket] = ratingCount;
        }

        return map;
    }, [ratingBreakdown, ratingCount, ratingAverage]);

    const totalRatings = useMemo(() => {
        const sum = RATING_LEVELS.reduce((acc, lvl) => acc + (countsByLevel[lvl] || 0), 0);
        return sum || ratingCount || 0;
    }, [countsByLevel, ratingCount]);

    return (
        <div className="w-full border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-[#E8ECF3]">({totalRatings || 0}) пикир</h2>
                {onViewAll && (
                    <button
                        type="button"
                        className="rounded-md px-2 py-1 text-sm hover:text-[#7B818C] focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onClick={onViewAll}
                    >
                        Баардыгын көрүү
                    </button>
                )}
            </div>

            <div className="space-y-5">
                <div className="space-y-3">
                    {RATING_LEVELS.map((level) => {
                        const count = countsByLevel[level] || 0;
                        const percent = totalRatings
                            ? Math.min(100, (count / totalRatings) * 100)
                            : 0;
                        return (
                            <div
                                key={level}
                                className="flex items-center gap-4 text-base"
                            >
                                <span className="min-w-[110px] whitespace-nowrap">
                                    {level} жылдызча
                                </span>
                                <div className="flex-1 h-3 bg-[#D9D9D9] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#E65A00] rounded-full transition-all"
                                        style={{ width: `${percent}%` }}
                                        role="progressbar"
                                        aria-label={`${level} жылдызча рейтинги`}
                                        aria-valuenow={Math.round(percent)}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    />
                                </div>
                                <span className="w-10 text-right font-semibold">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-start gap-2">
                    <p className="text-[48px] font-black text-[#C2410C] leading-none">
                        {ratingAverage ? ratingAverage.toFixed(1) : '0.0'}
                    </p>
                    <div className="flex gap-3 text-[#FACC15]" aria-label={`Орточо рейтинг ${ratingAverage ? ratingAverage.toFixed(1) : '0.0'} ичинен 5`}>
                        <div style={{ display: 'flex', gap: '5px' }}>   
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    aria-hidden="true"
                                >
                                    {star <= ratingAverage ? (
                                        <AiFillStar color="#ffc107" size={25} />
                                    ) : (
                                        <AiOutlineStar color="#ccc" size={25} />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseReview;
