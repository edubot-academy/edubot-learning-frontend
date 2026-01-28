import { useEffect, useState } from 'react';
import Button from '@shared/ui/Button';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import { rateCourse, getCourseRating } from '@services/api';
import toast from 'react-hot-toast';

const STARS = [1, 2, 3, 4, 5];

function Comment({ courseId }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [existingRating, setExistingRating] = useState(null);

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
                } else {
                    setExistingRating(null);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Error loading course rating:', error);
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
            toast.error('Курс табылган жок.');
            return;
        }
        if (rating === 0) {
            toast.error('Алды менен баа коюңуз.');
            return;
        }
        if (comment.trim().length < 5) {
            toast.error('Сын-пикир кеминде 5 символ болушу керек.');
            return;
        }

        try {
            setLoading(true);
            const payload = { value: rating, comment: comment.trim() };
            const response = await rateCourse(courseId, payload);

            toast.success('Сын-пикир ийгиликтүү жөнөтүлдү.');
            setExistingRating(payload);
        } catch (error) {
            console.error('Error rating course:', error);
            toast.error(
                error?.response?.data?.message ||
                    'Сын-пикир жөнөтүүдө ката кетти. Кайра аракет кылыңыз.'
            );
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
                aria-label={`${value} жылдыз`}
                disabled={isRated}
            >
                {active ? (
                    <IoStar className="text-amber-400 dark:text-amber-500 text-4xl md:text-5xl" />
                ) : (
                    <IoStarOutline className="text-amber-400 dark:text-amber-500 text-4xl md:text-5xl" />
                )}
            </button>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 border border-[#C5C9D1] dark:border-gray-700 p-6 md:p-10 rounded-xl mb-16 mt-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Left side: title + stars */}
            <div className="flex flex-col items-center md:items-start gap-6 md:w-1/2">
                <div className="flex gap-2 md:gap-3">{STARS.map((value) => renderStar(value))}</div>

                <div className="px-4 md:px-0 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h3 className="font-semibold text-xl md:text-2xl dark:text-gray-100">
                        Курс кандай өттү? Сын-пикир калтырыңыз
                    </h3>
                    <p className="text-sm md:text-base font-normal text-gray-700 dark:text-gray-300">
                        Сиздин пикириңиз башка студенттерге курс тандоодо жардам берет.
                        <br className="hidden md:block" />
                        Сиздин пикир биз үчүн да абдан баалуу!
                    </p>

                    {isRated && (
                        <p className="mt-1 text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                            Рахмат! Сиз бул курска буга чейин сын-пикир калтырдыңыз.
                        </p>
                    )}
                </div>
            </div>

            {/* Right side: textarea + button */}
            <div className="flex flex-col items-start gap-4 md:w-1/2">
                <textarea
                    placeholder="Сиздин тажрыйбаңыз тууралуу жазыңыз..."
                    className={
                        'w-full min-h-[120px] border border-gray-300 dark:border-gray-600 ' +
                        'rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 text-sm md:text-base ' +
                        'resize-none bg-white dark:bg-gray-800 ' +
                        'focus:outline-none focus:ring-2 focus:ring-[#1e605e] dark:focus:ring-emerald-500 ' +
                        'focus:border-transparent transition-colors duration-200 ' +
                        (isRated ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : '')
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isRated}
                />

                <div className="flex items-center justify-between w-full text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <span>Кеминде: 5 символ. Сиз жаздыңыз: {comment.trim().length}.</span>
                    {rating > 0 && (
                        <span className="font-medium text-amber-500 dark:text-amber-400">
                            Баа: {rating} / 5
                        </span>
                    )}
                </div>

                {!isRated && (
                    <Button
                        variant="primary"
                        onClick={handleRateCourse}
                        disabled={isSubmitDisabled}
                    >
                        {loading || loadingInitial ? 'Жөнөтүлүүдө...' : 'Жиберүү'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default Comment;