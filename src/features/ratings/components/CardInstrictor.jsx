import PropTypes from 'prop-types';
import NoImage from '@assets/icons/noImage.svg';

const CardInstructor = ({
    avatarUrl,
    fullName,
    title,
    totalStudents,
    ratingAverage,
    ratingCount,
}) => {
    const safeRatingAverage = Math.max(0, Math.min(5, Number(ratingAverage) || 0));
    const safeRatingCount = ratingCount ?? 0;

    const getFillPercentage = (starIndex) => {
        if (safeRatingAverage >= starIndex) return 100;
        if (safeRatingAverage > starIndex - 1) return (safeRatingAverage - (starIndex - 1)) * 100;
        return 0;
    };

    const renderStar = (idx) => {
        const fill = getFillPercentage(idx);
        const gradientId = `instructor-star-${idx}-${Math.round(safeRatingAverage * 10)}`;
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
        <div className="bg-white text-[#141619] dark:bg-[#141619] dark:text-[#E8ECF3] rounded flex flex-col overflow-hidden p-3 border border-gray-200 dark:border-[#2A2E35]">
            <img
                src={avatarUrl || NoImage}
                onError={(e) => {
                    e.currentTarget.src = NoImage;
                }}
                alt={fullName}
                className="w-full h-96 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-4 mb-2">{fullName}</h3>
            <p className="text-sm text-gray-500 dark:text-[#a6adba]">{title}</p>
            <div className="flex mt-4 gap-2 items-center">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(renderStar)}
                    </div>
                </div>
                <span className="text-sm text-[#a6adba]">({safeRatingCount} студенттер)</span>
            </div>
        </div>
    );
};

export default CardInstructor;

CardInstructor.propTypes = {
    avatarUrl: PropTypes.string,
    fullName: PropTypes.string,
    position: PropTypes.string,
    totalStudents: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ratingAverage: PropTypes.number,
    ratingCount: PropTypes.number,
};
