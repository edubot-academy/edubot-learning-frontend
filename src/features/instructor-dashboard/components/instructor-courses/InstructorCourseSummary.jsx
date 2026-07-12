import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const InstructorCourseSummary = ({
    lastLoadedLabel,
    loading,
    onRefresh,
    workflowCounts,
}) => {
    const { t } = useTranslation();

    return (
        <section
            aria-label={t('instructorDashboard.coursesPage.workflowSummaryLabel')}
            className="mb-6 grid gap-3 md:grid-cols-3"
        >
            <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141619]">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('instructorDashboard.coursesPage.workflows.video')}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {workflowCounts.video}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {t('instructorDashboard.coursesPage.workflowCards.videoDescription')}
                </p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141619]">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('instructorDashboard.coursesPage.workflows.delivery')}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {workflowCounts.delivery}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {t('instructorDashboard.coursesPage.workflowCards.deliveryDescription')}
                </p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141619]">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('instructorDashboard.coursesPage.workflowCards.lastUpdated')}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? t('common.loading') : lastLoadedLabel}
                </p>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="mt-2 rounded border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    {t('instructorDashboard.coursesPage.actions.refresh')}
                </button>
            </div>
        </section>
    );
};

InstructorCourseSummary.propTypes = {
    lastLoadedLabel: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    onRefresh: PropTypes.func.isRequired,
    workflowCounts: PropTypes.shape({
        delivery: PropTypes.number,
        video: PropTypes.number,
    }).isRequired,
};

export default InstructorCourseSummary;
