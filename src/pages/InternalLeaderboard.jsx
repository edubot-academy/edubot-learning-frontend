import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourses,
    fetchInternalCourseLeaderboard,
    fetchInternalHomepageLeaderboard,
    fetchInternalStudentOfWeek,
    fetchInternalWeeklyLeaderboard,
} from '@services/api';
import Loader from '@shared/ui/Loader';

const TRACKS = [
    { value: 'all', label: 'All' },
    { value: 'video', label: 'Video' },
    { value: 'live', label: 'Live' },
];

const Avatar = ({ src, name }) => {
    if (src) {
        return <img src={src} alt={name || 'Student'} className="w-10 h-10 rounded-full object-cover" />;
    }
    const initials = (name || 'ED')
        .split(' ')
        .map((chunk) => chunk[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            {initials}
        </div>
    );
};

const LeaderRow = ({ item, rank }) => {
    const quizCount = Number(item?.quizzesPassed);

    return (
        <div className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1b1f26]">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold">
                {rank}
            </div>
            <Avatar src={item?.avatarUrl} name={item?.fullName} />
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item?.fullName || 'Студент'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                    {item?.xp || 0} XP
                    {item?.progressPercent ? ` · ${item.progressPercent}%` : ''}
                    {item?.streakDays ? ` · 🔥 ${item.streakDays} күн` : ''}
                </p>
            </div>
            {quizCount > 0 ? (
                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                    {quizCount} тест
                </span>
            ) : null}
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-300 text-center">
        {message}
    </div>
);

const normalizeItems = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload)) return payload;
    return [];
};

const InternalLeaderboard = () => {
    const [track, setTrack] = useState('all');

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const [weekly, setWeekly] = useState({ items: [], total: 0 });
    const [homepage, setHomepage] = useState({ items: [] });
    const [studentOfWeek, setStudentOfWeek] = useState(null);
    const [courseLeaders, setCourseLeaders] = useState({ items: [], total: 0 });

    const [loading, setLoading] = useState(true);
    const [loadingCourseBoard, setLoadingCourseBoard] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadCourses = async () => {
            try {
                const response = await fetchCourses();
                if (cancelled) return;
                const list = Array.isArray(response?.courses) ? response.courses : [];
                setCourses(list);
                if (list.length) {
                    setSelectedCourseId(String(list[0].id));
                }
            } catch {
                if (!cancelled) setCourses([]);
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const [weeklyRes, homepageRes, sowRes] = await Promise.all([
                    fetchInternalWeeklyLeaderboard({ track, limit: 10 }),
                    fetchInternalHomepageLeaderboard({ track }),
                    fetchInternalStudentOfWeek({ track }),
                ]);

                if (cancelled) return;
                setWeekly(weeklyRes || { items: [], total: 0 });
                setHomepage(homepageRes || { items: [] });
                setStudentOfWeek(sowRes || null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [track]);

    useEffect(() => {
        if (!selectedCourseId) {
            setCourseLeaders({ items: [], total: 0 });
            return;
        }

        let cancelled = false;
        const loadCourseBoard = async () => {
            setLoadingCourseBoard(true);
            try {
                const data = await fetchInternalCourseLeaderboard(Number(selectedCourseId), {
                    track,
                    limit: 10,
                });
                if (!cancelled) {
                    setCourseLeaders(data || { items: [], total: 0 });
                }
            } finally {
                if (!cancelled) setLoadingCourseBoard(false);
            }
        };

        loadCourseBoard();
        return () => {
            cancelled = true;
        };
    }, [selectedCourseId, track]);

    const weeklyItems = useMemo(() => normalizeItems(weekly), [weekly]);
    const homepageItems = useMemo(() => normalizeItems(homepage), [homepage]);
    const courseItems = useMemo(() => normalizeItems(courseLeaders), [courseLeaders]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#111418] text-gray-900 dark:text-white px-4 md:px-10 py-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">LMS ички рейтинги</p>
                    <h1 className="text-3xl font-bold">Рейтинг</h1>
                </div>
                <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-[#1a1f27]">
                    {TRACKS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setTrack(option.value)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${
                                track === option.value
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <Loader fullScreen={false} /> : null}

            <div className="grid lg:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-[#1a1f27]">
                    <h2 className="text-lg font-semibold mb-3">Апталык рейтинг</h2>
                    <div className="space-y-2">
                        {weeklyItems.length ? (
                            weeklyItems.map((item, idx) => (
                                <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                            ))
                        ) : (
                            <EmptyState message="Бул багыт боюнча лидерлер табылган жок." />
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-[#1a1f27]">
                    <h2 className="text-lg font-semibold mb-3">Аптанын студенти</h2>
                    {studentOfWeek ? (
                        <LeaderRow item={studentOfWeek} rank={1} />
                    ) : (
                        <EmptyState message="Бул багыт боюнча студент жок." />
                    )}

                    <h3 className="text-base font-semibold mt-5 mb-3">Башкы беттеги мыктылар</h3>
                    <div className="space-y-2">
                        {homepageItems.length ? (
                            homepageItems.map((item, idx) => (
                                <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                            ))
                        ) : (
                            <EmptyState message="Тандалган багыт үчүн башкы бет маалыматы жок." />
                        )}
                    </div>
                </section>
            </div>

            <section className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-[#1a1f27] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Курс рейтинги</h2>
                    <select
                        value={selectedCourseId}
                        onChange={(event) => setSelectedCourseId(event.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0E0E0E]"
                    >
                        <option value="">Курс тандаңыз</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                {loadingCourseBoard ? <Loader fullScreen={false} /> : null}

                <div className="space-y-2">
                    {!selectedCourseId ? (
                        <EmptyState message="Алгач курс тандаңыз." />
                    ) : courseItems.length ? (
                        courseItems.map((item, idx) => (
                            <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                        ))
                    ) : (
                        <EmptyState message="Бул курс жана багыт айкалышы үчүн маалымат жок." />
                    )}
                </div>
            </section>
        </div>
    );
};

export default InternalLeaderboard;


Avatar.propTypes = {
    src: PropTypes.string,
    name: PropTypes.string,
};

Avatar.defaultProps = {
    src: null,
    name: '',
};

LeaderRow.propTypes = {
    item: PropTypes.object,
    rank: PropTypes.number.isRequired,
};

LeaderRow.defaultProps = {
    item: null,
};

EmptyState.propTypes = {
    message: PropTypes.string.isRequired,
};
