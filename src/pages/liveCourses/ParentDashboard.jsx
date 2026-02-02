import { useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import UpcomingSessionCard from '@features/liveCourses/components/UpcomingSessionCard';
import { fetchParentStudentSummary } from '@services/api';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '@shared/ui/GlassCard';
import StatTile from '@shared/ui/StatTile';
import PillTabs from '@shared/ui/PillTabs';

const TEXT = {
    ky: {
        title: 'Ата-эне панел',
        children: 'Байланышкан балдар',
        attendance: 'Катышуу',
        homework: 'Үй тапшырмасы',
        attendanceRate: 'Катышуу пайызы',
        homeworkRate: 'Тапшырма аяктоо',
        latestFeedback: 'Акыркы пикир',
        courses: 'Курстар',
        noChildren: 'Байланышкан бала жок.',
        empty: 'Маалымат жок',
        attendanceTimeline: 'Катышуу тарыхы',
        homeworkHistory: 'Тапшырма тарыхы',
    },
    ru: {
        title: 'Панель родителя',
        children: 'Дети',
        attendance: 'Посещаемость',
        homework: 'Домашние задания',
        attendanceRate: 'Процент посещаемости',
        homeworkRate: 'Выполнение дз',
        latestFeedback: 'Последний отзыв',
        courses: 'Курсы',
        noChildren: 'Нет привязанных детей.',
        empty: 'Нет данных',
        attendanceTimeline: 'История посещаемости',
        homeworkHistory: 'История домашних',
    },
};

const ParentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState([]);
    const [activeChild, setActiveChild] = useState(null);
    const [loading, setLoading] = useState(false);
    const lang = useMemo(() => user?.language || 'ky', [user]);
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);

    useEffect(() => {
        const load = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const data = await fetchParentStudentSummary(user.id);
                const list = Array.isArray(data) ? data : data?.items || [];
                setSummary(list);
                setActiveChild(list[0]);
            } catch (error) {
                console.error('Failed to load parent dashboard', error);
                toast.error('Маалымат жүктөлбөдү');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const renderCourses = (child) => {
        const courses = child?.courses || child?.enrollments || [];
        if (!courses.length) {
            return <p className="text-sm text-gray-500">{copy.empty}</p>;
        }
        return (
            <div className="space-y-2">
                {courses.map((c) => (
                    <div
                        key={c.id || c.courseId}
                        className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {c.title || c.courseTitle || `#${c.courseId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                                {copy.attendanceRate}:{' '}
                                {typeof c.attendanceRate === 'number' ? `${c.attendanceRate}%` : '—'}
                                {' · '}
                                {copy.homeworkRate}:{' '}
                                {typeof c.homeworkRate === 'number' ? `${c.homeworkRate}%` : '—'}
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                            {c.nextSessionDate || c.status || '—'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="pt-20 pb-12 max-w-6xl mx-auto px-4 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
                    {loading && <p className="text-sm text-gray-500">Жүктөлүүдө...</p>}
                </div>
            </div>

            {summary.length === 0 && !loading && (
                <p className="text-sm text-gray-500">{copy.noChildren}</p>
            )}

            <div className="flex gap-2 flex-wrap">
                {summary.map((child) => (
                    <button
                        key={child.id}
                        onClick={() => setActiveChild(child)}
                        className={`px-4 py-2 rounded-full text-sm ${
                            activeChild?.id === child.id
                                ? 'bg-edubot-orange text-white'
                                : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {child.name}
                    </button>
                ))}
            </div>

            {activeChild && (
                <div className="space-y-4">
                    <GlassCard className="p-4">
                        <PillTabs
                            tabs={[
                                { id: 'overview', label: 'Обзор / Кыскача' },
                                { id: 'details', label: 'Деталдар' },
                            ]}
                            activeId="overview"
                            onChange={() => {}}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <StatTile
                                label={copy.attendanceRate}
                                value={
                                    typeof activeChild.attendanceRate === 'number'
                                        ? `${activeChild.attendanceRate}%`
                                        : '—'
                                }
                                tone="emerald"
                            />
                            <StatTile
                                label={copy.homeworkRate}
                                value={
                                    typeof activeChild.homeworkCompletion === 'number'
                                        ? `${activeChild.homeworkCompletion}%`
                                        : '—'
                                }
                                tone="violet"
                            />
                            <StatTile
                                label={copy.latestFeedback}
                                value={activeChild.latestFeedback ? '•' : '—'}
                                sub={activeChild.latestFeedback || copy.empty}
                                tone="amber"
                            />
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="p-4">
                            <AttendanceSummary stats={activeChild.attendance || {}} lang={lang} />
                        </GlassCard>
                        <GlassCard className="p-4">
                            <HomeworkCard
                                homework={{
                                    title: copy.homework,
                                    description: activeChild.homeworkComment || 'Тапшырмалардын абалы',
                                    status: 'pending',
                                    tag: 'new',
                                    dueDate: activeChild.nextDueDate,
                                }}
                                lang={lang}
                            />
                        </GlassCard>
                        <GlassCard className="p-4">
                            <UpcomingSessionCard session={activeChild.upcomingSession} lang={lang} />
                        </GlassCard>
                    </div>
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {copy.courses}
                            </p>
                        </div>
                        {renderCourses(activeChild)}
                    </GlassCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GlassCard className="p-4 space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {copy.attendanceTimeline}
                            </p>
                            {(activeChild.attendanceHistory || []).length ? (
                                (activeChild.attendanceHistory || []).map((row) => (
                                    <div
                                        key={row.id || `${row.sessionId}-${row.date}`}
                                        className="flex items-center justify-between text-sm border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2"
                                    >
                                        <span>{row.date || row.sessionTitle}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                            {row.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500">{copy.empty}</p>
                            )}
                        </GlassCard>
                        <GlassCard className="p-4 space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {copy.homeworkHistory}
                            </p>
                            {(activeChild.homeworkHistory || []).length ? (
                                (activeChild.homeworkHistory || []).map((row, idx) => (
                                    <div
                                        key={row.id || idx}
                                        className="flex items-center justify-between text-sm border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {row.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{row.dueAt || row.sessionTitle}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                            {row.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500">{copy.empty}</p>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
