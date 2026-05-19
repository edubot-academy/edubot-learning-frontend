import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCpu, FiLayers, FiMessageSquare, FiSettings } from 'react-icons/fi';

const AiSection = ({ aiCourses, totalCourses }) => {
    const { i18n, t } = useTranslation();
    const steps = [
        t('instructorDashboard.ai.steps.activate'),
        t('instructorDashboard.ai.steps.reviewPrompts'),
        t('instructorDashboard.ai.steps.verifyStudentChat'),
    ];

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.ai.eyebrow')}
                title={t('instructorDashboard.ai.title')}
                description={t('instructorDashboard.ai.description')}
                action={(
                    <Link
                        to="/instructor/courses"
                        className="dashboard-button-secondary"
                    >
                        <FiSettings className="h-4 w-4" />
                        {t('instructorDashboard.ai.actions.settings')}
                    </Link>
                )}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label={t('instructorDashboard.ai.metrics.activeCourses')}
                    value={aiCourses.length}
                    icon={FiCpu}
                    tone="green"
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.ai.metrics.totalCourses')}
                    value={totalCourses}
                    icon={FiLayers}
                />
                <DashboardMetricCard
                    label={t('instructorDashboard.ai.metrics.notReady')}
                    value={Math.max(totalCourses - aiCourses.length, 0)}
                    icon={FiMessageSquare}
                    tone="amber"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <DashboardInsetPanel
                    title={t('instructorDashboard.ai.enabledCourses.title')}
                    description={t('instructorDashboard.ai.enabledCourses.description')}
                >
                    <div className="mt-4 space-y-3">
                        {aiCourses.length ? (
                            aiCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="rounded-3xl border border-edubot-line/80 bg-white/90 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                                {course.title}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {course.updatedAt
                                                    ? t('instructorDashboard.ai.enabledCourses.updatedAt', {
                                                        date: new Date(course.updatedAt).toLocaleDateString(i18n.language || undefined),
                                                    })
                                                    : t('instructorDashboard.ai.enabledCourses.noUpdateInfo')}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/instructor/courses/edit/${course.id}`}
                                            className="dashboard-button-secondary !px-3"
                                        >
                                            {t('instructorDashboard.ai.actions.edit')}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                title={t('instructorDashboard.ai.empty.title')}
                                subtitle={t('instructorDashboard.ai.empty.subtitle')}
                                icon={<FiCpu className="h-8 w-8 text-edubot-orange" />}
                                action={(
                                    <Link
                                        to="/instructor/course/create"
                                        className="dashboard-button-primary"
                                    >
                                        {t('instructorDashboard.ai.actions.createCourse')}
                                    </Link>
                                )}
                            />
                        )}
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title={t('instructorDashboard.ai.stepsPanel.title')}
                    description={t('instructorDashboard.ai.stepsPanel.description')}
                >
                    <div className="mt-4 space-y-3">
                        {steps.map((step, index) => (
                            <div
                                key={step}
                                className="flex items-start gap-3 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-edubot-orange/10 text-sm font-semibold text-edubot-orange dark:bg-edubot-soft/10 dark:text-edubot-soft">
                                    {index + 1}
                                </span>
                                <p className="text-sm text-edubot-ink dark:text-slate-200">{step}</p>
                            </div>
                        ))}
                    </div>
                </DashboardInsetPanel>
            </div>
        </div>
    );
};

AiSection.propTypes = {
    aiCourses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ).isRequired,
    totalCourses: PropTypes.number.isRequired,
};

export default AiSection;
