import { useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import UpcomingSessionCard from '@features/liveCourses/components/UpcomingSessionCard';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import SubmissionModal from '@features/liveCourses/components/SubmissionModal';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';
import { submitHomework, studentListAssignments, listCourseSessions } from '@services/api';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '@shared/ui/GlassCard';
import StatTile from '@shared/ui/StatTile';

const TEXT = {
    ky: {
        title: 'Live/Offline окуу тактасы',
        upcoming: 'Кийинки сабак',
        homework: 'Үй тапшырмалары',
        attendance: 'Катышуу',
        submit: 'Тапшырма жөнөтүү',
        dueSoon: 'Жакында тапшыруу',
        overdue: 'Мөөнөт өттү',
    },
    ru: {
        title: 'Дашборд живых/оффлайн курсов',
        upcoming: 'Ближайшее занятие',
        homework: 'Домашние задания',
        attendance: 'Посещаемость',
        submit: 'Сдать задание',
        dueSoon: 'Скоро дедлайн',
        overdue: 'Просрочено',
    },
};

const defaultDashboard = {
    upcomingSession: null,
    attendance: { present: 0, late: 0, absent: 0 },
    homework: { new: [], dueSoon: [], overdue: [] },
};

const StudentLiveDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboard, setDashboard] = useState(defaultDashboard);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [submissionPayload, setSubmissionPayload] = useState({ text: '', link: '', file: null });
    const lang = useMemo(() => user?.language || 'ky', [user]);
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);

    useEffect(() => {
        const load = async () => {
            if (!user?.id || !user?.currentCourseId) return;
            setLoading(true);
            try {
                const [sessionsRes, assignmentsRes] = await Promise.all([
                    listCourseSessions(user.currentCourseId),
                    studentListAssignments(user.currentCourseId),
                ]);
                const sessions = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.items || [];
                const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : assignmentsRes?.items || [];
                setDashboard({
                    upcomingSession: sessions[0] || null,
                    attendance: {},
                    homework: {
                        new: assignments.slice(0, 1),
                        dueSoon: assignments.slice(1, 2),
                        overdue: assignments.slice(2, 3),
                    },
                });
            } catch (error) {
                console.error('Failed to load live dashboard', error);
                setDashboard(defaultDashboard);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const firstHomework =
        dashboard.homework.new?.[0] || dashboard.homework.dueSoon?.[0] || dashboard.homework.overdue?.[0];

    const handleSubmitHomework = async () => {
        if (!firstHomework) {
            toast.error('Тапшырма табылган жок');
            return;
        }
        try {
            await submitHomework(null, firstHomework.id, submissionPayload);
            toast.success('Тапшырма жиберилди');
            setModalOpen(false);
        } catch (error) {
            console.error('Failed to submit homework', error);
            toast.error('Жиберүүдө ката кетти');
        }
    };

    return (
        <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-6">
            <GlassCard className="p-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Жүктөлүүдө...' : 'Live / оффлайн курстарга арналган маалымат'}
                    </p>
                </div>
                {firstHomework && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-4 py-2 rounded-full bg-edubot-orange text-white hover:opacity-90"
                    >
                        {copy.submit}
                    </button>
                )}
            </GlassCard>

            <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <UpcomingSessionCard session={dashboard.upcomingSession} lang={lang} />
                    </div>
                    <AttendanceSummary stats={dashboard.attendance} lang={lang} />
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatTile
                    label={copy.upcoming}
                    value={dashboard.upcomingSession?.date || '—'}
                    sub={dashboard.upcomingSession?.startTime || ''}
                    tone="emerald"
                />
                <StatTile
                    label={copy.homework}
                    value={dashboard.homework.dueSoon?.length || 0}
                    sub={copy.dueSoon}
                    tone="violet"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                    <HomeworkCard
                        homework={
                            dashboard.homework.new?.[0] || {
                                title: copy.homework,
                                description: 'Жаңы тапшырмалар бул жерде көрүнөт',
                                status: 'pending',
                                tag: 'new',
                            }
                        }
                        lang={lang}
                    />
                </GlassCard>
                <GlassCard className="p-4">
                    <HomeworkCard
                        homework={
                            dashboard.homework.dueSoon?.[0] || {
                                title: copy.dueSoon,
                                description: 'Жакынкы дедлайндар бул жерде',
                                status: 'pending',
                                tag: 'dueSoon',
                            }
                        }
                        lang={lang}
                    />
                </GlassCard>
                <GlassCard className="p-4">
                    <HomeworkCard
                        homework={
                            dashboard.homework.overdue?.[0] || {
                                title: copy.overdue,
                                description: 'Өтүп кеткен тапшырмалар',
                                status: 'needs_changes',
                                tag: 'overdue',
                            }
                        }
                        lang={lang}
                    />
                </GlassCard>
            </div>

            <SubmissionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                payload={submissionPayload}
                setPayload={setSubmissionPayload}
                onSubmit={handleSubmitHomework}
                lang={lang}
            />
        </div>
    );
};

export default StudentLiveDashboard;
