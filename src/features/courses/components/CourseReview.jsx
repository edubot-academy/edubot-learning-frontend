import { useEffect, useMemo, useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { fetchCourseReviews } from '@features/ratings/api';

const RATING_LEVELS = [5, 4, 3, 2, 1];

const getReviewerName = (review = {}) =>
    review.userName || review.user?.fullName || review.user?.name || 'Студент';

const getInitials = (value = '') =>
    String(value)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'S';

const formatReviewDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Read-only course review summary that matches the provided design.
 * Shows total reviews, per-star counts with bars, and average rating with stars.
 */
const CourseReview = ({ courseId, ratingAverage = 0, ratingCount, ratingBreakdown, onViewAll }) => {
    const [reviewsData, setReviewsData] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (!courseId) return;

        let cancelled = false;
        setLoadingReviews(true);

        fetchCourseReviews(courseId, 1, 3)
            .then((data) => {
                if (!cancelled) setReviewsData(data);
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('Failed to load course reviews', error);
                    setReviewsData(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingReviews(false);
            });

        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const resolvedRatingAverage = Number(reviewsData?.ratingAverage ?? ratingAverage) || 0;
    const resolvedRatingCount = Number(reviewsData?.ratingCount ?? ratingCount) || 0;
    const resolvedRatingBreakdown = useMemo(
        () => reviewsData?.ratingBreakdown || ratingBreakdown || {},
        [reviewsData?.ratingBreakdown, ratingBreakdown]
    );
    const reviews = Array.isArray(reviewsData?.items) ? reviewsData.items : [];

    const countsByLevel = useMemo(() => {
        const map = {};
        let hasData = false;

        RATING_LEVELS.forEach((lvl) => {
            const val = Number(resolvedRatingBreakdown?.[lvl]) || 0;
            if (val > 0) hasData = true;
            map[lvl] = val;
        });

        // Fallback: if backend didn't send breakdown, allocate all ratings to the rounded average
        if (!hasData && resolvedRatingCount) {
            const bucket = Math.min(5, Math.max(1, Math.round(resolvedRatingAverage || 0)));
            map[bucket] = resolvedRatingCount;
        }

        return map;
    }, [resolvedRatingBreakdown, resolvedRatingCount, resolvedRatingAverage]);

    const totalRatings = useMemo(() => {
        const sum = RATING_LEVELS.reduce((acc, lvl) => acc + (countsByLevel[lvl] || 0), 0);
        return sum || resolvedRatingCount || 0;
    }, [countsByLevel, resolvedRatingCount]);

    return (
        <div className="w-full border border-gray-200 rounded-2xl bg-white p-6 sm:p-8 space-y-6 dark:border-gray-700 dark:bg-[#222222]">
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
                        {resolvedRatingAverage ? resolvedRatingAverage.toFixed(1) : '0.0'}
                    </p>
                    <div className="flex gap-3 text-[#FACC15]" aria-label={`Орточо рейтинг ${resolvedRatingAverage ? resolvedRatingAverage.toFixed(1) : '0.0'} ичинен 5`}>
                        <div style={{ display: 'flex', gap: '5px' }}>   
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    aria-hidden="true"
                                >
                                    {star <= resolvedRatingAverage ? (
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

            <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-[#E8ECF3]">Акыркы пикирлер</h3>
                    {loadingReviews ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Жүктөлүүдө...</span>
                    ) : null}
                </div>

                {reviews.length ? (
                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const reviewerName = getReviewerName(review);
                            const reviewDate = formatReviewDate(review.createdAt);

                            return (
                                <article
                                    key={review.id}
                                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#C2410C] dark:bg-orange-500/15 dark:text-orange-200">
                                            {getInitials(reviewerName)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <p className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                                    {reviewerName}
                                                </p>
                                                {reviewDate ? (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {reviewDate}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="mt-1 flex gap-1" aria-label={`${review.value || 0} ичинен 5`}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    star <= Number(review.value || 0) ? (
                                                        <AiFillStar key={star} color="#ffc107" size={16} />
                                                    ) : (
                                                        <AiOutlineStar key={star} color="#ccc" size={16} />
                                                    )
                                                ))}
                                            </div>
                                            {review.comment ? (
                                                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                    {review.comment}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : !loadingReviews ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Бул курс боюнча жазылган пикирлер азырынча көрсөтүлө элек.
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default CourseReview;
