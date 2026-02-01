import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchStudentCourseDashboard } from '@services/api';
import UpcomingSessionCard from '@features/liveCourses/components/UpcomingSessionCard';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';

const TEXT = {
    ky: {
        title: 'Курс тактасы',
        nextSession: 'Кийинки сабак',
        todo: 'Тапшырмалар',
        attendance: 'Катышуу',
        submissions: 'Жөнөтүүлөр',
        viewAllAssignments: 'Бардык тапшырмалар',
        viewAttendance: 'Катышуу тарыхы',
        attendanceRate: 'Катышуу пайызы',
        homeworkRate: 'Тапшырма аяктоо',
    },
    ru: {
        title: 'Дашборд курса',
        nextSession: 'Ближайшее занятие',
        todo: 'Задания',
        attendance: 'Посещаемость',
        submissions: 'Отправки',
        viewAllAssignments: 'Все задания',
        viewAttendance: 'История посещаемости',
        attendanceRate: 'Процент посещаемости',
        homeworkRate: 'Выполнение дз',
    },
};

const StudentCourseDashboard = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const lang = 'ky';
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetchStudentCourseDashboard(id);
                setData(res || {});
            } catch (error) {
                console.error('Failed to load student course dashboard', error);
                toast.error('Маалымат жүктөлгөн жок');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="pt-20 max-w-5xl mx-auto px-4 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-40 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm uppercase text-gray-500">{copy.title}</p>
                    <h1 className="text-2xl font-bold text-gray-900">#{id}</h1>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/student/courses/${id}/assignments`}
                        className="px-4 py-2 rounded border text-sm text-emerald-600"
                    >
                        {copy.viewAllAssignments}
                    </Link>
                    <Link
                        to={`/student/courses/${id}/attendance`}
                        className="px-4 py-2 rounded border text-sm text-gray-600"
                    >
                        {copy.viewAttendance}
                    </Link>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <UpcomingSessionCard session={data?.nextSession} lang={lang} />
                </div>
                <AttendanceSummary stats={data?.attendance || { present: 0, late: 0, absent: 0 }} lang={lang} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4">
                    <p className="text-xs text-gray-500">{copy.attendanceRate}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {typeof data?.attendanceRate === 'number' ? `${data.attendanceRate}%` : '—'}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4">
                    <p className="text-xs text-gray-500">{copy.homeworkRate}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {typeof data?.homeworkCompletion === 'number' ? `${data.homeworkCompletion}%` : '—'}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HomeworkCard
                    homework={
                        data?.assignments?.dueSoon?.[0] || {
                            title: copy.todo,
                            description: 'Дедлайндар бул жерде көрүнөт',
                            status: 'pending',
                            tag: 'dueSoon',
                        }
                    }
                    lang={lang}
                />
                <HomeworkCard
                    homework={
                        data?.assignments?.overdue?.[0] || {
                            title: 'Overdue',
                            description: 'Өткөн тапшырмалар',
                            status: 'needs_changes',
                            tag: 'overdue',
                        }
                    }
                    lang={lang}
                />
                <HomeworkCard
                    homework={
                        data?.assignments?.needsChanges?.[0] || {
                            title: copy.submissions,
                            description: 'Тапшырмаларды бул жерден көрө аласыз',
                            status: 'pending',
                            tag: 'new',
                        }
                    }
                    lang={lang}
                />
            </div>
        </div>
    );
};

export default StudentCourseDashboard;
