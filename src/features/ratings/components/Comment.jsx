import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@shared-ui/Button';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import { rateCourse, getCourseRating } from '@services/api';
import toast from 'react-hot-toast';
import { parseApiError } from '@shared/api/error';

const STARS = [1, 2, 3, 4, 5];

function Comment({ courseId }) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [existingRating, setExistingRating] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const isRated = Boolean(existingRating);

    const isSubmitDisabled =
        loading ||
        loadingInitial ||
        !courseId ||
        rating === 0 ||
        comment.trim().length < 5 ||
        isRated;

    useEffect(() => {
        if (!courseId) return;

        let cancelled = false;

        (async () => {
            try {
                setLoadingInitial(true);
                const data = await getCourseRating(courseId);

                if (cancelled) return;

                if (data) {
                    setExistingRating(data);
                    setRating(data.value ?? 0);
                    setComment(data.comment ?? '');
                    setShowSuccessMessage(true);
                } else {
                    // no rating yet
                    setExistingRating(null);
                    setShowSuccessMessage(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Error loading course rating:', error);
                    // Usually no need to toast here, silently fail
                }
            } finally {
                if (!cancelled) setLoadingInitial(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const handleRateCourse = async () => {
        if (!courseId) {
            toast.error(t('ratings.comment.toasts.courseMissing'));
            return;
        }
        if (rating === 0) {
            toast.error(t('ratings.comment.toasts.ratingRequired'));
            return;
        }
        if (comment.trim().length < 5) {
            toast.error(t('ratings.comment.toasts.commentTooShort'));
            return;
        }

        try {
            setLoading(true);
            const payload = { value: rating, comment: comment.trim() };
            await rateCourse(courseId, payload);

            toast.success(t('ratings.comment.toasts.submitted'));

            // Treat this as "now rated"
            setExistingRating(payload);
            setShowSuccessMessage(true);
        } catch (error) {
            console.error('Error rating course:', error);
            toast.error(parseApiError(error, t('ratings.comment.toasts.submitError')).message);
        } finally {
            setLoading(false);
        }
    };

    const renderStar = (value) => {
        const active = hoverRating >= value || (!hoverRating && rating >= value);

        return (
            <button
                key={value}
                type="button"
                onClick={() => !isRated && setRating(value)}
                onMouseEnter={() => !isRated && setHoverRating(value)}
                onMouseLeave={() => !isRated && setHoverRating(0)}
                className={
                    'transition-transform hover:scale-110 focus:outline-none ' +
                    (isRated ? 'cursor-not-allowed opacity-70' : '')
                }
                aria-label={t('ratings.comment.starAria', { count: value })}
                disabled={isRated}
            >
                {active ? (
                    <IoStar className="text-amber-400 text-4xl md:text-5xl dark:text-amber-300" />
                ) : (
                    <IoStarOutline className="text-amber-400 text-4xl md:text-5xl dark:text-amber-300" />
                )}
            </button>
        );
    };

    if (showSuccessMessage) {
        return (
            <div className="border border-[#C5C9D1] p-6 md:p-10 rounded-xl mb-16 mt-6 bg-white dark:border-gray-700 dark:bg-[#222222]">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/30">
                            <svg
                                className="w-8 h-8 text-green-500 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    <h3 className="font-semibold text-xl md:text-2xl text-gray-800 mb-2 dark:text-gray-100">
                        {t('ratings.comment.success.title')}
                    </h3>

                    <p className="text-[#3E424A] text-sm md:text-base font-normal max-w-md mx-auto dark:text-gray-300">
                        {t('ratings.comment.success.description')}
                    </p>

                    {existingRating && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <span className="text-gray-600 dark:text-gray-300">{t('ratings.comment.success.yourRating')}</span>
                            <div className="flex gap-1">
                                {STARS.map((value) => (
                                    <span key={value}>
                                        {value <= existingRating.value ? (
                                            <IoStar className="text-amber-400 text-xl dark:text-amber-300" />
                                        ) : (
                                            <IoStarOutline className="text-amber-400 text-xl dark:text-amber-300" />
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 border border-[#C5C9D1] p-6 md:p-10 rounded-xl mb-16 mt-6 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Left side: title + stars */}
            <div className="flex flex-col items-center md:items-start gap-6 md:w-1/2">
                <div className="flex gap-2 md:gap-3">{STARS.map((value) => renderStar(value))}</div>

                <div className="px-4 md:px-0 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h3 className="font-semibold text-xl md:text-2xl text-gray-800 dark:text-gray-100">
                        {t('ratings.comment.form.title')}
                    </h3>
                    <p className="text-[#3E424A] text-sm md:text-base font-normal dark:text-gray-300">
                        {t('ratings.comment.form.descriptionLine1')}
                        <br className="hidden md:block" />
                        {t('ratings.comment.form.descriptionLine2')}
                    </p>
                </div>
            </div>

            {/* Right side: textarea + button */}
            <div className="flex flex-col items-start gap-4 md:w-1/2">
                <textarea
                    placeholder={t('ratings.comment.form.placeholder')}
                    className="w-full min-h-[120px] border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1e605e] focus:border-transparent placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-teal-500 dark:placeholder-gray-500"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex items-center justify-between w-full text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <span>{t('ratings.comment.form.minimum', { count: comment.trim().length })}</span>
                    {rating > 0 && (
                        <span className="font-medium text-amber-500 dark:text-amber-400">{t('ratings.comment.form.rating', { rating })}</span>
                    )}
                </div>

                <Button
                    variant="primary"
                    onClick={handleRateCourse}
                    disabled={isSubmitDisabled}
                >
                    {loading || loadingInitial ? t('ratings.comment.actions.sending') : t('ratings.comment.actions.submit')}
                </Button>
            </div>
        </div>
    );
}

export default Comment;
