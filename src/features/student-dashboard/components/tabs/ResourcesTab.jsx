import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiCalendar,
    FiDownload,
    FiEdit3,
    FiFileText,
    FiFilter,
    FiFolder,
    FiImage,
    FiMapPin,
    FiMessageSquare,
    FiPlayCircle,
    FiRadio,
    FiSearch,
    FiUsers,
    FiVideo,
} from 'react-icons/fi';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardWorkspaceHero,
    StatusBadge,
} from '../../../../components/ui/dashboard';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import BasicModal from '@shared/ui/BasicModal';
import { toast } from 'react-hot-toast';
import {
    courseTypeLabel,
    formatSessionDate,
} from '../../utils/studentDashboard.helpers.js';
import {
    fetchStudentSessionMaterialPreview,
    fetchStudentSessionMaterialMeta,
    fetchStudentSessionRecordingMeta,
} from '../../../student/api.js';

const MATERIAL_TYPE_META = {
    video: {
        label: 'Видео',
        icon: FiVideo,
    },
    image: {
        label: 'Сүрөт',
        icon: FiImage,
    },
    file: {
        label: 'Файл',
        icon: FiFileText,
    },
    link: {
        label: 'Шилтеме',
        icon: FiDownload,
    },
};

const ACTIVITY_TYPE_META = {
    discussion: { label: 'Талкуу', icon: FiMessageSquare },
    exercise: { label: 'Көнүгүү', icon: FiEdit3 },
    quiz: { label: 'Квиз', icon: FiFileText },
    group_work: { label: 'Топтук иш', icon: FiUsers },
};

const ACTIVITY_STATUS_META = {
    planned: {
        label: 'Пландалды',
        className:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    },
    active: {
        label: 'Жүрүп жатат',
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    },
    done: {
        label: 'Аяктады',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
};

const detectPreviewKind = (contentType = '', fallbackType = 'link') => {
    const normalized = String(contentType || '').toLowerCase();
    if (normalized.startsWith('video/')) return 'video';
    if (normalized.startsWith('image/')) return 'image';
    if (normalized.startsWith('audio/')) return 'audio';
    if (normalized.includes('pdf')) return 'pdf';
    if (normalized.startsWith('text/')) return 'text';
    return fallbackType === 'video' ? 'video' : 'download';
};

const ResourcesTab = ({ items, onOpenTasks }) => {
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [previewState, setPreviewState] = useState({
        open: false,
        title: '',
        objectUrl: '',
        kind: 'download',
        loading: false,
    });

    useEffect(
        () => () => {
            if (previewState.objectUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewState.objectUrl);
            }
        },
        [previewState.objectUrl]
    );

    const closePreview = useCallback(() => {
        setPreviewState((prev) => {
            if (prev.objectUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(prev.objectUrl);
            }
            return {
                open: false,
                title: '',
                objectUrl: '',
                kind: 'download',
                loading: false,
            };
        });
    }, []);

    const openMaterialPreview = useCallback(async (sessionId, materialIndex, title, fallbackType, directUrl = '') => {
        if (fallbackType === 'video' && directUrl) {
            try {
                const material = await fetchStudentSessionMaterialMeta(sessionId, materialIndex);
                const nextUrl = material?.url || directUrl;
                setPreviewState((prev) => {
                    if (prev.objectUrl?.startsWith('blob:')) {
                        URL.revokeObjectURL(prev.objectUrl);
                    }
                    return {
                        open: true,
                        title,
                        objectUrl: nextUrl,
                        kind: 'video',
                        loading: false,
                    };
                });
                return;
            } catch (error) {
                console.error('Failed to refresh student video material', error);
            }
        }

        setPreviewState({
            open: true,
            title,
            objectUrl: '',
            kind: fallbackType === 'video' ? 'video' : 'download',
            loading: true,
        });

        try {
            const result = await fetchStudentSessionMaterialPreview(sessionId, materialIndex);
            const objectUrl = URL.createObjectURL(result.blob);
            const kind = detectPreviewKind(result.contentType, fallbackType);

            setPreviewState((prev) => {
                if (prev.objectUrl) {
                    URL.revokeObjectURL(prev.objectUrl);
                }
                return {
                    open: true,
                    title,
                    objectUrl,
                    kind,
                    loading: false,
                };
            });
        } catch (error) {
            console.error('Failed to preview student material', error);
            toast.error('Материалды ачуу мүмкүн болбоду');
            closePreview();
        }
    }, [closePreview]);

    const openRecordingPreview = useCallback(async (sessionId, title, directUrl = '') => {
        try {
            const recording = await fetchStudentSessionRecordingMeta(sessionId);
            const nextUrl = recording?.recordingUrl || directUrl;
            setPreviewState((prev) => {
                if (prev.objectUrl?.startsWith('blob:')) {
                    URL.revokeObjectURL(prev.objectUrl);
                }
                return {
                    open: true,
                    title,
                    objectUrl: nextUrl,
                    kind: 'video',
                    loading: false,
                };
            });
        } catch (error) {
            console.error('Failed to refresh student recording preview', error);
            if (directUrl) {
                setPreviewState((prev) => {
                    if (prev.objectUrl?.startsWith('blob:')) {
                        URL.revokeObjectURL(prev.objectUrl);
                    }
                    return {
                        open: true,
                        title,
                        objectUrl: directUrl,
                        kind: 'video',
                        loading: false,
                    };
                });
                return;
            }
            toast.error('Жазууну ачуу мүмкүн болбоду');
        }
    }, []);

    const resourceView = useMemo(
        () =>
            items.map((item) => {
                const materials = Array.isArray(item.materials) ? item.materials : [];
                const hasRecording = Boolean(item.recordingUrl);
                const hasJoin = Boolean(item.liveJoinUrl);
                const hasLocation = Boolean(item.location);

                return {
                    ...item,
                    materials,
                    hasRecording,
                    hasJoin,
                    hasLocation,
                    assetCount: materials.length + (hasRecording ? 1 : 0),
                };
            }),
        [items]
    );

    const stats = useMemo(() => {
        const sessions = resourceView.length;
        const materials = resourceView.reduce((acc, item) => acc + item.materials.length, 0);
        const recordings = resourceView.filter((item) => item.hasRecording).length;
        const live = resourceView.filter((item) => item.courseType === 'online_live').length;
        return { sessions, materials, recordings, live };
    }, [resourceView]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return resourceView.filter((item) => {
            if (typeFilter !== 'all' && item.courseType !== typeFilter) return false;
            if (!normalizedQuery) return true;

            return [
                item.courseTitle,
                item.groupName,
                item.sessionTitle,
                item.location,
                ...item.materials.map((material) => material.title),
                ...(Array.isArray(item.activities)
                    ? item.activities.flatMap((activity) => [
                          activity.title,
                          activity.description,
                          ...(Array.isArray(activity.questions)
                              ? activity.questions.flatMap((question) => [
                                    question.prompt,
                                    ...(Array.isArray(question.options)
                                        ? question.options.map((option) => option.text)
                                        : []),
                                ])
                              : []),
                      ])
                    : []),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [query, resourceView, typeFilter]);

    useEffect(() => {
        if (!filteredItems.length) {
            setSelectedSessionId('');
            return;
        }

        const hasSelected = filteredItems.some(
            (item) => String(item.sessionId) === String(selectedSessionId)
        );
        if (hasSelected) return;

        const now = Date.now();
        const upcoming = filteredItems
            .filter((item) => item.startsAt && new Date(item.startsAt).getTime() >= now)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        const fallback = upcoming[0] || filteredItems[0];
        setSelectedSessionId(String(fallback.sessionId));
    }, [filteredItems, selectedSessionId]);

    const selectedItem = useMemo(
        () =>
            filteredItems.find((item) => String(item.sessionId) === String(selectedSessionId)) ||
            filteredItems[0] ||
            null,
        [filteredItems, selectedSessionId]
    );

    const sessionOptions = useMemo(
        () =>
            filteredItems.map((item) => ({
                value: String(item.sessionId),
                label: `${item.sessionTitle} • ${formatSessionDate(item.startsAt)}`,
            })),
        [filteredItems]
    );

    if (!resourceView.length) {
        return (
            <DashboardWorkspaceHero
                className="dashboard-panel"
                eyebrow="Student Resources"
                title="Ресурстар"
                description="Сессия материалдары, жазуулар жана live join маалыматтары ушул жерге чогулат."
            >
                <div className="p-6">
                    <StudentPanelEmpty
                        icon={FiFolder}
                        title="Азырынча ресурс жок"
                        description="Материалдар же жазуулар кошулганда, алар бул жерде көрүнөт."
                    />
                </div>
            </DashboardWorkspaceHero>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardWorkspaceHero
                className="dashboard-panel"
                eyebrow="Student Resources"
                title="Сессия ресурстары"
                description="Мугалим бөлүшкөн материалдарды, сабак жазууларын жана кошулуу маалыматтарын бир жерден табыңыз."
                metrics={
                    <>
                        <DashboardMetricCard label="Сессиялар" value={stats.sessions} icon={FiCalendar} />
                        <DashboardMetricCard label="Материалдар" value={stats.materials} icon={FiFolder} tone="blue" />
                        <DashboardMetricCard label="Жазуулар" value={stats.recordings} icon={FiVideo} tone="green" />
                        <DashboardMetricCard label="Live" value={stats.live} icon={FiRadio} tone="amber" />
                    </>
                }
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)]">
                    <label className="relative block">
                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Сессия, курс же материал боюнча издөө"
                            className="dashboard-field dashboard-field-icon"
                        />
                    </label>

                    <label className="relative block">
                        <FiFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="dashboard-field dashboard-field-icon dashboard-select"
                        >
                            <option value="all">Бардык типтер</option>
                            <option value="offline">Оффлайн</option>
                            <option value="online_live">Онлайн түз эфир</option>
                        </select>
                    </label>
                </DashboardFilterBar>

                <div className="space-y-4 pt-5">
                    {filteredItems.length && selectedItem ? (
                        <>
                            <DashboardInsetPanel
                                title="Сессияны тандаңыз"
                                description="Бир сессияны тандап, анын материалдарын жана жазууларын көрүңүз."
                            >
                                <div className="space-y-3">
                                    <select
                                        value={selectedSessionId}
                                        onChange={(e) => setSelectedSessionId(e.target.value)}
                                        className="dashboard-field dashboard-select"
                                    >
                                        {sessionOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {filteredItems.length > 1 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {filteredItems.slice(0, 6).map((item) => (
                                                <button
                                                    key={`chip-${item.sessionId}`}
                                                    type="button"
                                                    onClick={() => setSelectedSessionId(String(item.sessionId))}
                                                    className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                                                        String(item.sessionId) === String(selectedSessionId)
                                                            ? 'bg-edubot-orange text-white'
                                                            : 'border border-edubot-line bg-white text-edubot-ink hover:border-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {item.sessionTitle}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </DashboardInsetPanel>

                            <section className="dashboard-panel-muted p-5">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                {selectedItem.sessionTitle}
                                            </h3>
                                            <StatusBadge tone="default">
                                                {courseTypeLabel(selectedItem.courseType)}
                                            </StatusBadge>
                                            {selectedItem.status === 'completed' ? (
                                                <StatusBadge tone="default">Жабылды</StatusBadge>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-edubot-muted dark:text-slate-400">
                                            <span className="inline-flex items-center gap-2">
                                                <FiCalendar className="h-4 w-4" />
                                                {formatSessionDate(selectedItem.startsAt)}
                                            </span>
                                            <span>{selectedItem.courseTitle || 'Курс'}</span>
                                            {selectedItem.groupName ? <span>{selectedItem.groupName}</span> : null}
                                            {selectedItem.instructorName ? <span>{selectedItem.instructorName}</span> : null}
                                            {selectedItem.hasLocation ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <FiMapPin className="h-4 w-4" />
                                                    {selectedItem.location}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="w-full xl:w-[16rem]">
                                        <DashboardInsetPanel
                                            title="Тез аракеттер"
                                            description="Бул сессияга тиешелүү негизги шилтемелер."
                                        >
                                            <div className="space-y-3">
                                                {selectedItem.liveJoinUrl ? (
                                                    <a
                                                        href={selectedItem.liveJoinUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="dashboard-button-primary w-full"
                                                    >
                                                        <FiPlayCircle className="h-4 w-4" />
                                                        Сабакка кошулуу
                                                    </a>
                                                ) : null}
                                                {selectedItem.recordingUrl ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openRecordingPreview(
                                                                selectedItem.sessionId,
                                                                `${selectedItem.sessionTitle} — Жазуу`,
                                                                selectedItem.recordingUrl
                                                            )
                                                        }
                                                        className="dashboard-button-secondary w-full"
                                                    >
                                                        <FiVideo className="h-4 w-4" />
                                                        Жазууну көрүү
                                                    </button>
                                                ) : null}
                                                {!selectedItem.liveJoinUrl && !selectedItem.recordingUrl ? (
                                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                        Азырынча түз аракет жок.
                                                    </div>
                                                ) : null}
                                            </div>
                                        </DashboardInsetPanel>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
                                    <DashboardInsetPanel
                                        title="Материалдар"
                                        description={
                                            selectedItem.materials.length
                                                ? `${selectedItem.materials.length} материал жеткиликтүү`
                                                : 'Бул сессияга материал азырынча кошулган эмес'
                                        }
                                    >
                                        {selectedItem.materials.length ? (
                                            <div className="space-y-3">
                                                {selectedItem.materials.map((material, index) => {
                                                    const meta =
                                                        MATERIAL_TYPE_META[material.type] ||
                                                        MATERIAL_TYPE_META.link;
                                                    const Icon = meta.icon;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={`${selectedItem.sessionId}-material-${index}`}
                                                            onClick={() =>
                                                                openMaterialPreview(
                                                                    selectedItem.sessionId,
                                                                    index,
                                                                    material.title,
                                                                    material.type,
                                                                    material.url
                                                                )
                                                            }
                                                            className="flex items-center justify-between gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-sm transition hover:border-edubot-orange dark:border-slate-700 dark:bg-slate-900"
                                                        >
                                                            <span className="inline-flex min-w-0 items-center gap-3">
                                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                                                    <Icon className="h-4 w-4" />
                                                                </span>
                                                                <span className="min-w-0">
                                                                    <span className="block truncate font-medium text-edubot-ink dark:text-white">
                                                                        {material.title}
                                                                    </span>
                                                                    <span className="block text-xs text-edubot-muted dark:text-slate-400">
                                                                        {meta.label}
                                                                    </span>
                                                                </span>
                                                            </span>
                                                            {material.type === 'video' ? (
                                                                <FiPlayCircle className="h-4 w-4 shrink-0 text-edubot-muted" />
                                                            ) : (
                                                                <FiDownload className="h-4 w-4 shrink-0 text-edubot-muted" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                Бул сессия үчүн материал азырынча жок.
                                            </div>
                                        )}
                                    </DashboardInsetPanel>

                                    <DashboardInsetPanel
                                        title="Жазуу жана контекст"
                                        description="Жазуулар жана логистикалык маалымат."
                                    >
                                        <div className="space-y-3 text-sm">
                                            {selectedItem.recordingUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRecordingPreview(
                                                            selectedItem.sessionId,
                                                            `${selectedItem.sessionTitle} — Жазуу`,
                                                            selectedItem.recordingUrl
                                                        )
                                                    }
                                                    className="flex items-center justify-between gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 font-medium text-edubot-ink transition hover:border-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                >
                                                    <span className="inline-flex items-center gap-3">
                                                        <FiVideo className="h-4 w-4" />
                                                        Сабактын жазуусу
                                                    </span>
                                                    <FiPlayCircle className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                                    Жазуу азырынча жок.
                                                </div>
                                            )}

                                            {selectedItem.courseType === 'offline' ? (
                                                <div className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    <div className="font-medium text-edubot-ink dark:text-white">
                                                        Оффлайн жолугушуу
                                                    </div>
                                                    <div className="mt-1">
                                                        {selectedItem.location || 'Жайгашкан жер али көрсөтүлгөн эмес.'}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </DashboardInsetPanel>
                                </div>

                                <DashboardInsetPanel
                                    title="Сессиядагы иштер"
                                    description="Мугалим ушул сессия үчүн белгилеген иштер. Контекст бул жерде көрүнөт, аткаруу болсо `Тапшырмалар` бөлүмүндө жүрөт."
                                >
                                    {Array.isArray(selectedItem.activities) && selectedItem.activities.length ? (
                                        <div className="mt-4 space-y-3">
                                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                                                Бул бөлүмдө сессия иштери көрүнөт. Аткарыла турган quiz жана башка иштер `Тапшырмалар` бөлүмүндө ачылат.
                                            </div>
                                            {selectedItem.activities.map((activity, index) => {
                                                const typeMeta = ACTIVITY_TYPE_META[activity.type] || ACTIVITY_TYPE_META.discussion;
                                                const statusMeta = ACTIVITY_STATUS_META[activity.status] || ACTIVITY_STATUS_META.planned;
                                                const Icon = typeMeta.icon;
                                                const isActionable = activity.status === 'active';
                                                const isClosed = activity.status === 'done';
                                                return (
                                                    <div
                                                        key={`${selectedItem.sessionId}-activity-${index}`}
                                                        className="rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                                    >
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                    <Icon className="h-4 w-4 text-edubot-orange" />
                                                                    {activity.title}
                                                                </div>
                                                                {activity.description ? (
                                                                    <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                                        {activity.description}
                                                                    </p>
                                                                ) : null}

                                                                {activity.type === 'quiz' &&
                                                                Array.isArray(activity.questions) &&
                                                                activity.questions.length ? (
                                                                    <div className="mt-3 rounded-2xl border border-edubot-line/70 bg-edubot-surface/60 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="rounded-full border border-edubot-line/80 bg-white px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                                                {activity.questions.length} суроо
                                                                            </span>
                                                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                                                                Жооптор `Тапшырмалар` бөлүмүндө ачылат
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-3 space-y-2">
                                                                            {activity.questions.slice(0, 3).map((question, questionIndex) => (
                                                                                <div
                                                                                    key={`${selectedItem.sessionId}-activity-${index}-question-${question.id || questionIndex}`}
                                                                                    className="rounded-xl border border-edubot-line/60 bg-white/80 px-3 py-2 text-sm text-edubot-ink dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                                                                >
                                                                                    <span className="font-semibold">Суроо #{questionIndex + 1}:</span>{' '}
                                                                                    {question.prompt}
                                                                                </div>
                                                                            ))}
                                                                            {activity.questions.length > 3 ? (
                                                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                                                    Дагы {activity.questions.length - 3} суроо бар. Толук аткаруу үчүн `Тапшырмалар` бөлүмүнө өтүңүз.
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                ) : null}

                                                                {isActionable ? (
                                                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                                                        <div className="text-sm text-edubot-muted dark:text-slate-400">
                                                                            Бул ишти аткаруу үчүн `Тапшырмалар` бөлүмүнө өтүңүз.
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={onOpenTasks}
                                                                            className="inline-flex items-center rounded-full border border-edubot-orange/30 bg-edubot-orange/10 px-3 py-1.5 text-sm font-semibold text-edubot-orange transition hover:border-edubot-orange hover:bg-edubot-orange/15 dark:border-edubot-orange/40 dark:bg-edubot-orange/15"
                                                                        >
                                                                            Тапшырмалардан ачуу
                                                                        </button>
                                                                    </div>
                                                                ) : null}

                                                                {isClosed ? (
                                                                    <div className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                                                        Бул иш жабык. Эгер жообуңуз же натыйжаңыз болсо, ал `Тапшырмалар` бөлүмүндө көрүнөт.
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="rounded-full border border-edubot-orange/30 bg-edubot-orange/10 px-3 py-1 text-xs font-semibold text-edubot-orange dark:border-edubot-orange/40 dark:bg-edubot-orange/15">
                                                                    {typeMeta.label}
                                                                </span>
                                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                                                                    {statusMeta.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/70 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                            Бул сессия үчүн өзүнчө иштер азырынча кошулган эмес.
                                        </div>
                                    )}
                                </DashboardInsetPanel>
                            </section>
                        </>
                    ) : (
                        <StudentPanelEmpty
                            icon={FiSearch}
                            title="Ресурс табылган жок"
                            description="Издөө же фильтрди өзгөртүп көрүңүз."
                        />
                    )}
                </div>
            </DashboardWorkspaceHero>

            <BasicModal
                isOpen={previewState.open}
                onClose={closePreview}
                title={previewState.title || 'Ресурс'}
                size="2xl"
            >
                {previewState.loading ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        Жүктөлүүдө...
                    </div>
                ) : !previewState.objectUrl ? (
                    <div className="flex min-h-[16rem] items-center justify-center text-sm text-edubot-muted dark:text-slate-400">
                        Алдын ала көрүү жеткиликтүү эмес.
                    </div>
                ) : previewState.kind === 'video' ? (
                    <div className="flex justify-center">
                        <video
                            controls
                            preload="metadata"
                            className="max-h-[70vh] w-full rounded-2xl bg-black"
                            src={previewState.objectUrl}
                        >
                            Сиздин браузер видеону колдобойт.
                        </video>
                    </div>
                ) : previewState.kind === 'image' ? (
                    <div className="flex justify-center">
                        <img
                            src={previewState.objectUrl}
                            alt={previewState.title}
                            className="max-h-[70vh] rounded-2xl object-contain"
                        />
                    </div>
                ) : previewState.kind === 'pdf' ? (
                    <iframe
                        src={previewState.objectUrl}
                        title={previewState.title}
                        className="h-[70vh] w-full rounded-2xl border border-edubot-line dark:border-slate-700"
                    />
                ) : previewState.kind === 'audio' ? (
                    <div className="flex min-h-[12rem] items-center justify-center">
                        <audio controls src={previewState.objectUrl} className="w-full max-w-xl" />
                    </div>
                ) : previewState.kind === 'text' ? (
                    <iframe
                        src={previewState.objectUrl}
                        title={previewState.title}
                        className="h-[60vh] w-full rounded-2xl border border-edubot-line dark:border-slate-700"
                    />
                ) : (
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                            Бул файлды браузерде түз көрүү жеткиликтүү эмес.
                        </p>
                        <a
                            href={previewState.objectUrl}
                            download
                            className="dashboard-button-primary inline-flex"
                        >
                            <FiDownload className="h-4 w-4" />
                            Жүктөп алуу
                        </a>
                    </div>
                )}
            </BasicModal>
        </div>
    );
};

ResourcesTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    onOpenTasks: PropTypes.func,
};

ResourcesTab.defaultProps = {
    items: [],
    onOpenTasks: () => {},
};

export default ResourcesTab;
