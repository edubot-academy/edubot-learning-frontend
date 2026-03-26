import InstructorStatCard from './InstructorStatCard.jsx';
import InstructorQuickActionCard from './InstructorQuickActionCard.jsx';
import NotificationsWidget from '@features/notifications/components/NotificationsWidget';
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
        { label: 'Жарыяланган курстар', value: publishedCount },
        { label: 'Каралуудагы курстар', value: pendingCount },
        { label: 'AI ассистент иштетилген', value: aiEnabledCount },
        { label: 'Студенттер', value: profile?.numberOfStudents ?? '—' },
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
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-edubot-orange rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">👋</span>
                        </div>
                        <p className="text-sm font-medium text-edubot-orange">Кош келиңиз</p>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {user.fullName || user.email}
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Профилди толтуруңуз, курстарды жаңыртыңыз жана студенттерге баалуулук
                        тартуулаңыз.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <InstructorStatCard key={stat.label} label={stat.label} value={stat.value} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InstructorQuickActionCard
                        title="Курстарды Башкаруу"
                        description="Бар болгон курстарыңызды көрүңүз, өзгөртүңүз же өчүрүңүз."
                        link="/instructor/courses"
                        buttonText="Курстар"
                    />
                    <InstructorQuickActionCard
                        title="Жаңы Курс Түзүү"
                        description="Сабак жана бөлүмдөрү менен жаңы курс кошуңуз."
                        link="/instructor/course/create"
                        buttonText="Курс түзүү"
                        accent="green"
                    />
                    <InstructorQuickActionCard
                        title="Катталуулар"
                        description="Студенттердин катталуусун көзөмөлдөңүз."
                        link="/instructor/enrollments"
                        buttonText="Катталгандар"
                        accent="amber"
                    />
                    <InstructorQuickActionCard
                        title="Аналитика"
                        description="Attendance, homework жана risk метрикаларын көрүңүз."
                        link={analyticsLink}
                        buttonText="Аналитика"
                        accent="blue"
                    />
                </div>

                <NotificationsWidget />
            </div>
        </>
    );
};

export default InstructorOverviewSection;
