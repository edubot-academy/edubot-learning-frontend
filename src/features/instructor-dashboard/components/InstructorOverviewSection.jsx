import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FiActivity, FiBarChart2, FiBookOpen, FiCheckSquare, FiPlusCircle, FiUsers } from 'react-icons/fi';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import { DashboardInsetPanel, DashboardSectionHeader } from '@components/ui/dashboard';
import MobileDashboardOverview from '../../../components/ui/MobileDashboardOverview';
import { getDashboardPath } from '@shared/utils/navigation';

const InstructorOverviewSection = ({
    user,
    profile,
    courses,
    studentCount,
    publishedCount,
    pendingCount,
    aiEnabledCount,
    analyticsLink,
}) => {
    const { t } = useTranslation();
    const stats = [
        {
            label: t('instructorDashboard.overview.stats.publishedCourses'),
            value: publishedCount,
            icon: FiBookOpen,
            tone: 'default',
        },
        {
            label: t('instructorDashboard.overview.stats.pendingCourses'),
            value: pendingCount,
            icon: FiCheckSquare,
            tone: pendingCount > 0 ? 'amber' : 'default',
        },
        {
            label: t('instructorDashboard.overview.stats.aiEnabled'),
            value: aiEnabledCount,
            icon: FiActivity,
            tone: aiEnabledCount > 0 ? 'green' : 'default',
        },
        {
            label: t('instructorDashboard.overview.stats.enrollments'),
            value: studentCount,
            icon: FiUsers,
            tone: 'blue',
        },
    ];

    const quickActions = [
        {
            title: t('instructorDashboard.overview.quickActions.manageCourses.title'),
            description: t('instructorDashboard.overview.quickActions.manageCourses.description'),
            link: '/instructor/courses',
            buttonText: t('instructorDashboard.overview.quickActions.manageCourses.button'),
            icon: FiBookOpen,
        },
        {
            title: t('instructorDashboard.overview.quickActions.createCourse.title'),
            description: t('instructorDashboard.overview.quickActions.createCourse.description'),
            link: '/instructor/course/create',
            buttonText: t('instructorDashboard.overview.quickActions.createCourse.button'),
            icon: FiPlusCircle,
        },
        {
            title: t('instructorDashboard.overview.quickActions.enrollments.title'),
            description: t('instructorDashboard.overview.quickActions.enrollments.description'),
            link: getDashboardPath('instructor', 'students'),
            buttonText: t('instructorDashboard.overview.quickActions.enrollments.button'),
            icon: FiUsers,
        },
        {
            title: t('instructorDashboard.overview.quickActions.analytics.title'),
            description: t('instructorDashboard.overview.quickActions.analytics.description'),
            link: analyticsLink,
            buttonText: t('instructorDashboard.overview.quickActions.analytics.button'),
            icon: FiBarChart2,
        },
    ];

    return (
        <>
            {/* Mobile Overview */}
            <div className="md:hidden">
                <MobileDashboardOverview
                    user={user}
                    profile={profile}
                    courses={courses}
                    studentCount={studentCount}
                    publishedCount={publishedCount}
                    pendingCount={pendingCount}
                    aiEnabledCount={aiEnabledCount}
                    analyticsLink={analyticsLink}
                />
            </div>

            {/* Desktop Overview */}
            <div className="hidden md:block">
                <div className="dashboard-panel overflow-hidden">
                    <DashboardSectionHeader
                        eyebrow={t('instructorDashboard.overview.header.eyebrow')}
                        title={user.fullName || user.email}
                        description={t('instructorDashboard.overview.header.description')}
                    />

                    <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                        <div className="space-y-6">
                            <div className="rounded-panel border border-edubot-line/70 bg-gradient-to-br from-edubot-dark via-[#17305d] to-slate-900 px-6 py-6 text-white shadow-edubot-card">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
                                            <FiActivity className="h-5 w-5 text-edubot-soft" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-soft/80">
                                                {t('instructorDashboard.overview.focus.eyebrow')}
                                            </p>
                                            <h3 className="mt-1 text-2xl font-semibold md:text-3xl">
                                                {t('instructorDashboard.overview.focus.title')}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75 md:text-[15px]">
                                        {t('instructorDashboard.overview.focus.description')}
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <Link
                                            to="/instructor/course/create"
                                            className="dashboard-button-primary inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5"
                                        >
                                            <FiPlusCircle className="h-4 w-4" />
                                            {t('instructorDashboard.overview.actions.createCourse')}
                                        </Link>
                                        <Link
                                            to={analyticsLink}
                                            className="dashboard-button-secondary inline-flex min-h-[44px] items-center gap-2 border-white/20 bg-white/10 px-4 py-2.5 text-white hover:border-white/40 hover:bg-white/15 hover:text-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                                        >
                                            <FiBarChart2 className="h-4 w-4" />
                                            {t('instructorDashboard.overview.actions.openAnalytics')}
                                        </Link>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                                        {stats.map((stat) => {
                                            const Icon = stat.icon;

                                            return (
                                                <div
                                                    key={stat.label}
                                                    className="group relative min-w-0 overflow-hidden rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/12"
                                                >
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-edubot-soft/10 opacity-80" />
                                                    <div className="relative flex min-w-0 items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="max-w-[12ch] text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-white/68 sm:max-w-none">
                                                                {stat.label}
                                                            </p>
                                                            <div className="mt-3 text-[1.95rem] font-semibold leading-none text-white">
                                                                {stat.value}
                                                            </div>
                                                        </div>
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white/90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <DashboardInsetPanel
                                title={t('instructorDashboard.overview.quickActionsPanel.title')}
                                description={t('instructorDashboard.overview.quickActionsPanel.description')}
                            >
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;

                                        return (
                                            <div
                                                key={action.title}
                                                className="group rounded-panel border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-900/80"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 dark:bg-slate-800 dark:text-edubot-soft">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">
                                                            {action.title}
                                                        </h3>
                                                        <p className="mt-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5">
                                                    <Link
                                                        to={action.link}
                                                        className="dashboard-button-primary inline-flex items-center gap-2"
                                                    >
                                                        {action.buttonText}
                                                        <span aria-hidden="true">→</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DashboardInsetPanel>
                        </div>

                        <NotificationsWidget />
                    </div>
                </div>
            </div>
        </>
    );
};

InstructorOverviewSection.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string,
        fullName: PropTypes.string,
        email: PropTypes.string,
    }),
    profile: PropTypes.shape({
        title: PropTypes.string,
    }),
    courses: PropTypes.arrayOf(PropTypes.object),
    studentCount: PropTypes.number,
    publishedCount: PropTypes.number,
    pendingCount: PropTypes.number,
    aiEnabledCount: PropTypes.number,
    analyticsLink: PropTypes.string.isRequired,
};

InstructorOverviewSection.defaultProps = {
    user: {},
    profile: {},
    courses: [],
    studentCount: 0,
    publishedCount: 0,
    pendingCount: 0,
    aiEnabledCount: 0,
};

export default InstructorOverviewSection;
