import { Link } from 'react-router-dom';

const InstructorEmptyState = ({ title, description, actionLabel, actionLink }) => (
    <div className="flex flex-col items-center text-center gap-3 border border-dashed border-gray-300 rounded-2xl p-8">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-gray-500 dark:text-[#a6adba]">{description}</p>
        {actionLabel && actionLink && (
            <Link to={actionLink} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
                {actionLabel}
            </Link>
        )}
    </div>
);

export default InstructorEmptyState;
