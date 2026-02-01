import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchStudentCourseAttendance } from '@services/api';

const TEXT = {
    ky: {
        title: 'Катышуу',
        empty: 'Катышуу маалыматы жок.',
    },
    ru: {
        title: 'Посещаемость',
        empty: 'Нет данных посещаемости.',
    },
};

const statusBadge = (status) => {
    const colors = {
        present: 'bg-emerald-100 text-emerald-700',
        late: 'bg-amber-100 text-amber-700',
        absent: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

const StudentCourseAttendance = () => {
    const { id } = useParams();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const lang = 'ky';
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetchStudentCourseAttendance(id);
                const items = Array.isArray(res?.items) ? res.items : res || [];
                setRecords(items);
            } catch (error) {
                console.error('Failed to load attendance', error);
                toast.error('Катышуу жүктөлгөн жок');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="pt-20 max-w-5xl mx-auto px-4 space-y-3">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="pt-20 pb-10 max-w-5xl mx-auto px-4 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
            {records.length ? (
                <div className="space-y-2">
                    {records.map((rec) => (
                        <div
                            key={rec.id || `${rec.sessionId}-${rec.date}`}
                            className="flex items-center justify-between rounded-xl border border-gray-200 p-3"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {rec.sessionTitle || `Session ${rec.sessionId || ''}`}
                                </p>
                                <p className="text-xs text-gray-500">{rec.date || rec.recordedAt}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${statusBadge(rec.status)}`}>
                                {rec.status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-gray-500">{copy.empty}</div>
            )}
        </div>
    );
};

export default StudentCourseAttendance;
