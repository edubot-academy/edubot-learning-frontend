import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiGlobe } from 'react-icons/fi';

const OfferingCard = ({ offering, onEdit, onEnroll }) => {
    const { i18n, t } = useTranslation();
    const title = offering.title || t('instructorDashboard.offerings.card.fallbackTitle', {
        course: offering.course?.title || t('instructorDashboard.offerings.fallbacks.course'),
    });
    const start = offering.startAt
        ? new Date(offering.startAt).toLocaleString(i18n.language || undefined)
        : t('instructorDashboard.offerings.fallbacks.unknown');
    const end = offering.endAt ? new Date(offering.endAt).toLocaleString(i18n.language || undefined) : null;
    const modality = offering.modality || 'ONLINE';
    const modalityLabel = t(`instructorDashboard.offerings.modalities.${modality.toLowerCase()}`, {
        defaultValue: t('instructorDashboard.offerings.modalities.online'),
    });
    const capacity = offering.capacity
        ? t('instructorDashboard.offerings.card.capacity', { count: offering.capacity })
        : t('instructorDashboard.offerings.card.unlimitedCapacity');
    const visibility = offering.visibility || 'PRIVATE';
    const companyName = offering.company?.name;
    const status = offering.status || 'DRAFT';
    const statusLabel = t(`instructorDashboard.offerings.statuses.${status.toLowerCase()}`, {
        defaultValue: status,
    });

    const statusStyles = {
        ACTIVE: 'bg-green-100 text-green-700',
        DRAFT: 'bg-gray-200 text-gray-700',
        COMPLETED: 'bg-blue-100 text-blue-700',
        ARCHIVED: 'bg-orange-100 text-orange-700',
    };

    return (
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        {t('instructorDashboard.offerings.card.course', {
                            course: offering.course?.title || t('instructorDashboard.offerings.fallbacks.course'),
                        })}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${visibility === 'PUBLIC'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 dark:text-[#a6adba]'
                        }`}
                >
                    {visibility === 'PUBLIC'
                        ? t('instructorDashboard.offerings.visibility.public')
                        : t('instructorDashboard.offerings.visibility.private')}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-[#a6adba]">
                <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    <span>{start}</span>
                    {end && <span className="text-gray-400">— {end}</span>}
                </div>

                <div className="flex items-center gap-2">
                    <FiGlobe className="text-gray-400" />
                    <span>{modalityLabel}</span>
                </div>

                <div>
                    <p>{capacity}</p>
                    {companyName && (
                        <p className="text-xs text-gray-500 dark:text-[#a6adba]">{companyName}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
                <span
                    className={`px-3 py-1 rounded-full font-semibold ${statusStyles[status] || 'bg-gray-200 text-gray-700'
                        }`}
                >
                    {statusLabel}
                </span>
                {offering.isFeatured && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        {t('instructorDashboard.offerings.card.featured')}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-[#a6adba]">
                <span>
                    {t('instructorDashboard.offerings.card.enrolled', {
                        count: offering.enrolledCount ?? 0,
                    })}
                </span>
                {offering.seatsRemaining != null && (
                    <span>
                        {t('instructorDashboard.offerings.card.seatsRemaining', {
                            count: offering.seatsRemaining,
                        })}
                    </span>
                )}
            </div>

            {offering.scheduleBlocks?.length ? (
                <div className="text-sm text-gray-600 dark:text-[#a6adba]">
                    <p className="font-semibold text-gray-700 mb-1">
                        {t('instructorDashboard.offerings.card.schedule')}
                    </p>
                    <ul className="space-y-1">
                        {offering.scheduleBlocks.map((block, idx) => (
                            <li key={idx}>
                                {block.day}: {block.startTime} – {block.endTime}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : offering.scheduleNote ? (
                <p className="text-sm text-gray-600 dark:text-[#a6adba]">
                    {t('instructorDashboard.offerings.card.note', {
                        note: offering.scheduleNote,
                    })}
                </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
                <Link
                    to={`/instructor/courses/edit/${offering.course.id}`}
                    className="px-4 py-2 rounded-full border text-sm"
                >
                    {t('instructorDashboard.offerings.card.editCourse')}
                </Link>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm"
                    onClick={() => onEdit(offering)}
                >
                    {t('instructorDashboard.offerings.card.editOffering')}
                </button>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm text-green-700"
                    onClick={() => onEnroll(offering)}
                >
                    {t('instructorDashboard.offerings.card.addStudent')}
                </button>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                >
                    {t('instructorDashboard.offerings.card.copyLink')}
                </button>
            </div>
        </div>
    );
};

OfferingCard.propTypes = {
    offering: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        startAt: PropTypes.string,
        endAt: PropTypes.string,
        modality: PropTypes.string,
        capacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        visibility: PropTypes.string,
        status: PropTypes.string,
        isFeatured: PropTypes.bool,
        enrolledCount: PropTypes.number,
        seatsRemaining: PropTypes.number,
        scheduleBlocks: PropTypes.arrayOf(PropTypes.object),
        scheduleNote: PropTypes.string,
        course: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
        }),
        company: PropTypes.shape({
            name: PropTypes.string,
        }),
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onEnroll: PropTypes.func.isRequired,
};

export default OfferingCard;
