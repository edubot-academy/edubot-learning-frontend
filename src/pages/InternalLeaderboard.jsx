import { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourses,
    fetchInternalCourseLeaderboard,
    fetchInternalHomepageLeaderboard,
    fetchInstructorCourses,
    fetchInternalStudentOfWeek,
    fetchInternalWeeklyLeaderboard,
    fetchStudentCourses,
} from '@services/api';
import Loader from '@shared/ui/Loader';
import { AuthContext } from '../context/AuthContext';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState as DashboardEmptyState,
} from '@components/ui/dashboard';
import { FiAward, FiBookOpen, FiStar, FiTrendingUp } from 'react-icons/fi';

const TRACKS = [
    { value: 'all', label: 'Бардыгы', helper: 'Жалпы активдүүлүк' },
    { value: 'video', label: 'Видео', helper: 'Өз алдынча окуу' },
    { value: 'live', label: 'Жандуу', helper: 'Сессиялык окуу' },
];

const ROLE_COPY = {
    student: {
        eyebrow: 'Student Ranking',
        title: 'Менин ички рейтингим',
        description: 'Орунуңузду, курстагы лидерлерди жана бул жумадагы активдүүлүктү салыштырып көрүңүз.',
        courseLabel: 'Менин курстарым',
        courseDescription: 'Катышып жаткан курстарыңыздагы лидерлерди салыштырыңыз.',
    },
    instructor: {
        eyebrow: 'Instructor Ranking',
        title: 'Окуучулардын рейтинги',
        description: 'Курстарыңыздагы активдүү окуучуларды, аптанын студентин жана курс ичиндеги темпти көзөмөлдөңүз.',
        courseLabel: 'Менин курстарым',
        courseDescription: 'Курс тандап, ошол курс ичиндеги активдүү окуучуларды көрүңүз.',
    },
    admin: {
        eyebrow: 'Admin Ranking',
        title: 'Платформа рейтинги',
        description: 'Платформа боюнча жумалык активдүүлүктү, башкы бет лидерлерин жана курс рейтингдерин караңыз.',
        courseLabel: 'Платформа курстары',
        courseDescription: 'Каалаган курс боюнча ички рейтингди текшериңиз.',
    },
    default: {
        eyebrow: 'Leaderboard workspace',
        title: 'Ички рейтинг',
        description: 'Апталык лидерлерди, аптанын студентин жана курс ичиндеги орундарды ушул жерден көрүңүз.',
        courseLabel: 'Курс такталары',
        courseDescription: 'Тандалган курс ичиндеги мыктыларды салыштырыңыз.',
    },
};

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
                <p className="font-medium truncate text-gray-900 dark:text-white">{item?.fullName || 'Студент'}</p>
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

const normalizeItems = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.courses)) return payload.courses;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const normalizeCourseOptions = (payload) =>
    normalizeItems(payload)
        .map((item) => {
            const resolvedId =
                item?.id ??
                item?.courseId ??
                item?.course?.id ??
                item?.course?.courseId;

            return {
                ...item,
                id: resolvedId,
                title:
                    item?.title ||
                    item?.courseTitle ||
                    item?.course?.title ||
                    item?.name ||
                    'Курс',
            };
        })
        .filter((item) => Number.isFinite(Number(item?.id)));

const InternalLeaderboard = () => {
    const { user } = useContext(AuthContext);
    const [track, setTrack] = useState('all');

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const [weekly, setWeekly] = useState({ items: [], total: 0 });
    const [homepage, setHomepage] = useState({ items: [] });
    const [studentOfWeek, setStudentOfWeek] = useState(null);
    const [courseLeaders, setCourseLeaders] = useState({ items: [], total: 0 });

    const [loading, setLoading] = useState(true);
    const [loadingCourseBoard, setLoadingCourseBoard] = useState(false);
    const [coursesError, setCoursesError] = useState('');
    const [leaderboardError, setLeaderboardError] = useState('');
    const [courseBoardError, setCourseBoardError] = useState('');

    const roleCopy = ROLE_COPY[user?.role] || ROLE_COPY.default;
    const selectedTrack = TRACKS.find((option) => option.value === track) || TRACKS[0];

    useEffect(() => {
        let cancelled = false;
        const loadCourses = async () => {
            setCoursesError('');
            try {
                const response = user?.role === 'instructor'
                    ? await fetchInstructorCourses({ status: 'approved' })
                    : user?.role === 'student'
                        ? await fetchStudentCourses(user.id)
                        : await fetchCourses();
                if (cancelled) return;
                const list = normalizeCourseOptions(response);
                setCourses(list);
                if (list.length) {
                    setSelectedCourseId(String(list[0].id));
                } else {
                    setSelectedCourseId('');
                }
            } catch {
                if (!cancelled) {
                    setCoursesError('Курстарды жүктөө мүмкүн болгон жок.');
                    setCourses([]);
                    setSelectedCourseId('');
                }
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
    }, [user?.id, user?.role]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setLeaderboardError('');
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
            } catch {
                if (!cancelled) {
                    setLeaderboardError('Ички рейтинг маалыматтарын жүктөө мүмкүн болгон жок.');
                    setWeekly({ items: [], total: 0 });
                    setHomepage({ items: [] });
                    setStudentOfWeek(null);
                }
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
        const numericCourseId = Number(selectedCourseId);

        if (!selectedCourseId || !Number.isFinite(numericCourseId)) {
            setCourseLeaders({ items: [], total: 0 });
            return;
        }

        let cancelled = false;
        const loadCourseBoard = async () => {
            setLoadingCourseBoard(true);
            setCourseBoardError('');
            try {
                const data = await fetchInternalCourseLeaderboard(numericCourseId, {
                    track,
                    limit: 10,
                });
                if (!cancelled) {
                    setCourseLeaders(data || { items: [], total: 0 });
                }
            } catch {
                if (!cancelled) {
                    setCourseBoardError('Курс рейтинги азыр жүктөлбөй жатат.');
                    setCourseLeaders({ items: [], total: 0 });
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
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={roleCopy.eyebrow}
                title={roleCopy.title}
                description={roleCopy.description}
                action={(
                    <div className="inline-flex flex-wrap rounded-2xl border border-edubot-line bg-white/90 p-1 dark:border-slate-700 dark:bg-slate-950" aria-label="Рейтинг багыты">
                        {TRACKS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setTrack(option.value)}
                                aria-pressed={track === option.value}
                                title={option.helper}
                                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                                    track === option.value
                                        ? 'bg-edubot-orange text-white'
                                        : 'text-edubot-muted hover:text-edubot-ink dark:text-slate-300 dark:hover:text-white'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label="Апталык лидерлер"
                    value={weeklyItems.length}
                    icon={FiTrendingUp}
                />
                <DashboardMetricCard
                    label="Башкы бет мыктылары"
                    value={homepageItems.length}
                    icon={FiStar}
                    tone="blue"
                />
                <DashboardMetricCard
                    label="Аптанын студенти"
                    value={studentOfWeek?.fullName ? '1' : '0'}
                    icon={FiAward}
                    tone="green"
                />
                <DashboardMetricCard
                    label={roleCopy.courseLabel}
                    value={courses.length}
                    icon={FiBookOpen}
                    tone="amber"
                />
            </div>

            <div className="rounded-3xl border border-edubot-line bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange">Учурдагы көрүнүш</p>
                        <h2 className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">{selectedTrack.label}</h2>
                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-300">{selectedTrack.helper}</p>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-edubot-muted dark:text-slate-300">
                        {roleCopy.courseDescription}
                    </p>
                </div>
            </div>

            {coursesError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" role="status">
                    {coursesError}
                </div>
            ) : null}

            {leaderboardError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100" role="alert">
                    {leaderboardError}
                </div>
            ) : null}

            {loading ? <Loader fullScreen={false} /> : null}

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardInsetPanel title="Апталык рейтинг" description="Учурда эң активдүү окуучулар.">
                    <div className="space-y-2">
                        {weeklyItems.length ? (
                            weeklyItems.map((item, idx) => (
                                <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                            ))
                        ) : (
                            <DashboardEmptyState
                                title="Лидерлер табылган жок"
                                subtitle="Тандалган багыт боюнча азырынча рейтинг маалыматтары жок."
                                className="py-8"
                            />
                        )}
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel title="Аптанын студенти" description="Аптанын өзгөчөлөнгөн катышуучусу жана башкы беттеги мыктылар.">
                    {studentOfWeek ? (
                        <LeaderRow item={studentOfWeek} rank={1} />
                    ) : (
                        <DashboardEmptyState
                            title="Аптанын студенти жок"
                            subtitle="Бул багыт боюнча айырмаланган студент азырынча аныкталган жок."
                            className="py-8"
                        />
                    )}

                    <h3 className="mb-3 mt-5 text-base font-semibold text-edubot-ink dark:text-white">Башкы беттеги мыктылар</h3>
                    <div className="space-y-2">
                        {homepageItems.length ? (
                            homepageItems.map((item, idx) => (
                                <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                            ))
                        ) : (
                            <DashboardEmptyState
                                title="Башкы бет маалыматы жок"
                                subtitle="Тандалган багыт боюнча башкы бет лидерлери жок."
                                className="py-8"
                            />
                        )}
                    </div>
                </DashboardInsetPanel>
            </div>

            <DashboardInsetPanel title="Курс рейтинги" description="Тандалган курс ичиндеги мыктыларды салыштырыңыз.">
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex min-w-[260px] flex-col gap-2 text-sm font-medium text-edubot-ink dark:text-white">
                        <span>Курс</span>
                        <select
                            value={selectedCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            className="appearance-none rounded-2xl border border-edubot-line/80 bg-white/95 px-4 py-3 text-sm font-medium text-edubot-ink shadow-sm outline-none transition-all focus:border-edubot-orange focus:ring-2 focus:ring-edubot-orange/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <option value="">Курс тандаңыз</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {loadingCourseBoard ? <Loader fullScreen={false} /> : null}
                {courseBoardError ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" role="status">
                        {courseBoardError}
                    </div>
                ) : null}

                <div className="mt-4 space-y-2">
                    {!selectedCourseId ? (
                        <DashboardEmptyState
                            title="Курс тандалган жок"
                            subtitle="Ички курс рейтингин көрүү үчүн жогортон курс тандаңыз."
                            className="py-8"
                        />
                    ) : courseItems.length ? (
                        courseItems.map((item, idx) => (
                            <LeaderRow key={item?.studentId || idx} item={item} rank={idx + 1} />
                        ))
                    ) : (
                        <DashboardEmptyState
                            title="Маалымат жок"
                            subtitle="Бул курс жана багыт айкалышы боюнча рейтинг азырынча жеткиликсиз."
                            className="py-8"
                        />
                    )}
                </div>
            </DashboardInsetPanel>
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
