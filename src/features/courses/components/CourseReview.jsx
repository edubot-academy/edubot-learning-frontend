import React, { useMemo } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

/**
 * Read-only course review summary that matches the provided design.
 * Shows total reviews, per-star counts with bars, and average rating with stars.
 */
const CourseReview = ({ ratingAverage = 0, ratingCount, ratingBreakdown = {}, onViewAll }) => {
    const levels = [5, 4, 3, 2, 1];

    const countsByLevel = useMemo(() => {
        const map = {};
        let hasData = false;

        levels.forEach((lvl) => {
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
        const sum = levels.reduce((acc, lvl) => acc + (countsByLevel[lvl] || 0), 0);
        return sum || ratingCount || 0;
    }, [countsByLevel, levels, ratingCount]);

    const getFillPercentage = (starIndex) => {
        const current = Math.max(0, Math.min(5, ratingAverage));
        if (current >= starIndex) return 100;
        if (current > starIndex - 1) return (current - (starIndex - 1)) * 100;
        return 0;
    };

    const renderStar = (idx) => {
        const fill = getFillPercentage(idx);
        const gradientId = `star-${idx}-${Math.round(ratingAverage * 10)}`;
        return (
            <svg
                key={idx}
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset={`${fill}%`} stopColor="#F59E0B" />
                        <stop offset={`${fill}%`} stopColor="white" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 2l1.8 8.4 8.2.2-6.5 5 2.5 7.4-6-4.8-6 4.8 2.5-7.4-6.5-5 8.2-.2L12 2z"
                    fill={`url(#${gradientId})`}
                />
            </svg>
        );
    };

    return (
        <div className="w-full border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900 dark:text-[#E8ECF3]">({totalRatings || 0}) пикир</h2>
                <button
                    type="button"
                    className="text-sm hover:text-[#7B818C]"
                    onClick={onViewAll}
                >
                    баардыгын көрүү
                </button>
            </div>

            <div className="space-y-5">
                <div className="space-y-3">
                    {levels.map((level) => {
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
                    <div className="flex gap-3 text-[#FACC15]">
                        <div style={{ display: 'flex', gap: '5px' }}>   
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ cursor: 'pointer' }}
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
