import { Link } from 'react-router-dom';
import { FiCalendar, FiGlobe } from 'react-icons/fi';

const OfferingCard = ({ offering, onEdit, onEnroll }) => {
    const title = offering.title || `${offering.course.title} Offering`;
    const start = offering.startAt ? new Date(offering.startAt).toLocaleString() : 'Белгисиз';
    const end = offering.endAt ? new Date(offering.endAt).toLocaleString() : null;
    const modality = offering.modality || 'ONLINE';
    const modalityLabel =
        modality === 'OFFLINE' ? 'Офлайн' : modality === 'HYBRID' ? 'Гибрид' : 'Онлайн';
    const capacity = offering.capacity ? `${offering.capacity} орун` : 'Орун чектелбеген';
    const visibility = offering.visibility || 'PRIVATE';
    const companyName = offering.company?.name;
    const status = offering.status || 'DRAFT';

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
                        Курс: {offering.course.title}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${visibility === 'PUBLIC'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 dark:text-[#a6adba]'
                        }`}
                >
                    {visibility === 'PUBLIC' ? 'Публичный' : 'Жабык'}
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
                    {status}
                </span>
                {offering.isFeatured && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        Featured
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-[#a6adba]">
                <span>Катталган: {offering.enrolledCount ?? 0}</span>
                {offering.seatsRemaining != null && <span>Калган орун: {offering.seatsRemaining}</span>}
            </div>

            {offering.scheduleBlocks?.length ? (
                <div className="text-sm text-gray-600 dark:text-[#a6adba]">
                    <p className="font-semibold text-gray-700 mb-1">Жүгүртмө:</p>
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
                    Белгилей кетүү: {offering.scheduleNote}
                </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
                <Link
                    to={`/instructor/courses/edit/${offering.course.id}`}
                    className="px-4 py-2 rounded-full border text-sm"
                >
                    Курсту өзгөртүү
                </Link>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm"
                    onClick={() => onEdit(offering)}
                >
                    Offeringди өзгөртүү
                </button>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full border text-sm text-green-700"
                    onClick={() => onEnroll(offering)}
                >
                    Студент кошуу
                </button>

                <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
                >
                    Шилтеме көчүрүү
                </button>
            </div>
        </div>
    );
};

export default OfferingCard;
