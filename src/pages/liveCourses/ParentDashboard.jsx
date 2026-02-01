import { useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AttendanceSummary from '@features/liveCourses/components/AttendanceSummary';
import HomeworkCard from '@features/liveCourses/components/HomeworkCard';
import UpcomingSessionCard from '@features/liveCourses/components/UpcomingSessionCard';
import { fetchParentStudentSummary } from '@services/api';
import { AuthContext } from '../../context/AuthContext';

const TEXT = {
    ky: {
        title: 'Ата-эне панел',
        children: 'Байланышкан балдар',
        attendance: 'Катышуу',
        homework: 'Үй тапшырмасы',
    },
    ru: {
        title: 'Панель родителя',
        children: 'Дети',
        attendance: 'Посещаемость',
        homework: 'Домашние задания',
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

    return (
        <div className="pt-20 pb-12 max-w-6xl mx-auto px-4 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
                    {loading && <p className="text-sm text-gray-500">Жүктөлүүдө...</p>}
                </div>
            </div>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AttendanceSummary stats={activeChild.attendance || {}} lang={lang} />
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
                    <UpcomingSessionCard session={activeChild.upcomingSession} lang={lang} />
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
