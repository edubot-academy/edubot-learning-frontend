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
        <div className="pt-24 p-4 md:p-6 max-w-6xl mx-auto space-y-4">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Үй тапшырмаларды башкаруу</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                    className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                    className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Лимит"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white">Жалпы: {stats.total}</div>
                <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white">Күтүүдө: {stats.pending}</div>
                <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white">Текшерилген: {stats.checked}</div>
            </div>

            {loading ? <Loader fullScreen={false} /> : null}

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border overflow-x-auto bg-white dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="text-left px-3 py-2 text-gray-900 dark:text-white">Аталышы</th>
                            <th className="text-left px-3 py-2 text-gray-900 dark:text-white">Курс</th>
                            <th className="text-left px-3 py-2 text-gray-900 dark:text-white">Группа</th>
                            <th className="text-left px-3 py-2 text-gray-900 dark:text-white">Мөөнөт</th>
                            <th className="text-left px-3 py-2 text-gray-900 dark:text-white">Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id || `${item.title}-${item.deadline || ''}`} className="border-t dark:border-gray-700">
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{item.title || item.name || 'Үй тапшырма'}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{item.courseTitle || item.course?.title || '-'}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{item.groupName || item.group?.name || '-'}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{item.deadline || '-'}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{item.status || '-'}</td>
                            </tr>
                        ))}
                        {!items.length && !loading ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                                    Үй тапшырмалар табылган жок.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
                {items.map((item) => (
                    <div key={item.id || `${item.title}-${item.deadline || ''}`} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {item.title || item.name || 'Үй тапшырма'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'completed'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : item.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {item.status || 'Белгисиз'}
                                </span>
                            </div>

                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Курс:</span>
                                    <span>{item.courseTitle || item.course?.title || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Группа:</span>
                                    <span>{item.groupName || item.group?.name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Мөөнөт:</span>
                                    <span>{item.deadline || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!items.length && !loading && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Үй тапшырмалар табылган жок.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorHomework;
