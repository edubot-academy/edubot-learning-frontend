import { useTranslation } from 'react-i18next';
import {
    DashboardInsetPanel,
    EmptyState,
    StatusBadge,
} from '@components/ui/dashboard';
import { FiBookOpen } from 'react-icons/fi';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

const getCourseSignal = (studentCount) => {
    if (studentCount === 0) {
        return {
            tone: 'amber',
            labelKey: 'assistantDashboard.courseStats.signals.empty.label',
            hintKey: 'assistantDashboard.courseStats.signals.empty.hint',
        };
    }

    if (studentCount >= 25) {
        return {
            tone: 'blue',
            labelKey: 'assistantDashboard.courseStats.signals.highLoad.label',
            hintKey: 'assistantDashboard.courseStats.signals.highLoad.hint',
        };
    }

    return {
        tone: 'green',
        labelKey: 'assistantDashboard.courseStats.signals.active.label',
        hintKey: 'assistantDashboard.courseStats.signals.active.hint',
    };
};

const AssistantCourseStats = ({ courses, courseCounts, loading }) => {
    const { t } = useTranslation();

    if (!courses.length && !loading) {
        return (
            <DashboardInsetPanel
                title={t('assistantDashboard.courseStats.title')}
                description={t('assistantDashboard.courseStats.description')}
            >
                <EmptyState
                    title={t('assistantDashboard.courseStats.empty.title')}
                    subtitle={t('assistantDashboard.courseStats.empty.subtitle')}
                    icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                />
            </DashboardInsetPanel>
        );
    }

    return (
        <DashboardInsetPanel
            title={t('assistantDashboard.courseStats.title')}
            description={t('assistantDashboard.courseStats.description')}
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => {
                    const studentCount = courseCounts[course.id] || 0;
                    const signal = getCourseSignal(studentCount);

                    return (
                        <div
                            key={course.id}
                            className="dashboard-panel-muted rounded-3xl p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        {course.title}
                                    </div>
                                    <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        {course.shortDescription || t('assistantDashboard.courseStats.fallbackDescription')}
                                    </div>
                                </div>
                                <StatusBadge tone={studentCount > 0 ? 'green' : 'default'}>
                                    {t('assistantDashboard.courseStats.studentCount', { count: studentCount })}
                                </StatusBadge>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edubot-line/60 pt-3 dark:border-slate-700">
                                <StatusBadge tone={signal.tone}>{t(signal.labelKey)}</StatusBadge>
                                <span className="text-xs text-edubot-muted dark:text-slate-400">
                                    {getCourseTypeLabel(course.courseType, t)}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                {t(signal.hintKey)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </DashboardInsetPanel>
    );
};

export default AssistantCourseStats;
