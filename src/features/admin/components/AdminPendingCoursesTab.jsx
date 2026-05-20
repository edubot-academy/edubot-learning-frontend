
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBookOpen, FiCheckCircle, FiClock, FiEye, FiUser, FiXCircle } from 'react-icons/fi';
import DeliveryCourseDetailsModal from './DeliveryCourseDetailsModal';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

const AdminPendingCoursesTab = ({ pendingCourses, onApprove, onReject }) => {
    const { i18n, t } = useTranslation();
    const [detailCourse, setDetailCourse] = useState(null);
    const deliveryCount = pendingCourses.filter(
        (course) => course.courseType === 'offline' || course.courseType === 'online_live'
    ).length;
    const paidCount = pendingCourses.filter((course) => Number(course.price || 0) > 0).length;
    const newestDate = pendingCourses[0]?.createdAt
        ? new Date(pendingCourses[0].createdAt).toLocaleDateString(i18n.language)
        : '—';

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('adminPendingCourses.eyebrow')}
                title={t('adminPendingCourses.title')}
                description={t('adminPendingCourses.description')}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label={t('adminPendingCourses.metrics.pending')}
                    value={pendingCourses.length}
                    icon={FiClock}
                    tone={pendingCourses.length ? 'amber' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminPendingCourses.metrics.instructors')}
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
                    label={t('adminPendingCourses.metrics.paid')}
                    value={paidCount}
                    icon={FiCheckCircle}
                    tone={paidCount ? 'blue' : 'default'}
                    helper={newestDate !== '—' ? t('adminPendingCourses.metrics.newest', { date: newestDate }) : undefined}
                />
            </div>

            <DashboardInsetPanel
                title={t('adminPendingCourses.queue.title')}
                description={t('adminPendingCourses.queue.description')}
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
                                                        {t('adminPendingCourses.status.pending')}
                                                    </span>
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    {getCourseTypeLabel(course.courseType, t)}
                                                </span>
                                                <span className="rounded-full bg-edubot-orange/10 px-2.5 py-1 text-xs font-medium text-edubot-orange dark:bg-edubot-orange/20">
                                                    {course.category?.name || t('adminPendingCourses.uncategorized')}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                                {t('adminPendingCourses.instructor')}: {course.instructor?.fullName || '—'}
                                                {course.instructor?.email ? ` · ${course.instructor.email}` : ''}
                                            </p>

                                            {course.description ? (
                                                <p className="mt-3 line-clamp-3 text-sm text-edubot-muted dark:text-slate-400">
                                                    {course.description}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {course.courseType === 'offline' || course.courseType === 'online_live' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailCourse(course)}
                                                    className="dashboard-button-secondary"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                    {t('adminPendingCourses.actions.details')}
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/courses/${course.id}`}
                                                    className="dashboard-button-secondary"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                    {t('adminPendingCourses.actions.preview')}
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => onApprove(course)}
                                                className="dashboard-button-primary"
                                            >
                                                <FiCheckCircle className="h-4 w-4" />
                                                {t('adminPendingCourses.actions.approve')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onReject(course)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiXCircle className="h-4 w-4" />
                                                {t('adminPendingCourses.actions.reject')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('adminPendingCourses.fields.price')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {Number(course.price || 0) > 0
                                                    ? t('adminPendingCourses.currency.kgs', { amount: course.price })
                                                    : t('adminPendingCourses.free')}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('adminPendingCourses.fields.createdAt')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString(i18n.language) : '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                {t('adminPendingCourses.fields.status')}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {t('adminPendingCourses.status.pendingApproval')}
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
                            title={t('adminPendingCourses.empty.title')}
                            subtitle={t('adminPendingCourses.empty.subtitle')}
                        />
                    </div>
                )}
            </DashboardInsetPanel>
            <DeliveryCourseDetailsModal
                course={detailCourse}
                isOpen={Boolean(detailCourse)}
                onClose={() => setDetailCourse(null)}
            />
        </div>
    );
};

export default AdminPendingCoursesTab;
