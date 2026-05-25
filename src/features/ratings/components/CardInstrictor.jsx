import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import NoImage from '@assets/icons/noImage.svg';

const CardInstructor = ({
    avatarUrl,
    fullName,
    title,
    position,
    specialty,
    totalStudents,
    studentsCount,
    ratingAverage,
    ratingCount,
}) => {
    const { t } = useTranslation();
    const instructorName = String(fullName || t('ratings.card.fallbackInstructor'));
    const safeRatingAverage = Math.max(0, Math.min(5, Number(ratingAverage) || 0));
    const safeRatingCount = Number(ratingCount) || 0;
    const safeStudentCount = Number(totalStudents ?? studentsCount) || 0;
    const displayTitle = title || position || specialty || t('ratings.card.fallbackTitle');
    const displaySpecialty = specialty && specialty !== displayTitle ? specialty : t('ratings.card.fallbackSpecialty');
    const ratingLabel = safeRatingAverage ? `${safeRatingAverage.toFixed(1)} / 5` : t('ratings.card.newRating');
    const normalizedName = instructorName
        .toLowerCase()
        .replace(/[^\p{L}0-9]+/gu, '-')
        .replace(/^-|-$/g, '') || 'instructor';

    const getFillPercentage = (starIndex) => {
        if (safeRatingAverage >= starIndex) return 100;
        if (safeRatingAverage > starIndex - 1) return (safeRatingAverage - (starIndex - 1)) * 100;
        return 0;
    };

    const renderStar = (idx) => {
        const fill = getFillPercentage(idx);
        const gradientId = `instructor-star-${normalizedName}-${idx}-${Math.round(safeRatingAverage * 10)}`;
        return (
            <svg
                key={idx}
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
                aria-hidden="true"
                focusable="false"
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
        <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white p-3 text-[#141619] shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-[#2A2E35] dark:bg-[#141619] dark:text-[#E8ECF3]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-gray-100 dark:bg-gray-900">
                <img
                    src={avatarUrl || NoImage}
                    onError={(e) => {
                        e.currentTarget.src = NoImage;
                    }}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-lg"
                    loading="lazy"
                    decoding="async"
                />
                <img
                    src={avatarUrl || NoImage}
                    onError={(e) => {
                        e.currentTarget.src = NoImage;
                    }}
                    alt={instructorName}
                    className="relative z-[1] h-full w-full object-contain"
                    width="480"
                    height="360"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute left-3 top-3 z-[2] rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm dark:bg-gray-950/85 dark:text-white">
                    {t('ratings.card.topInstructor')}
                </div>
            </div>
            <div className="flex flex-1 flex-col px-1 pb-2 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
                    {displaySpecialty}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-tight">{instructorName}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-[#a6adba]">{displayTitle}</p>

                <div className="mt-4 flex items-center gap-2" aria-label={t('ratings.card.ratingAria', { rating: ratingLabel })}>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(renderStar)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{ratingLabel}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{t('ratings.card.reviews')}</span>
                        <strong className="mt-1 block text-gray-900 dark:text-white">{safeRatingCount}</strong>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{t('ratings.card.students')}</span>
                        <strong className="mt-1 block text-gray-900 dark:text-white">{safeStudentCount}</strong>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default CardInstructor;

CardInstructor.propTypes = {
    avatarUrl: PropTypes.string,
    fullName: PropTypes.string,
    title: PropTypes.string,
    position: PropTypes.string,
    specialty: PropTypes.string,
    totalStudents: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    studentsCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ratingAverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ratingCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
