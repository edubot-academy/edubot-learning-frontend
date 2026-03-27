import { Link } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBookOpen, FiCheckSquare, FiPlusCircle, FiUsers } from 'react-icons/fi';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
import { DashboardInsetPanel, DashboardSectionHeader } from '@components/ui/dashboard';
import MobileDashboardOverview from '../../../components/ui/MobileDashboardOverview';

const InstructorOverviewSection = ({
    user,
    profile,
    publishedCount,
    pendingCount,
    aiEnabledCount,
    analyticsLink,
}) => {
    const stats = [
        {
            label: 'Жарыяланган курстар',
            value: publishedCount,
            icon: FiBookOpen,
            tone: 'default',
        },
        {
            label: 'Каралуудагы курстар',
            value: pendingCount,
            icon: FiCheckSquare,
            tone: pendingCount > 0 ? 'amber' : 'default',
        },
        {
            label: 'AI ассистент иштетилген',
            value: aiEnabledCount,
            icon: FiActivity,
            tone: aiEnabledCount > 0 ? 'green' : 'default',
        },
        {
            label: 'Студенттер',
            value: profile?.numberOfStudents ?? '—',
            icon: FiUsers,
            tone: 'blue',
        },
    ];

    const quickActions = [
        {
            title: 'Курстарды башкаруу',
            description: 'Бар болгон курстарыңызды карап чыгып, мазмунун жана статусун жаңыртыңыз.',
            link: '/instructor/courses',
            buttonText: 'Курстар',
            icon: FiBookOpen,
        },
        {
            title: 'Жаңы курс түзүү',
            description: 'Сабак, бөлүм жана тапшырмалар менен жаңы курс жарыялоого даярдаңыз.',
            link: '/instructor/course/create',
            buttonText: 'Курс түзүү',
            icon: FiPlusCircle,
        },
        {
            title: 'Катталуулар',
            description: 'Студенттердин катталуусун, топторду жана катышуу агымын көзөмөлдөңүз.',
            link: '/instructor?tab=students',
            buttonText: 'Катталгандар',
            icon: FiUsers,
        },
        {
            title: 'Аналитика',
            description: 'Attendance, homework жана risk метрикаларын бир жерден көрүңүз.',
            link: analyticsLink,
            buttonText: 'Аналитика',
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
                    courses={[]} // Pass actual courses if available
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
                        eyebrow="Instructor overview"
                        title={user.fullName || user.email}
                        description="Профилди толтуруңуз, курстарды жаңыртыңыз жана студенттерге баалуулук тартуулаңыз."
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
                                                Бүгүнкү фокус
                                            </p>
                                            <h3 className="mt-1 text-2xl font-semibold md:text-3xl">
                                                Инструктор панели даяр
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75 md:text-[15px]">
                                        Курстарды, катталууларды жана аналитиканы бир жерден
                                        башкаруу үчүн негизги кыска жолдор ушул блокто.
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <Link
                                            to="/instructor/course/create"
                                            className="dashboard-button-primary inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5"
                                        >
                                            <FiPlusCircle className="h-4 w-4" />
                                            Жаңы курс түзүү
                                        </Link>
                                        <Link
                                            to={analyticsLink}
                                            className="dashboard-button-secondary inline-flex min-h-[44px] items-center gap-2 border-white/20 bg-white/10 px-4 py-2.5 text-white hover:border-white/40 hover:bg-white/15 hover:text-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                                        >
                                            <FiBarChart2 className="h-4 w-4" />
                                            Аналитиканы ачуу
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
                                title="Ыкчам аракеттер"
                                description="Күндөлүк инструктор жумуш агымдарына түз өтүңүз."
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

export default InstructorOverviewSection;
