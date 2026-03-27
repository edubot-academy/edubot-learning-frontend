import { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiLayers, FiSearch } from 'react-icons/fi';
import { fetchInstructorCourses, fetchCourseGroups, fetchHomework, fetchHomeworkSummary } from '@services/api';
import Loader from '@shared/ui/Loader';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
} from '../components/ui/dashboard';
import { AuthContext } from '../context/AuthContext';

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

const formatDisplayDate = (value, fallback = 'Мөөнөт коюлган эмес') => {
    if (!value) return fallback;
    const normalized =
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('ky-KG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getHomeworkStateMeta = (item) => {
    const status = String(item?.status || '').toLowerCase();
    const rawDeadline = item?.deadline || item?.dueAt || item?.dueDate;

    if (['completed', 'approved', 'reviewed', 'checked'].includes(status)) {
        return {
            label: 'Текшерилген',
            tone: 'green',
            badgeClass:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }

    if (!rawDeadline) {
        return {
            label: 'Мөөнөт жок',
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const normalized =
        typeof rawDeadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline)
            ? `${rawDeadline}T23:59:59`
            : rawDeadline;
    const deadlineMs = new Date(normalized).getTime();
    if (Number.isNaN(deadlineMs)) {
        return {
            label: 'Белгисиз',
            tone: 'default',
            badgeClass:
                'border-edubot-line bg-white text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        };
    }

    const nowMs = Date.now();
    if (deadlineMs < nowMs) {
        return {
            label: 'Өтүп кеткен',
            tone: 'red',
            badgeClass:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }

    const daysLeft = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
        return {
            label: 'Жакында бүтөт',
            tone: 'amber',
            badgeClass:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }

    return {
        label: 'Активдүү',
        tone: 'blue',
        badgeClass:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    };
};

const InstructorHomework = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [limit, setLimit] = useState(20);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [summary, setSummary] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id || user.role !== 'instructor') return;
        const loadCourses = async () => {
            const response = await fetchInstructorCourses({ status: 'approved' });
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

    const enrichedItems = useMemo(
        () =>
            items.map((item) => ({
                ...item,
                stateMeta: getHomeworkStateMeta(item),
            })),
        [items]
    );

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return enrichedItems.filter((item) => {
            const matchesQuery =
                !normalizedQuery ||
                [
                    item.title,
                    item.name,
                    item.courseTitle,
                    item.course?.title,
                    item.groupName,
                    item.group?.name,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
            const matchesState =
                statusFilter === 'all' || item.stateMeta.label.toLowerCase() === statusFilter;
            return matchesQuery && matchesState;
        });
    }, [enrichedItems, query, statusFilter]);

    const stats = useMemo(
        () => ({
            total: summary?.total ?? items.length,
            pending: summary?.pending ?? summary?.todo ?? 0,
            checked: summary?.reviewed ?? summary?.checked ?? 0,
            overdue: enrichedItems.filter((item) => item.stateMeta.label === 'Өтүп кеткен').length,
        }),
        [summary, items.length, enrichedItems]
    );

    return (
        <div className="pt-24 p-4 md:p-6 max-w-7xl mx-auto space-y-5">
            <div className="dashboard-panel overflow-hidden p-6 md:p-8">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] xl:items-end">
                    <div className="space-y-4">
                        <div className="text-sm font-semibold uppercase tracking-[0.28em] text-edubot-orange">
                            Homework Workspace
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-edubot-ink dark:text-white md:text-5xl">
                            Үй тапшырмаларды башкаруу
                        </h1>
                        <p className="max-w-3xl text-base leading-8 text-edubot-muted dark:text-slate-300 md:text-lg">
                            Курс жана группа боюнча фильтрлеп, мөөнөтү жакындаган же өтүп кеткен
                            тапшырмаларды ылдам карап чыгыңыз.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <DashboardMetricCard label="Жалпы" value={stats.total} icon={FiBookOpen} />
                        <DashboardMetricCard
                            label="Күтүүдө"
                            value={stats.pending}
                            icon={FiClock}
                            tone="amber"
                        />
                        <DashboardMetricCard
                            label="Текшерилген"
                            value={stats.checked}
                            icon={FiCheckCircle}
                            tone="green"
                        />
                        <DashboardMetricCard
                            label="Өтүп кеткен"
                            value={stats.overdue}
                            icon={FiAlertCircle}
                            tone="red"
                        />
                    </div>
                </div>
            </div>

            <DashboardInsetPanel
                title="Фильтрлер"
                description="Тапшырмаларды курс, группа, абал жана издөө боюнча иреттеңиз."
            >
                <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr),minmax(0,0.9fr),minmax(0,0.8fr),minmax(0,0.7fr)]">
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="dashboard-field dashboard-select"
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
                        className="dashboard-field dashboard-select"
                        disabled={!courseId}
                    >
                        <option value="">Бардык группалар</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name || group.code}
                            </option>
                        ))}
                    </select>

                    <div className="relative">
                        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Издөө"
                            className="dashboard-field dashboard-field-icon pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="dashboard-field dashboard-select"
                    >
                        <option value="all">Баары</option>
                        <option value="активдүү">Активдүү</option>
                        <option value="жакында бүтөт">Жакында бүтөт</option>
                        <option value="өтүп кеткен">Өтүп кеткен</option>
                        <option value="текшерилген">Текшерилген</option>
                        <option value="мөөнөт жок">Мөөнөт жок</option>
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value || 20))}
                        className="dashboard-field"
                        placeholder="Лимит"
                    />
                </div>
            </DashboardInsetPanel>

            {loading ? <Loader fullScreen={false} /> : null}

            {!loading && filteredItems.length === 0 ? (
                <DashboardInsetPanel
                    title="Тапшырмалар"
                    description="Тандалган фильтрлер боюнча жыйынтык бул жерде чыгат."
                >
                    <EmptyState
                        title="Үй тапшырмалар табылган жок"
                        subtitle="Курс же группа фильтрлерин өзгөртүп көрүңүз же издөө суроосун тазалаңыз."
                        icon={<FiLayers className="h-8 w-8 text-edubot-orange" />}
                        className="py-8"
                    />
                </DashboardInsetPanel>
            ) : (
                <DashboardInsetPanel
                    title="Тапшырмалар"
                    description="Ар бир карточкада курс, группа, мөөнөт жана учурдагы абал көрсөтүлөт."
                    action={
                        <span className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {filteredItems.length} жазуу
                        </span>
                    }
                >
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredItems.map((item) => (
                            <article
                                key={item.id || `${item.title}-${item.deadline || ''}`}
                                className="dashboard-panel-muted rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-edubot-card"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {item.title || item.name || 'Үй тапшырма'}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                            {item.description || 'Түшүндүрмө кошула элек.'}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.stateMeta.badgeClass}`}
                                    >
                                        {item.stateMeta.label}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-edubot-muted dark:text-slate-400">
                                        <FiBookOpen className="h-4 w-4 text-edubot-orange" />
                                        <span>{item.courseTitle || item.course?.title || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-edubot-muted dark:text-slate-400">
                                        <FiLayers className="h-4 w-4 text-edubot-orange" />
                                        <span>{item.groupName || item.group?.name || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-edubot-muted dark:text-slate-400">
                                        <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                        <span>{formatDisplayDate(item.deadline)}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </DashboardInsetPanel>
            )}
        </div>
    );
};

export default InstructorHomework;
