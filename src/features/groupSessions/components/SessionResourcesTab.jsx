import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiPaperclip, FiPlayCircle } from 'react-icons/fi';
import { COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';
import { DashboardInsetPanel, EmptyState } from '../../../components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import { toast } from 'react-hot-toast';

const VideoPlayer = lazy(() => import('@shared/VideoPlayer'));

const VIDEO_EXTENSIONS = ['.mp4', '.m3u8', '.webm', '.mov', '.m4v', '.ogg'];
const NO_SECTION_KEY = '__no_section__';

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
    const { t } = useTranslation();
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
    const existingMaterialKeys = useMemo(
        () =>
            new Set(
                selectedSessionMaterials
                    .map((item) => item?.storageKey)
                    .filter((value) => typeof value === 'string' && value.trim())
            ),
        [selectedSessionMaterials]
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
            const sectionKey = asset.sectionTitle || NO_SECTION_KEY;
            const existingGroup = acc.find((item) => item.sectionKey === sectionKey);
            if (existingGroup) {
                existingGroup.assets.push(asset);
            } else {
                acc.push({
                    sectionKey,
                    sectionTitle: asset.sectionTitle || t('groupSessions.resources.fallbacks.noSection'),
                    assets: [asset],
                });
            }
            return acc;
        }, []);

        return groups;
    }, [availableCourseAssets, courseAssetQuery, t]);

    useEffect(() => {
        setExpandedSections((prev) => {
            const next = {};
            groupedCourseAssets.forEach((group, index) => {
                next[group.sectionKey] = prev[group.sectionKey] ?? index === 0;
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

    const toggleSection = (sectionKey) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    const copyToClipboard = async (value, successMessage) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(successMessage);
        } catch {
            toast.error(t('groupSessions.resources.toasts.copyFailed'));
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
                message: t('groupSessions.resources.validation.httpUrl'),
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
                message: t('groupSessions.resources.notices.materialAdded', { title }),
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
                message: t('groupSessions.resources.validation.httpUrl'),
            });
            return;
        }

        const saved = await onSaveMaterials(nextMaterials, { suppressSuccessToast: true });
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: t('groupSessions.resources.notices.materialUpdated', { title }),
            });
            resetMaterialForm();
        }
    };

    const deleteMaterial = async (index) => {
        const deletedTitle = selectedSessionMaterials[index]?.title || t('groupSessions.resources.fallbacks.material');
        const nextMaterials = selectedSessionMaterials.filter((_, itemIndex) => itemIndex !== index);
        const saved = await onSaveMaterials(nextMaterials, { suppressSuccessToast: true });
        if (saved && editingMaterialIndex === index) {
            resetMaterialForm();
        }
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: t('groupSessions.resources.notices.materialDeleted', { title: deletedTitle }),
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
                message: t('groupSessions.resources.notices.fileAdded', { title: uploaded.title || file.name }),
            });
            resetMaterialForm();
        }
    };

    const handleAddCourseAsset = async (asset) => {
        const saved = await onAddCourseAsset(asset);
        if (saved) {
            setInlineNotice({
                tone: 'success',
                message: t('groupSessions.resources.notices.videoAdded', { title: asset.title }),
            });
        }
        return saved;
    };

    if (!selectedSessionId) {
        return (
            <EmptyState
                title={t('groupSessions.resources.empty.noSessionTitle')}
                subtitle={t('groupSessions.resources.empty.noSessionSubtitle')}
                icon={<FiPaperclip className="h-8 w-8 text-edubot-orange" />}
                className="dashboard-panel"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-4">
                <DashboardInsetPanel
                    title={t('groupSessions.resources.materials.title')}
                    description={t('groupSessions.resources.materials.description')}
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
                                {uploadingMaterialFile
                                    ? t('groupSessions.resources.actions.uploadingFile')
                                    : t('groupSessions.resources.actions.uploadFile')}
                            </button>
                            <button
                                type="button"
                                onClick={beginLinkAdd}
                                className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {t('groupSessions.resources.actions.addLink')}
                            </button>
                            {showCourseAssetReuse && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssetLibraryOpen(true)}
                                    className="rounded-full border border-edubot-line bg-white px-3 py-1 text-xs font-semibold text-edubot-ink transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    {t('groupSessions.resources.actions.addVideoFromCourse')}
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
                                        {t('groupSessions.resources.composer.title')}
                                    </div>
                                    <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        {t('groupSessions.resources.composer.description')}
                                    </div>
                                </div>
                                <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr),auto]">
                                    <input
                                        value={materialDraft.title}
                                        onChange={(e) =>
                                            setMaterialDraft((prev) => ({ ...prev, title: e.target.value }))
                                        }
                                        placeholder={t('groupSessions.resources.fields.materialTitle')}
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
                                            {savingMaterials
                                                ? t('groupSessions.resources.actions.saving')
                                                : t('groupSessions.resources.actions.save')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetMaterialForm}
                                            className="dashboard-button-secondary"
                                        >
                                            {t('groupSessions.resources.actions.cancel')}
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
                                                        placeholder={t('groupSessions.resources.fields.materialTitle')}
                                                        className="dashboard-field"
                                                    />
                                                    {isVideoMaterial(item) && (
                                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                                                            {t('groupSessions.resources.labels.video')}
                                                        </span>
                                                    )}
                                                </div>
                                                {isUploadedMaterial(item) ? (
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        {t('groupSessions.resources.materials.uploadedUrlReadonly')}
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
                                                    {savingMaterials
                                                        ? t('groupSessions.resources.actions.saving')
                                                        : t('groupSessions.resources.actions.save')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetMaterialForm}
                                                    className="dashboard-button-secondary"
                                                >
                                                    {t('groupSessions.resources.actions.cancel')}
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
                                                            {t('groupSessions.resources.labels.video')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {item.storageKey
                                                        ? t('groupSessions.resources.labels.uploadedFile')
                                                        : t('groupSessions.resources.labels.externalLink')}
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
                                                            {t('groupSessions.resources.actions.play')}
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
                                                        {t('groupSessions.resources.actions.open')}
                                                    </span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditMaterial(item, index)}
                                                    className="text-xs font-semibold text-edubot-muted transition hover:text-edubot-orange dark:text-slate-400 dark:hover:text-edubot-orange"
                                                >
                                                    {t('groupSessions.resources.actions.rename')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPendingDeleteIndex(index)}
                                                    disabled={savingMaterials}
                                                    className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60 dark:text-red-300"
                                                >
                                                    {t('groupSessions.resources.actions.delete')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                {t('groupSessions.resources.empty.noMaterials')}
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>

            </div>

            {isOnlineLive ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title={t('groupSessions.resources.meeting.title')}
                        description={t('groupSessions.resources.meeting.description')}
                    >
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                        {t('groupSessions.resources.meeting.platform')}
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
                                    {t('groupSessions.resources.meeting.statusTitle')}
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedSessionJoinUrl
                                        ? t('groupSessions.resources.meeting.joinReady')
                                        : t('groupSessions.resources.meeting.joinMissing')}
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
                                        ? t('groupSessions.resources.actions.saving')
                                        : meetingId
                                          ? t('groupSessions.resources.meeting.update')
                                          : t('groupSessions.resources.meeting.create')}
                                </button>
                                <button
                                    onClick={() => joinLiveSession(meetingJoinUrl || selectedSessionJoinUrl)}
                                    disabled={
                                        !(meetingJoinUrl || selectedSessionJoinUrl) ||
                                        !selectedSessionJoinAllowed
                                    }
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    {t('groupSessions.resources.meeting.join')}
                                </button>
                                {selectedSessionJoinUrl && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(
                                                selectedSessionJoinUrl,
                                                t('groupSessions.resources.toasts.joinLinkCopied')
                                            )
                                        }
                                        className="dashboard-button-secondary"
                                    >
                                        {t('groupSessions.resources.actions.copyLink')}
                                    </button>
                                )}
                                <button
                                    onClick={removeMeeting}
                                    disabled={!selectedSessionId || deletingMeeting}
                                    className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300"
                                >
                                    {deletingMeeting
                                        ? t('groupSessions.resources.actions.deleting')
                                        : t('groupSessions.resources.meeting.delete')}
                                </button>
                            </div>

                            {!selectedSessionJoinAllowed && selectedSessionMode !== 'completed' && (
                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                    {t('groupSessions.resources.meeting.joinWindowHint')}
                                </div>
                            )}
                        </div>
                    </DashboardInsetPanel>
                </div>
            ) : (
                <DashboardInsetPanel
                    title={t('groupSessions.resources.format.title')}
                    description={t('groupSessions.resources.format.description')}
                >
                    <div className="mt-4 space-y-3">
                        <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                            <div className="font-medium text-edubot-ink dark:text-white">
                                {t('groupSessions.resources.format.label')}
                            </div>
                            <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                {selectedDeliveryType === COURSE_TYPE.OFFLINE
                                    ? t('groupSessions.resources.format.offline')
                                    : t('groupSessions.resources.format.noLiveMeeting')}
                            </div>
                        </div>
                        {selectedDeliveryType === COURSE_TYPE.OFFLINE && (
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    {t('groupSessions.resources.format.location')}
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedGroupLocation || t('groupSessions.resources.fallbacks.noLocation')}
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>
            )}

            {isOnlineLive && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
                    <DashboardInsetPanel
                        title={t('groupSessions.resources.recording.title')}
                        description={t('groupSessions.resources.recording.description')}
                    >
                        <div className="mt-4 space-y-4">
                            <div className="dashboard-panel-muted rounded-2xl px-4 py-3 text-sm">
                                <div className="font-medium text-edubot-ink dark:text-white">
                                    {t('groupSessions.resources.recording.statusTitle')}
                                </div>
                                <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                    {selectedSessionRecordingUrl
                                        ? t('groupSessions.resources.recording.found')
                                        : t('groupSessions.resources.recording.missing')}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={syncZoomRecordingsToSession}
                                    disabled={!selectedSessionId || syncingRecordings}
                                    className="dashboard-button-secondary disabled:opacity-60"
                                >
                                    {syncingRecordings
                                        ? t('groupSessions.resources.recording.syncing')
                                        : t('groupSessions.resources.recording.sync')}
                                </button>
                                {selectedSessionRecordingUrl && (
                                    <a
                                        href={selectedSessionRecordingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="dashboard-button-primary"
                                    >
                                        {t('groupSessions.resources.recording.open')}
                                    </a>
                                )}
                                {selectedSessionRecordingUrl && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(
                                                selectedSessionRecordingUrl,
                                                t('groupSessions.resources.toasts.recordingLinkCopied')
                                            )
                                        }
                                        className="dashboard-button-secondary"
                                    >
                                        {t('groupSessions.resources.actions.copyLink')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('groupSessions.resources.integrations.title')}
                        description={t('groupSessions.resources.integrations.description')}
                    >
                        <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-edubot-surface/40 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                            <div className="mb-3 text-sm text-edubot-muted dark:text-slate-400">
                                {t('groupSessions.resources.integrations.note')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                            <button
                                onClick={restoreMeetingState}
                                disabled={!selectedSessionId || loadingMeetingState}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {loadingMeetingState
                                    ? t('groupSessions.resources.loading')
                                    : t('groupSessions.resources.integrations.loadMeetingState')}
                            </button>
                            <button
                                onClick={importZoomAttendanceToSession}
                                disabled={!selectedSessionId || importingAttendance}
                                className="dashboard-button-secondary disabled:opacity-60"
                            >
                                {importingAttendance
                                    ? t('groupSessions.resources.integrations.importing')
                                    : t('groupSessions.resources.integrations.importZoomAttendance')}
                            </button>
                            </div>
                        </div>
                    </DashboardInsetPanel>
                </div>
            )}

            <BasicModal
                isOpen={isAssetLibraryOpen}
                onClose={() => setIsAssetLibraryOpen(false)}
                title={t('groupSessions.resources.assetLibrary.title')}
                size="xl"
            >
                <div className="space-y-4 pb-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                            {t('groupSessions.resources.assetLibrary.sourceCourse')}
                        </label>
                        <select
                            value={selectedSourceVideoCourseId}
                            onChange={(e) => onSourceVideoCourseChange(e.target.value)}
                            className="dashboard-field dashboard-select"
                        >
                            {publishedVideoCourses.map((course) => (
                                <option key={course.id} value={String(course.id)}>
                                    {course.title || course.name || t('groupSessions.resources.fallbacks.courseWithId', { id: course.id })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
                        <input
                            value={courseAssetQuery}
                            onChange={(e) => setCourseAssetQuery(e.target.value)}
                            placeholder={t('groupSessions.resources.assetLibrary.searchPlaceholder')}
                            className="dashboard-field"
                        />
                        <div className="rounded-2xl border border-edubot-line/70 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="font-medium text-edubot-ink dark:text-white">
                                {t('groupSessions.resources.assetLibrary.attachedVideos')}
                            </div>
                            <div className="mt-1 text-edubot-muted dark:text-slate-400">
                                {t('groupSessions.resources.assetLibrary.videoCount', { count: attachedCourseAssetCount })}
                            </div>
                        </div>
                    </div>

                    {loadingCourseAssets ? (
                        <div className="rounded-2xl border border-dashed border-edubot-line/80 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                            {t('groupSessions.resources.assetLibrary.loading')}
                        </div>
                    ) : groupedCourseAssets.length ? (
                        groupedCourseAssets.map((group) => {
                            const isExpanded = expandedSections[group.sectionKey];

                            return (
                                <div
                                    key={group.sectionKey}
                                    className="overflow-hidden rounded-2xl border border-edubot-line/70 bg-white dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(group.sectionKey)}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div>
                                            <div className="font-medium text-edubot-ink dark:text-white">
                                                {group.sectionTitle}
                                            </div>
                                            <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                {t('groupSessions.resources.assetLibrary.videoCount', { count: group.assets.length })}
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-edubot-orange">
                                            {isExpanded
                                                ? t('groupSessions.resources.actions.collapse')
                                                : t('groupSessions.resources.actions.expand')}
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
                                                                        {t('groupSessions.resources.assetLibrary.attached')}
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
                                                                    {t('groupSessions.resources.actions.play')}
                                                                </span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddCourseAsset(asset)}
                                                                disabled={savingMaterials || isAlreadyAttached}
                                                                className="dashboard-button-primary disabled:opacity-60"
                                                            >
                                                                {isAlreadyAttached
                                                                    ? t('groupSessions.resources.assetLibrary.added')
                                                                    : t('groupSessions.resources.actions.add')}
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
                                ? t('groupSessions.resources.empty.noVideoSearchResults')
                                : t('groupSessions.resources.empty.noReusableVideos')}
                        </div>
                    )}
                </div>
            </BasicModal>

            <BasicModal
                isOpen={pendingDeleteIndex !== null}
                onClose={() => setPendingDeleteIndex(null)}
                title={t('groupSessions.resources.deleteModal.title')}
                size="md"
            >
                <div className="space-y-4 pb-2">
                    <p className="text-sm text-edubot-muted dark:text-slate-400">
                        {pendingDeleteIndex !== null
                            ? t('groupSessions.resources.deleteModal.messageWithTitle', {
                                title:
                                    selectedSessionMaterials[pendingDeleteIndex]?.title ||
                                    t('groupSessions.resources.fallbacks.thisMaterial'),
                            })
                            : t('groupSessions.resources.deleteModal.message')}
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setPendingDeleteIndex(null)}
                            className="dashboard-button-secondary"
                        >
                            {t('groupSessions.resources.actions.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteMaterial}
                            disabled={savingMaterials}
                            className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300"
                        >
                            {savingMaterials
                                ? t('groupSessions.resources.actions.deleting')
                                : t('groupSessions.resources.actions.delete')}
                        </button>
                    </div>
                </div>
            </BasicModal>

            <BasicModal
                isOpen={Boolean(previewVideo)}
                onClose={() => setPreviewVideo(null)}
                title={previewVideo?.title || t('groupSessions.resources.labels.video')}
                size="xl"
            >
                <div ref={previewContainerRef} className="w-full videoFs pb-4 relative">
                    {previewVideo?.url ? (
                        <Suspense
                            fallback={
                                <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-edubot-line/70 bg-edubot-surface/50 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                                    {t('groupSessions.resources.video.loadingPlayer')}
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
