import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiExternalLink, FiPaperclip, FiPlayCircle } from 'react-icons/fi';
import { COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';
import { DashboardInsetPanel, EmptyState } from '../../../components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import { toast } from 'react-hot-toast';

const VideoPlayer = lazy(() => import('@shared/VideoPlayer'));

const VIDEO_EXTENSIONS = ['.mp4', '.m3u8', '.webm', '.mov', '.m4v', '.ogg'];

const isVideoMaterial = (item) => {
    const candidate = String(item?.storageKey || item?.url || '').toLowerCase();
    return VIDEO_EXTENSIONS.some((extension) => candidate.includes(extension));
};

const isUploadedMaterial = (item) => Boolean(item?.storageKey);

const isValidHttpUrl = (value) => {
    if (!value) return false;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const SessionResourcesTab = ({
    availableCourseAssets,
    deletingMeeting,
    importZoomAttendanceToSession,
    importingAttendance,
    joinLiveSession,
    loadingCourseAssets,
    loadingMeetingState,
    meetingId,
    meetingJoinUrl,
    meetingProvider,
    onAddCourseAsset,
    onSourceVideoCourseChange,
    onSaveMaterials,
    onUploadMaterialFile,
    publishedVideoCourses,
    removeMeeting,
    restoreMeetingState,
    saveMeetingLink,
    savingMaterials,
    savingMeeting,
    showCourseAssetReuse,
    selectedDeliveryType,
    selectedSourceVideoCourseId,
    selectedGroupLocation,
    selectedSessionId,
    selectedSessionJoinAllowed,
    selectedSessionJoinUrl,
    selectedSessionMaterials,
    selectedSessionMode,
    selectedSessionRecordingUrl,
    setMeetingJoinUrl,
    setMeetingProvider,
    syncZoomRecordingsToSession,
    syncingRecordings,
    uploadingMaterialFile,
}) => {
    const isOnlineLive = selectedDeliveryType === COURSE_TYPE.ONLINE_LIVE;
    const fileInputRef = useRef(null);
    const previewContainerRef = useRef(null);
    const [materialDraft, setMaterialDraft] = useState({ title: '', url: '', storageKey: '' });
    const [materialComposerMode, setMaterialComposerMode] = useState('idle');
    const [editingMaterialIndex, setEditingMaterialIndex] = useState(-1);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
    const [inlineNotice, setInlineNotice] = useState(null);
    const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
    const [courseAssetQuery, setCourseAssetQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const existingMaterialKeys = new Set(
        selectedSessionMaterials
            .map((item) => item?.storageKey)
            .filter((value) => typeof value === 'string' && value.trim())
    );

    useEffect(() => {
        setMaterialDraft({ title: '', url: '', storageKey: '' });
        setMaterialComposerMode('idle');
        setEditingMaterialIndex(-1);
        setPreviewVideo(null);
        setInlineNotice(null);
        setIsAssetLibraryOpen(false);
        setPendingDeleteIndex(null);
    }, [selectedSessionId]);

    useEffect(() => {
        setCourseAssetQuery('');
    }, [selectedSourceVideoCourseId]);

    const groupedCourseAssets = useMemo(() => {
        const query = courseAssetQuery.trim().toLowerCase();
        const filtered = availableCourseAssets.filter((asset) => {
            if (!query) return true;

            return [asset.title, asset.lessonTitle, asset.sectionTitle]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });

        const groups = filtered.reduce((acc, asset) => {
            const sectionKey = asset.sectionTitle || 'Бөлүм жок';
            const existingGroup = acc.find((item) => item.sectionTitle === sectionKey);
            if (existingGroup) {
                existingGroup.assets.push(asset);
            } else {
                acc.push({
                    sectionTitle: sectionKey,
                    assets: [asset],
                });
            }
            return acc;
        }, []);

        return groups;
    }, [availableCourseAssets, courseAssetQuery]);

    useEffect(() => {
        setExpandedSections((prev) => {
            const next = {};
            groupedCourseAssets.forEach((group, index) => {
                next[group.sectionTitle] = prev[group.sectionTitle] ?? index === 0;
            });
            return next;
        });
    }, [groupedCourseAssets]);

    const attachedCourseAssetCount = useMemo(
        () =>
            availableCourseAssets.reduce((count, asset) => {
                if (asset?.storageKey && existingMaterialKeys.has(asset.storageKey)) {
                    return count + 1;
                }
                return count;
            }, 0),
        [availableCourseAssets, existingMaterialKeys]
    );

    const toggleSection = (sectionTitle) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle],
        }));
    };

    const copyToClipboard = async (value, successMessage) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(successMessage);
        } catch {
            toast.error('Шилтемени көчүрүү мүмкүн болгон жок.');
        }
    };

    const startEditMaterial = (item, index) => {
        setMaterialDraft({
            title: item?.title || '',
            url: isUploadedMaterial(item) ? '' : item?.url || '',
            storageKey: item?.storageKey || '',
        });
        setMaterialComposerMode('idle');
        setEditingMaterialIndex(index);
        setInlineNotice(null);
    };

    const resetMaterialForm = () => {
        setMaterialDraft({ title: '', url: '', storageKey: '' });
        setMaterialComposerMode('idle');
        setEditingMaterialIndex(-1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const beginLinkAdd = () => {
        setInlineNotice(null);
        setMaterialDraft({ title: '', url: '', storageKey: '' });
        setEditingMaterialIndex(-1);
        setMaterialComposerMode('link');
    };

    const submitNewLink = async () => {
        const title = materialDraft.title.trim();
        const url = materialDraft.url.trim();

        if (!title || !url) return;
        if (!isValidHttpUrl(url)) {
            setInlineNotice({
                tone: 'warning',
                message: 'Шилтеме `http://` же `https://` менен башталышы керек.',
            });
            return;
        }

        const nextMaterials = [...selectedSessionMaterials];
        nextMaterials.push({
            title,
            url,
            storageKey: materialDraft.storageKey || undefined,
        });

        const saved = await onSaveMaterials(nextMaterials, { suppressSuccessToast: true });
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: `"${title}" материалы сессияга кошулду.`,
            });
            resetMaterialForm();
        }
    };

    const saveEditedMaterial = async (index) => {
        const title = materialDraft.title.trim();
        const currentItem = selectedSessionMaterials[index];
        if (!currentItem || !title) return;

        const nextMaterials = [...selectedSessionMaterials];
        nextMaterials[index] = {
            title,
            url: isUploadedMaterial(currentItem) ? currentItem.url : materialDraft.url.trim(),
            storageKey: currentItem.storageKey || undefined,
        };

        if (!nextMaterials[index].url) return;
        if (!isUploadedMaterial(currentItem) && !isValidHttpUrl(nextMaterials[index].url)) {
            setInlineNotice({
                tone: 'warning',
                message: 'Шилтеме `http://` же `https://` менен башталышы керек.',
            });
            return;
        }

        const saved = await onSaveMaterials(nextMaterials, { suppressSuccessToast: true });
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: `"${title}" материалы жаңыртылды.`,
            });
            resetMaterialForm();
        }
    };

    const deleteMaterial = async (index) => {
        const deletedTitle = selectedSessionMaterials[index]?.title || 'Материал';
        const nextMaterials = selectedSessionMaterials.filter((_, itemIndex) => itemIndex !== index);
        const saved = await onSaveMaterials(nextMaterials, { suppressSuccessToast: true });
        if (saved && editingMaterialIndex === index) {
            resetMaterialForm();
        }
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: `"${deletedTitle}" материалдардан өчүрүлдү.`,
            });
        }
    };

    const confirmDeleteMaterial = async () => {
        if (pendingDeleteIndex === null || pendingDeleteIndex < 0) return;
        const targetIndex = pendingDeleteIndex;
        setPendingDeleteIndex(null);
        await deleteMaterial(targetIndex);
    };

    const handleUploadMaterialFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const uploaded = await onUploadMaterialFile(file);
        if (uploaded) {
            setInlineNotice({
                tone: 'success',
                message: `"${uploaded.title || file.name}" файлы материалдарга кошулду.`,
            });
            resetMaterialForm();
        }
    };

    const handleAddCourseAsset = async (asset) => {
        const saved = await onAddCourseAsset(asset);
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: `"${asset.title}" видеосу сессияга кошулду.`,
            });
        }
        return saved;
    };

    if (!selectedSessionId) {
        return (
            <EmptyState
                title="Ресурстар үчүн сессия тандаңыз"
                subtitle="Материалдар, жолугушуу шилтемеси жана жазуу ушул активдүү сессияга байланат."
                icon={<FiPaperclip className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-4">
                <DashboardInsetPanel
                    title="Сабак материалдары"
                    description="Сессияга керектүү шилтемелерди, файлдарды жана кайра колдонулган видеолорду ушул жерден башкарыңыз."
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleUploadMaterialFile}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.json,.txt,.csv,.jpg,.jpeg,.png,.webp,.mp4,.m3u8,.webm,.mov,.m4v,.ogg"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setInlineNotice(null);
                                    fileInputRef.current?.click();
                                }}
                                disabled={uploadingMaterialFile}
                                className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {uploadingMaterialFile ? 'Файл жүктөлүүдө...' : 'Файл жүктөө'}
                            </button>
                            <button
                                type="button"
                                onClick={beginLinkAdd}
                                className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                Шилтеме кошуу
                            </button>
                            {showCourseAssetReuse && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssetLibraryOpen(true)}
                                    className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    Курстан видео кошуу
                                </button>
                            )}
                        </div>
                    }
                >
                    <div className="mt-4 space-y-4">
                        {inlineNotice && (
                            <div
                                className={`rounded-2xl border px-4 py-3 text-sm ${
                                    inlineNotice.tone === 'success'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                                }`}
                            >
                                {inlineNotice.message}
                            </div>
                        )}

                        {materialComposerMode !== 'idle' && (
                            <div className="rounded-3xl border border-edubot-line/70 bg-edubot-surface/55 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                                <div className="mb-3">
                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        Жаңы шилтеме кошуу
                                    </div>
                                    <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Сессияга тышкы шилтемени аталышы менен кошуңуз.
                                    </div>
                                </div>
                                <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr),auto]">
                                    <input
                                        value={materialDraft.title}
                                        onChange={(e) =>
                                            setMaterialDraft((prev) => ({ ...prev, title: e.target.value }))
                                        }
                                        placeholder="Материал аталышы"
                                        className="dashboard-field"
                                    />
                                    <input
                                        value={materialDraft.url}
                                        onChange={(e) =>
                                            setMaterialDraft((prev) => ({ ...prev, url: e.target.value }))
                                        }
                                        placeholder="https://..."
                                        className="dashboard-field"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={submitNewLink}
                                            disabled={
                                                !materialDraft.title.trim() ||
                                                !materialDraft.url.trim() ||
                                                savingMaterials
                                            }
                                            className="dashboard-button-primary disabled:opacity-60"
                                        >
                                            {savingMaterials ? 'Сакталып жатат...' : 'Сактоо'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetMaterialForm}
                                            className="dashboard-button-secondary"
                                        >
                                            Жокко чыгаруу
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedSessionMaterials.length ? (
                            selectedSessionMaterials.map((item, index) => (
                                <div
                                    key={item.storageKey || `${item.title}-${index}`}
                                    className="flex items-center justify-between rounded-2xl border border-edubot-line/70 bg-white px-4 py-3 text-sm transition hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    {editingMaterialIndex === index ? (
                                        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        value={materialDraft.title}
                                                        onChange={(e) =>
                                                            setMaterialDraft((prev) => ({
                                                                ...prev,
                                                                title: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Материал аталышы"
                                                        className="dashboard-field"
                                                    />
                                                    {isVideoMaterial(item) && (
                                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                                                            Видео
                                                        </span>
                                                    )}
                                                </div>
                                                {isUploadedMaterial(item) ? (
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        Жүктөлгөн файл үчүн шилтеме өзгөртүлбөйт.
                                                    </div>
                                                ) : (
                                                    <input
                                                        value={materialDraft.url}
                                                        onChange={(e) =>
                                                            setMaterialDraft((prev) => ({
                                                                ...prev,
                                                                url: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="https://..."
                                                        className="dashboard-field"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => saveEditedMaterial(index)}
                                                    disabled={
                                                        !materialDraft.title.trim() ||
                                                        (!isUploadedMaterial(item) &&
                                                            !materialDraft.url.trim()) ||
                                                        savingMaterials
                                                    }
                                                    className="dashboard-button-primary disabled:opacity-60"
                                                >
                                                    {savingMaterials ? 'Сакталып жатат...' : 'Сактоо'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetMaterialForm}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Жокко чыгаруу
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-medium text-edubot-ink dark:text-white">
                                                        {item.title}
                                                    </div>
                                                    {isVideoMaterial(item) && (
                                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                                                            Видео
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {item.storageKey ? 'Жүктөлгөн файл' : 'Тышкы шилтеме'}
                                                </div>
                                            </div>
                                            <div className="ml-3 flex flex-wrap items-center gap-2">
                                                {isVideoMaterial(item) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewVideo({ title: item.title, url: item.url })
                                                        }
                                                        className="dashboard-button-primary"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiPlayCircle className="h-4 w-4" />
                                                            Ойнотуу
                                                        </span>
                                                    </button>
                                                )}
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="dashboard-button-secondary"
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiExternalLink className="h-4 w-4" />
                                                        Ачуу
                                                    </span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditMaterial(item, index)}
                                                    className="text-xs font-semibold text-edubot-muted transition hover:text-edubot-orange dark:text-slate-400 dark:hover:text-edubot-orange"
                                                >
                                                    Атын өзгөртүү
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPendingDeleteIndex(index)}
                                                    disabled={savingMaterials}
                                                    className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60 dark:text-red-300"
                                                >
                                                    Өчүрүү
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                Бул сессияга материал сакталган эмес.
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>

            </div>

            {isOnlineLive ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title="Түз эфир сабак"
                        description="Сессияга байланган meeting шилтемесин сактап, сабак учурунда ошол эле жерден кириңиз."
                    >
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Платформа
                                    </label>
                                    <select
                                        value={meetingProvider}
                                        onChange={(e) => setMeetingProvider(e.target.value)}
                                        className="dashboard-field dashboard-select"
                                    >
                                        {Object.values(MEETING_PROVIDER).map((provider) => (
                                            <option key={provider} value={provider}>
                                                {provider}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        Join URL
                                    </label>
                                    <input
                                        value={meetingJoinUrl}
                                        onChange={(e) => setMeetingJoinUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="dashboard-field"
                                    />
                                </div>
                            </div>

                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Meeting абалы
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedSessionJoinUrl
                                        ? 'Join шилтемеси сакталган жана сабакка кирүүгө даяр.'
                                        : 'Бул сессия үчүн join шилтемеси сакталган эмес.'}
                                </div>
                                {meetingId && (
                                    <div className="mt-2 text-xs text-edubot-muted dark:text-slate-500">
                                        Meeting ID: {meetingId}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={saveMeetingLink}
                                    disabled={!selectedSessionId || savingMeeting}
                                    className="dashboard-button-primary disabled:opacity-60"
                                >
                                    {savingMeeting
                                        ? 'Сакталууда...'
                                        : meetingId
                                          ? 'Meeting жаңыртуу'
                                          : 'Meeting түзүү'}
                                </button>
                                <button
                                    onClick={() => joinLiveSession(meetingJoinUrl || selectedSessionJoinUrl)}
                                    disabled={
                                        !(meetingJoinUrl || selectedSessionJoinUrl) ||
                                        !selectedSessionJoinAllowed
                                    }
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    Сабакка кирүү
                                </button>
                                {selectedSessionJoinUrl && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(selectedSessionJoinUrl, 'Join шилтемеси көчүрүлдү.')
                                        }
                                        className="dashboard-button-secondary"
                                    >
                                        Шилтемени көчүрүү
                                    </button>
                                )}
                                <button
                                    onClick={removeMeeting}
                                    disabled={!selectedSessionId || deletingMeeting}
                                    className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300"
                                >
                                    {deletingMeeting ? 'Өчүрүлүүдө...' : 'Meeting өчүрүү'}
                                </button>
                            </div>

                            {!selectedSessionJoinAllowed && selectedSessionMode !== 'completed' && (
                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                    Join 10 мүнөт калганда гана жеткиликтүү.
                                </div>
                            )}
                        </div>
                    </DashboardInsetPanel>
                </div>
            ) : (
                <DashboardInsetPanel
                    title="Сессия форматы"
                    description="Бул сессия онлайн live эмес, ошондуктан meeting башкаруу бул жерде көрсөтүлбөйт."
                >
                    <div className="mt-4 space-y-3">
                        <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                            <div className="font-medium text-edubot-ink dark:text-white">
                                Формат
                            </div>
                            <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                {selectedDeliveryType === COURSE_TYPE.OFFLINE
                                    ? 'Оффлайн сессия'
                                    : 'Live meeting талап кылынбайт'}
                            </div>
                        </div>
                        {selectedDeliveryType === COURSE_TYPE.OFFLINE && (
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Локация
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedGroupLocation || 'Локация көрсөтүлгөн эмес'}
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>
            )}

            {isOnlineLive && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title="Жазуу"
                        description="Сессияга сакталган recording шилтемеси ушул жерде көрүнөт. Zoom синхрондолсо session field дагы жаңыланат."
                    >
                        <div className="mt-4 space-y-4">
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    Жазуу абалы
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedSessionRecordingUrl
                                        ? 'Сессияга байланышкан жазуу табылды.'
                                        : 'Бул сессия үчүн жазуу шилтемеси азырынча жок.'}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={syncZoomRecordingsToSession}
                                    disabled={!selectedSessionId || syncingRecordings}
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    {syncingRecordings ? 'Синхрондолууда...' : 'Zoom жазууларын синхрондоо'}
                                </button>
                                {selectedSessionRecordingUrl && (
                                    <a
                                        href={selectedSessionRecordingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="dashboard-button-primary"
                                    >
                                        Recording ачуу
                                    </a>
                                )}
                                {selectedSessionRecordingUrl && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(
                                                selectedSessionRecordingUrl,
                                                'Жазуу шилтемеси көчүрүлдү.'
                                            )
                                        }
                                        className="dashboard-button-secondary"
                                    >
                                        Шилтемени көчүрүү
                                    </button>
                                )}
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="Интеграция куралдары"
                        description="Бул util аракеттер сабак агымынан тышкары колдонулат. Көбүнчө Zoom импорт же калыбына келтирүү керек болгондо гана."
                    >
                        <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-edubot-surface/40 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                            <div className="mb-3 text-sm text-edubot-muted dark:text-slate-400">
                                Бул аракеттер кадимки сабак агымынан тышкары колдонулат.
                            </div>
                            <div className="flex flex-wrap gap-2">
                            <button
                                onClick={restoreMeetingState}
                                disabled={!selectedSessionId || loadingMeetingState}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {loadingMeetingState ? 'Жүктөлүүдө...' : 'Meeting абалын жүктөө'}
                            </button>
                            <button
                                onClick={importZoomAttendanceToSession}
                                disabled={!selectedSessionId || importingAttendance}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {importingAttendance ? 'Импорттолууда...' : 'Zoom катышууну импорттоо'}
                            </button>
                            </div>
                        </div>
                    </DashboardInsetPanel>
                </div>
            )}

            <BasicModal
                isOpen={isAssetLibraryOpen}
                onClose={() => setIsAssetLibraryOpen(false)}
                title="Курстан видео кошуу"
                size="xl"
            >
                <div className="space-y-4 pb-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                            Булак видео курс
                        </label>
                        <select
                            value={selectedSourceVideoCourseId}
                            onChange={(e) => onSourceVideoCourseChange(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            {publishedVideoCourses.map((course) => (
                                <option key={course.id} value={String(course.id)}>
                                    {course.title || course.name || `Курс #${course.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
                        <input
                            value={courseAssetQuery}
                            onChange={(e) => setCourseAssetQuery(e.target.value)}
                            placeholder="Сабак же бөлүм боюнча издөө"
                            className="dashboard-field"
                        />
                        <div className="rounded-2xl border border-edubot-line/70 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="font-medium text-edubot-ink dark:text-white">
                                Кошулган видеолор
                            </div>
                            <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                {attachedCourseAssetCount} видео
                            </div>
                        </div>
                    </div>

                    {loadingCourseAssets ? (
                        <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                            Курс материалдары жүктөлүүдө...
                        </div>
                    ) : groupedCourseAssets.length ? (
                        groupedCourseAssets.map((group) => {
                            const isExpanded = expandedSections[group.sectionTitle];

                            return (
                                <div
                                    key={group.sectionTitle}
                                    className="overflow-hidden rounded-2xl border border-edubot-line/70 bg-white dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(group.sectionTitle)}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div>
                                            <div className="font-medium text-edubot-ink dark:text-white">
                                                {group.sectionTitle}
                                            </div>
                                            <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                {group.assets.length} видео
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-edubot-orange">
                                            {isExpanded ? 'Жыйноо' : 'Ачуу'}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-3 border-t border-edubot-line/60 px-4 py-3 dark:border-slate-700">
                                            {group.assets.map((asset) => {
                                                const isAlreadyAttached =
                                                    !!asset.storageKey &&
                                                    existingMaterialKeys.has(asset.storageKey);

                                                return (
                                                    <div
                                                        key={asset.id}
                                                        className="flex items-center justify-between rounded-2xl border border-edubot-line/70 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className="font-medium text-edubot-ink dark:text-white">
                                                                    {asset.title}
                                                                </div>
                                                                {isAlreadyAttached && (
                                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                                        Кошулган
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 truncate text-xs text-edubot-muted dark:text-slate-500">
                                                                {asset.lessonTitle}
                                                            </div>
                                                        </div>
                                                        <div className="ml-3 flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setPreviewVideo({
                                                                        title: asset.title,
                                                                        url: asset.url,
                                                                    })
                                                                }
                                                                className="dashboard-button-secondary"
                                                            >
                                                                <span className="inline-flex items-center gap-2">
                                                                    <FiPlayCircle className="h-4 w-4" />
                                                                    Ойнотуу
                                                                </span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddCourseAsset(asset)}
                                                                disabled={savingMaterials || isAlreadyAttached}
                                                                className="dashboard-button-primary disabled:opacity-60"
                                                            >
                                                                {isAlreadyAttached ? 'Кошулду' : 'Кошуу'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                            {courseAssetQuery.trim()
                                ? 'Издөөгө ылайык видео табылган жок.'
                                : 'Бул курста кайра колдончу сабак видеолору табылган жок.'}
                        </div>
                    )}
                </div>
            </BasicModal>

            <BasicModal
                isOpen={pendingDeleteIndex !== null}
                onClose={() => setPendingDeleteIndex(null)}
                title="Материалды өчүрүү"
                size="md"
            >
                <div className="space-y-4 pb-2">
                    <p className="text-sm text-edubot-muted dark:text-slate-400">
                        {pendingDeleteIndex !== null
                            ? `"${selectedSessionMaterials[pendingDeleteIndex]?.title || 'Бул материал'}" материалын өчүрөсүзбү?`
                            : 'Материалды өчүрөсүзбү?'}
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setPendingDeleteIndex(null)}
                            className="dashboard-button-secondary"
                        >
                            Жокко чыгаруу
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteMaterial}
                            disabled={savingMaterials}
                            className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300"
                        >
                            {savingMaterials ? 'Өчүрүлүүдө...' : 'Өчүрүү'}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={Boolean(previewVideo)}
                onClose={() => setPreviewVideo(null)}
                title={previewVideo?.title || 'Видео'}
                size="xl"
            >
                <div ref={previewContainerRef} className="w-full videoFs pb-4 relative">
                    {previewVideo?.url ? (
                        <Suspense
                            fallback={
                                <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-edubot-line/70 bg-edubot-surface/50 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                                    Видео ойноткуч жүктөлүүдө...
                                </div>
                            }
                        >
                            <VideoPlayer
                                videoUrl={previewVideo.url}
                                allowPlay
                                containerRef={previewContainerRef}
                            />
                        </Suspense>
                    ) : null}
                </div>
            </BasicModal>
        </div>
    );
};

SessionResourcesTab.propTypes = {
    availableCourseAssets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            lessonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            lessonTitle: PropTypes.string,
            sectionTitle: PropTypes.string,
            assetType: PropTypes.string,
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
            storageKey: PropTypes.string.isRequired,
        })
    ).isRequired,
    deletingMeeting: PropTypes.bool.isRequired,
    importZoomAttendanceToSession: PropTypes.func.isRequired,
    importingAttendance: PropTypes.bool.isRequired,
    joinLiveSession: PropTypes.func.isRequired,
    loadingCourseAssets: PropTypes.bool.isRequired,
    loadingMeetingState: PropTypes.bool.isRequired,
    meetingId: PropTypes.string.isRequired,
    meetingJoinUrl: PropTypes.string.isRequired,
    meetingProvider: PropTypes.string.isRequired,
    onAddCourseAsset: PropTypes.func.isRequired,
    onSourceVideoCourseChange: PropTypes.func.isRequired,
    onSaveMaterials: PropTypes.func.isRequired,
    onUploadMaterialFile: PropTypes.func.isRequired,
    publishedVideoCourses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
    removeMeeting: PropTypes.func.isRequired,
    restoreMeetingState: PropTypes.func.isRequired,
    saveMeetingLink: PropTypes.func.isRequired,
    savingMaterials: PropTypes.bool.isRequired,
    savingMeeting: PropTypes.bool.isRequired,
    showCourseAssetReuse: PropTypes.bool.isRequired,
    selectedDeliveryType: PropTypes.string.isRequired,
    selectedGroupLocation: PropTypes.string,
    selectedSessionId: PropTypes.string,
    selectedSessionJoinAllowed: PropTypes.bool.isRequired,
    selectedSessionJoinUrl: PropTypes.string,
    selectedSourceVideoCourseId: PropTypes.string,
    selectedSessionMaterials: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
            url: PropTypes.string,
            storageKey: PropTypes.string,
        })
    ).isRequired,
    selectedSessionMode: PropTypes.string.isRequired,
    selectedSessionRecordingUrl: PropTypes.string,
    setMeetingJoinUrl: PropTypes.func.isRequired,
    setMeetingProvider: PropTypes.func.isRequired,
    syncZoomRecordingsToSession: PropTypes.func.isRequired,
    syncingRecordings: PropTypes.bool.isRequired,
    uploadingMaterialFile: PropTypes.bool.isRequired,
};

SessionResourcesTab.defaultProps = {
    selectedGroupLocation: '',
    selectedSessionId: '',
    selectedSessionJoinUrl: '',
    selectedSourceVideoCourseId: '',
    selectedSessionRecordingUrl: '',
};

export default SessionResourcesTab;
