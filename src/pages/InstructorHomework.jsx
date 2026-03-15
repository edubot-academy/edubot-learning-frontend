import { useEffect, useMemo, useState } from 'react';
import { fetchCourses, fetchCourseGroups, fetchHomework, fetchHomeworkSummary } from '@services/api';
import Loader from '@shared/ui/Loader';

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const InstructorHomework = () => {
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [limit, setLimit] = useState(20);

    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCourses = async () => {
            const response = await fetchCourses({ limit: 200 });
            setCourses(toArray(response));
        };
        loadCourses().catch(() => setCourses([]));
    }, []);

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
        loadGroups().catch(() => setGroups([]));
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
        load();
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
            <h1 className="text-2xl font-semibold">Homework Manager</h1>

            <div className="grid md:grid-cols-4 gap-3">
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All courses</option>
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
                    <option value="">All groups</option>
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
                    placeholder="Limit"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border">Total: {stats.total}</div>
                <div className="p-4 rounded-xl border">Pending: {stats.pending}</div>
                <div className="p-4 rounded-xl border">Reviewed: {stats.checked}</div>
            </div>

            {loading ? <Loader fullScreen={false} /> : null}

            <div className="rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-3 py-2">Title</th>
                            <th className="text-left px-3 py-2">Course</th>
                            <th className="text-left px-3 py-2">Group</th>
                            <th className="text-left px-3 py-2">Deadline</th>
                            <th className="text-left px-3 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id || `${item.title}-${item.deadline || ''}`} className="border-t">
                                <td className="px-3 py-2">{item.title || item.name || 'Homework'}</td>
                                <td className="px-3 py-2">{item.courseTitle || item.course?.title || '-'}</td>
                                <td className="px-3 py-2">{item.groupName || item.group?.name || '-'}</td>
                                <td className="px-3 py-2">{item.deadline || '-'}</td>
                                <td className="px-3 py-2">{item.status || '-'}</td>
                            </tr>
                        ))}
                        {!items.length && !loading ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                                    Homework табылган жок.
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
