import { useContext, useEffect, useMemo, useState } from 'react';
import { fetchInstructorProfile, fetchCourseGroups, fetchHomework, fetchHomeworkSummary } from '@services/api';
import Loader from '@shared/ui/Loader';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getHomeworkErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
    if (status === 403) return 'Бул курс же группа сизге бекитилген эмес.';
    const message = error?.response?.data?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
};

const InstructorHomework = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [limit, setLimit] = useState(20);

    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            const response = await fetchInstructorProfile(user.id);
            setCourses(toArray(response?.courses || response));
        };
        loadCourses().catch((error) => {
            setCourses([]);
            toast.error(getHomeworkErrorMessage(error, 'Курстар жүктөлгөн жок.'));
        });
    }, [user]);

    useEffect(() => {
        if (!courseId) {
            setGroups([]);
            setGroupId('');
            return;
        }
        const loadGroups = async () => {
            const response = await fetchCourseGroups({ courseId: Number(courseId) });
            setGroups(toArray(response));
        };
        loadGroups().catch((error) => {
            setGroups([]);
            toast.error(getHomeworkErrorMessage(error, 'Группалар жүктөлгөн жок.'));
        });
    }, [courseId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [summaryRes, homeworkRes] = await Promise.all([
                    fetchHomeworkSummary({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                    }),
                    fetchHomework({
                        courseId: courseId || undefined,
                        groupId: groupId || undefined,
                        limit,
                    }),
                ]);
                setSummary(summaryRes || null);
                setItems(toArray(homeworkRes));
            } finally {
                setLoading(false);
            }
        };
        load().catch((error) => {
            setSummary(null);
            setItems([]);
            toast.error(getHomeworkErrorMessage(error, 'Үй тапшырмалар жүктөлгөн жок.'));
        });
    }, [courseId, groupId, limit]);

    const stats = useMemo(
        () => ({
            total: summary?.total ?? items.length,
            pending: summary?.pending ?? summary?.todo ?? 0,
            checked: summary?.reviewed ?? summary?.checked ?? 0,
        }),
        [summary, items.length]
    );

    return (
        <div className="pt-24 p-6 max-w-6xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Үй тапшырмаларды башкаруу</h1>

            <div className="grid md:grid-cols-4 gap-3">
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Бардык курстар</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title || course.name}
                        </option>
                    ))}
                </select>

                <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="border rounded px-3 py-2"
                    disabled={!courseId}
                >
                    <option value="">Бардык группалар</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name || group.code}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="1"
                    max="200"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value || 20))}
                    className="border rounded px-3 py-2"
                    placeholder="Лимит"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border">Жалпы: {stats.total}</div>
                <div className="p-4 rounded-xl border">Күтүүдө: {stats.pending}</div>
                <div className="p-4 rounded-xl border">Текшерилген: {stats.checked}</div>
            </div>

            {loading ? <Loader fullScreen={false} /> : null}

            <div className="rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-3 py-2">Аталышы</th>
                            <th className="text-left px-3 py-2">Курс</th>
                            <th className="text-left px-3 py-2">Группа</th>
                            <th className="text-left px-3 py-2">Мөөнөт</th>
                            <th className="text-left px-3 py-2">Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id || `${item.title}-${item.deadline || ''}`} className="border-t">
                                <td className="px-3 py-2">{item.title || item.name || 'Үй тапшырма'}</td>
                                <td className="px-3 py-2">{item.courseTitle || item.course?.title || '-'}</td>
                                <td className="px-3 py-2">{item.groupName || item.group?.name || '-'}</td>
                                <td className="px-3 py-2">{item.deadline || '-'}</td>
                                <td className="px-3 py-2">{item.status || '-'}</td>
                            </tr>
                        ))}
                        {!items.length && !loading ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                                    Үй тапшырмалар табылган жок.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InstructorHomework;
