import { Link } from 'react-router-dom';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCpu, FiLayers, FiMessageSquare, FiSettings } from 'react-icons/fi';

const AiSection = ({ aiCourses, totalCourses }) => (
    <div className="space-y-6">
        <DashboardSectionHeader
            eyebrow="AI workspace"
            title="EDU AI ассистент"
            description="AI жардамчысы кайсы курстарда иштеп жатканын, канча курс даяр экенин жана кийинки жөндөө кадамдарын ушул жерден көрүңүз."
            action={(
                <Link
                    to="/instructor/courses"
                    className="dashboard-button-secondary"
                >
                    <FiSettings className="h-4 w-4" />
                    AI жөндөөлөрү
                </Link>
            )}
        />

        <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetricCard
                label="AI активдүү курстар"
                value={aiCourses.length}
                icon={FiCpu}
                tone="green"
            />
            <DashboardMetricCard
                label="Жалпы курстар"
                value={totalCourses}
                icon={FiLayers}
            />
            <DashboardMetricCard
                label="AI даяр эмес"
                value={Math.max(totalCourses - aiCourses.length, 0)}
                icon={FiMessageSquare}
                tone="amber"
            />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <DashboardInsetPanel
                title="AI иштетилген курстар"
                description="AI ассистенти активдүү курстарды түзөтүүгө же толуктоого бул тизмеден өтүңүз."
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
                                                ? `Жаңыртылды: ${new Date(course.updatedAt).toLocaleDateString()}`
                                                : 'Жаңыртуу маалыматы жок'}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/instructor/courses/edit/${course.id}`}
                                        className="dashboard-button-secondary !px-3"
                                    >
                                        Өзгөртүү
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            title="AI ассистенти иштетилген курс жок"
                            subtitle="Курс редакторунда AI жардамчыны активдештиргенден кийин ушул жерде активдүү курстар чыгат."
                            icon={<FiCpu className="h-8 w-8 text-edubot-orange" />}
                            action={(
                                <Link
                                    to="/instructor/course/create"
                                    className="dashboard-button-primary"
                                >
                                    Курс түзүү
                                </Link>
                            )}
                        />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Колдонуу кадамдары"
                description="AI ассистентти жөндөөнүн негизги агымы."
            >
                <div className="mt-4 space-y-3">
                    {[
                        'Курс редакторунда AI ассистентти активдештириңиз.',
                        'Ассистент сценарийлерин жана промпттарын текшериңиз.',
                        'Студент чатында AI жардамчынын жеткиликтүүлүгүн текшериңиз.',
                    ].map((step, index) => (
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

export default AiSection;
