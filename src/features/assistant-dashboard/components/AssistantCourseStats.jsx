import {
    DashboardInsetPanel,
    EmptyState,
    StatusBadge,
} from '@components/ui/dashboard';
import { FiBookOpen } from 'react-icons/fi';

const AssistantCourseStats = ({ courses, courseCounts, loading }) => {
    if (!courses.length && !loading) {
        return (
            <DashboardInsetPanel
                title="Курс жүктөмү"
                description="Компаниядагы курстар боюнча студенттердин бөлүштүрүлүшү."
            >
                <EmptyState
                    title="Курс табылган жок"
                    subtitle="Компания үчүн жеткиликтүү жарыяланган курстар чыккандан кийин бул жерде көрүнөт."
                    icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                />
            </DashboardInsetPanel>
        );
    }

    return (
        <DashboardInsetPanel
            title="Курс жүктөмү"
            description="Компаниядагы курстар боюнча студенттердин бөлүштүрүлүшү."
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="dashboard-panel-muted flex items-start justify-between gap-3 rounded-3xl p-4"
                    >
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                {course.title}
                            </div>
                            <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                {course.shortDescription || 'Компаниядагы активдүү курс'}
                            </div>
                        </div>
                        <StatusBadge tone={(courseCounts[course.id] || 0) > 0 ? 'green' : 'default'}>
                            {courseCounts[course.id] || 0} студент
                        </StatusBadge>
                    </div>
                ))}
            </div>
        </DashboardInsetPanel>
    );
};

export default AssistantCourseStats;
