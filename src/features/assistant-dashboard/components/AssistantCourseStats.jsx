import {
    DashboardInsetPanel,
    EmptyState,
    StatusBadge,
} from '@components/ui/dashboard';
import { FiBookOpen } from 'react-icons/fi';

const getCourseSignal = (studentCount) => {
    if (studentCount === 0) {
        return {
            tone: 'amber',
            label: 'Каттоо күтөт',
            hint: 'Бул курс азыр бош, студенттер табынан каттоону баштасаңыз болот.',
        };
    }

    if (studentCount >= 25) {
        return {
            tone: 'blue',
            label: 'Жогорку жүктөм',
            hint: 'Катталган студент көп. Топ/катышуу агымын жакын көзөмөлдөңүз.',
        };
    }

    return {
        tone: 'green',
        label: 'Активдүү',
        hint: 'Курста катталган студенттер бар.',
    };
};

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
                                        {course.shortDescription || 'Компаниядагы активдүү курс'}
                                    </div>
                                </div>
                                <StatusBadge tone={studentCount > 0 ? 'green' : 'default'}>
                                    {studentCount} студент
                                </StatusBadge>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edubot-line/60 pt-3 dark:border-slate-700">
                                <StatusBadge tone={signal.tone}>{signal.label}</StatusBadge>
                                <span className="text-xs text-edubot-muted dark:text-slate-400">
                                    {course.courseType === 'offline'
                                        ? 'Оффлайн'
                                        : course.courseType === 'online_live'
                                          ? 'Онлайн live'
                                          : 'Видео курс'}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                {signal.hint}
                            </p>
                        </div>
                    );
                })}
            </div>
        </DashboardInsetPanel>
    );
};

export default AssistantCourseStats;
