/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBookOpen, FiCheckCircle, FiClock, FiEye, FiUser, FiXCircle } from 'react-icons/fi';

const getCourseTypeLabel = (courseType) => {
    if (courseType === 'offline') return 'Оффлайн';
    if (courseType === 'online_live') return 'Онлайн түз эфир';
    return 'Видео';
};

const AdminPendingCoursesTab = ({ pendingCourses, onApprove, onReject }) => {
    const deliveryCount = pendingCourses.filter(
        (course) => course.courseType === 'offline' || course.courseType === 'online_live'
    ).length;
    const paidCount = pendingCourses.filter((course) => Number(course.price || 0) > 0).length;
    const newestDate = pendingCourses[0]?.createdAt
        ? new Date(pendingCourses[0].createdAt).toLocaleDateString()
        : '—';

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Approval queue"
                title="Каралуудагы курстар"
                description="Инструкторлор жөнөткөн жаңы курстарды ушул жерден текшерип, бекитиңиз же четке кагыңыз."
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label="Күтүүдөгү курстар"
                    value={pendingCourses.length}
                    icon={FiClock}
                    tone={pendingCourses.length ? 'amber' : 'default'}
                />
                <DashboardMetricCard
                    label="Окутуучулар"
                    value={new Set(pendingCourses.map((course) => course.instructor?.id || course.instructor?.fullName || course.id)).size}
                    icon={FiUser}
                    tone="blue"
                />
                <DashboardMetricCard
                    label="Offline / Live"
                    value={deliveryCount}
                    icon={FiBookOpen}
                    tone={deliveryCount ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label="Акы төлөнүүчү"
                    value={paidCount}
                    icon={FiCheckCircle}
                    tone={paidCount ? 'blue' : 'default'}
                    helper={newestDate !== '—' ? `Акыркысы: ${newestDate}` : undefined}
                />
            </div>

            <DashboardInsetPanel
                title="Бекитүү тизмеси"
                description="Ар бир курс боюнча түрүн, баасын, инструкторун жана алдын ала көрүү шилтемесин текшериңиз."
            >
                {pendingCourses.length ? (
                    <div className="mt-4 space-y-4">
                        {pendingCourses.map((course) => (
                            <article
                                key={course.id}
                                className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                    {course.title}
                                                </h3>
                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiClock className="h-3.5 w-3.5" />
                                                        Каралууда
                                                    </span>
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    {getCourseTypeLabel(course.courseType)}
                                                </span>
                                                <span className="rounded-full bg-edubot-orange/10 px-2.5 py-1 text-xs font-medium text-edubot-orange dark:bg-edubot-orange/20">
                                                    {course.category?.name || 'Категориясыз'}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                                Окутуучу: {course.instructor?.fullName || '—'}
                                                {course.instructor?.email ? ` · ${course.instructor.email}` : ''}
                                            </p>

                                            {course.description ? (
                                                <p className="mt-3 line-clamp-3 text-sm text-edubot-muted dark:text-slate-400">
                                                    {course.description}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                to={`/courses/${course.id}`}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiEye className="h-4 w-4" />
                                                Алдын ала көрүү
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => onApprove(course.id)}
                                                className="dashboard-button-primary"
                                            >
                                                <FiCheckCircle className="h-4 w-4" />
                                                Бекитүү
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onReject(course.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiXCircle className="h-4 w-4" />
                                                Баш тартуу
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Баасы
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {Number(course.price || 0) > 0 ? `${course.price} сом` : 'Акысыз'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Түзүлгөн күнү
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Статус
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                Pending approval
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            title="Каралуудагы курстар жок"
                            subtitle="Азырынча бекитүүнү күткөн курс табылган жок."
                        />
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminPendingCoursesTab;
