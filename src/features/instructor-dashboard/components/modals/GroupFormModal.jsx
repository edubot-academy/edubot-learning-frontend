import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiCalendar,
    FiClock,
    FiEdit3,
    FiLayers,
    FiLink,
    FiMapPin,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiVideo,
    FiX,
} from 'react-icons/fi';
import { COURSE_GROUP_STATUS, COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';
import Loader from '@shared/ui/Loader';

const WEEKDAY_OPTIONS = [
    { value: 'mon', labelKey: 'instructorDashboard.groupForm.weekdays.mon' },
    { value: 'tue', labelKey: 'instructorDashboard.groupForm.weekdays.tue' },
    { value: 'wed', labelKey: 'instructorDashboard.groupForm.weekdays.wed' },
    { value: 'thu', labelKey: 'instructorDashboard.groupForm.weekdays.thu' },
    { value: 'fri', labelKey: 'instructorDashboard.groupForm.weekdays.fri' },
    { value: 'sat', labelKey: 'instructorDashboard.groupForm.weekdays.sat' },
    { value: 'sun', labelKey: 'instructorDashboard.groupForm.weekdays.sun' },
];

const getInitials = (value = '') =>
    value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'S';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const GroupFormModal = ({
    mode,
    course,
    form,
    onChange,
    onClose,
    onSubmit,
    saving,
    onRegenerateCode,
    studentOptions,
    userSearch,
    onSearchChange,
    loadingUserOptions,
    showDropdown,
    setShowDropdown,
}) => {
    const { t } = useTranslation();
    const isEdit = mode === 'edit';
    const deliveryType = String(course?.courseType || course?.type || '').trim().toLowerCase();
    const isOffline = deliveryType === COURSE_TYPE.OFFLINE;
    const isOnlineLive = deliveryType === COURSE_TYPE.ONLINE_LIVE;
    const deliveryLabel = isOffline
        ? t('instructorDashboard.groupForm.delivery.offlineGroup')
        : isOnlineLive
          ? t('instructorDashboard.groupForm.delivery.onlineLiveGroup')
          : t('instructorDashboard.groupForm.delivery.deliveryGroup');
    const modeLabel = form.deliveryMode === 'individual'
        ? t('instructorDashboard.groupForm.deliveryModes.individual.label')
        : t('instructorDashboard.groupForm.deliveryModes.group.label');
    const scheduleBlocks = Array.isArray(form.scheduleBlocks) ? form.scheduleBlocks : [];
    const isIndividual = form.deliveryMode === 'individual';
    const normalizedStudentOptions = toArray(studentOptions);
    const selectedStudent = normalizedStudentOptions.find((student) => String(student.id) === String(form.studentId));
    const deliveryModeOptions = [
        {
            value: 'group',
            label: t('instructorDashboard.groupForm.deliveryModes.group.label'),
            description: t('instructorDashboard.groupForm.deliveryModes.group.description'),
        },
        {
            value: 'individual',
            label: t('instructorDashboard.groupForm.deliveryModes.individual.label'),
            description: t('instructorDashboard.groupForm.deliveryModes.individual.description'),
        },
    ];

    const handleScheduleBlockChange = (index, field, value) => {
        const next = scheduleBlocks.map((block, idx) =>
            idx === index ? { ...block, [field]: value } : block
        );
        onChange('scheduleBlocks', next);
    };

    const handleScheduleBlockAdd = () => {
        onChange('scheduleBlocks', [...scheduleBlocks, { day: '', startTime: '', endTime: '' }]);
    };

    const handleScheduleBlockRemove = (index) => {
        onChange(
            'scheduleBlocks',
            scheduleBlocks.filter((_, idx) => idx !== index)
        );
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                {isEdit ? <FiEdit3 className="h-3.5 w-3.5" /> : <FiPlus className="h-3.5 w-3.5" />}
                                {isEdit
                                    ? t('instructorDashboard.groupForm.header.editEyebrow')
                                    : t('instructorDashboard.groupForm.header.createEyebrow')}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                                    {isEdit
                                        ? form.name || t('instructorDashboard.groupForm.header.editTitle')
                                        : t('instructorDashboard.groupForm.header.createTitle')}
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.groupForm.header.description', {
                                        course: course?.title || t('instructorDashboard.groupForm.fallbacks.deliveryCourse'),
                                    })}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                            aria-label={t('common.closeMenu')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 pb-6 pt-6 sm:px-7 lg:grid-cols-[minmax(0,1.1fr),minmax(260px,0.9fr)]">
                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/25">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiLayers className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.groupForm.sections.basic')}
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {deliveryModeOptions.map((option) => {
                                        const selected = form.deliveryMode === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                disabled={isEdit}
                                                onClick={() => onChange('deliveryMode', option.value)}
                                                className={`rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                                                    selected
                                                        ? 'border-edubot-orange bg-edubot-orange/10 text-edubot-ink shadow-sm dark:text-white'
                                                        : 'border-edubot-line/70 bg-white/70 text-edubot-muted hover:border-edubot-orange/40 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400'
                                                }`}
                                                aria-pressed={selected}
                                            >
                                                <span className="block text-sm font-semibold">{option.label}</span>
                                                <span className="mt-1 block text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                    {option.description}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <input
                                        value={form.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        placeholder={
                                            isIndividual
                                                ? t('instructorDashboard.groupForm.fields.individualName')
                                                : t('instructorDashboard.groupForm.fields.groupName')
                                        }
                                        className="dashboard-field md:col-span-2"
                                    />
                                    {!isIndividual ? (
                                    <div className="space-y-2 md:col-span-2">
                                        <input
                                            value={form.code}
                                            onChange={(e) => onChange('code', e.target.value)}
                                            placeholder={t('instructorDashboard.groupForm.fields.groupCode')}
                                            className="dashboard-field"
                                        />
                                        <div className="flex items-center justify-between text-xs text-edubot-muted dark:text-slate-400">
                                            <span>{t('instructorDashboard.groupForm.help.groupCode')}</span>
                                            <button
                                                type="button"
                                                onClick={onRegenerateCode}
                                                className="inline-flex items-center gap-1 font-medium text-edubot-orange"
                                            >
                                                <FiRefreshCw className="h-3.5 w-3.5" />
                                                {t('instructorDashboard.groupForm.actions.regenerate')}
                                            </button>
                                        </div>
                                    </div>
                                    ) : null}
                                    {isEdit || !isIndividual ? (
                                        <select
                                            value={form.status}
                                            onChange={(e) => onChange('status', e.target.value)}
                                            className="dashboard-field dashboard-select"
                                        >
                                            {Object.values(COURSE_GROUP_STATUS).map((status) => (
                                                <option key={status} value={status}>
                                                    {t(`instructorDashboard.groupForm.statuses.${status}`, {
                                                        defaultValue: status,
                                                    })}
                                                </option>
                                            ))}
                                        </select>
                                    ) : null}
                                    <input
                                        value={form.instructorId}
                                        onChange={(e) => onChange('instructorId', e.target.value)}
                                        placeholder={t('instructorDashboard.groupForm.fields.instructorId')}
                                        className="dashboard-field"
                                    />
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/25">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.groupForm.sections.period')}
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => onChange('startDate', e.target.value)}
                                        className="dashboard-field"
                                    />
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => onChange('endDate', e.target.value)}
                                        className="dashboard-field"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.seatLimit}
                                        onChange={(e) => onChange('seatLimit', e.target.value)}
                                        placeholder={t('instructorDashboard.groupForm.fields.seatLimit')}
                                        className="dashboard-field"
                                        disabled={isIndividual}
                                    />
                                    <input
                                        value={form.timezone}
                                        onChange={(e) => onChange('timezone', e.target.value)}
                                        placeholder={t('instructorDashboard.groupForm.fields.timezone')}
                                        className="dashboard-field"
                                    />
                                </div>
                            </section>

                            {!isEdit && isIndividual ? (
                                <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/25">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        <FiSearch className="h-4 w-4 text-edubot-orange" />
                                        {t('instructorDashboard.groupForm.sections.student')}
                                    </div>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        {t('instructorDashboard.groupForm.student.description')}
                                    </p>

                                    <div className="relative mt-4">
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => {
                                                onSearchChange(e.target.value);
                                                setShowDropdown(true);
                                                onChange('studentId', '');
                                            }}
                                            className="dashboard-field pl-11"
                                            placeholder={t('instructorDashboard.groupForm.student.searchPlaceholder')}
                                            onFocus={() => setShowDropdown(true)}
                                        />
                                        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />

                                        {showDropdown && normalizedStudentOptions.length > 0 ? (
                                            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[1.25rem] border border-edubot-line/80 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-[#141619]">
                                                {normalizedStudentOptions.map((student) => {
                                                    const active = String(student.id) === String(form.studentId);
                                                    return (
                                                        <button
                                                            key={student.id}
                                                            type="button"
                                                            className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
                                                                active
                                                                    ? 'bg-edubot-orange/10 text-edubot-orange'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                                            }`}
                                                            onClick={() => {
                                                                onChange('studentId', String(student.id));
                                                                onSearchChange(student.name || student.email || '');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-edubot-ink dark:bg-slate-800 dark:text-white">
                                                                {getInitials(student.name || student.email)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-medium">
                                                                    {student.name || t('instructorDashboard.groupForm.fallbacks.unknownStudent')}
                                                                </div>
                                                                {student.email ? (
                                                                    <div className="truncate text-xs text-edubot-muted dark:text-slate-400">
                                                                        {student.email}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 min-h-[24px]">
                                        {loadingUserOptions ? <Loader fullScreen={false} /> : null}
                                        {!normalizedStudentOptions.length && userSearch.length >= 2 && !loadingUserOptions ? (
                                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupForm.student.notFound')}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/45">
                                        {form.studentId ? (
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                    <FiCheckCircle className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {selectedStudent?.name ||
                                                            userSearch ||
                                                            t('instructorDashboard.groupForm.fallbacks.studentWithId', {
                                                                id: form.studentId,
                                                            })}
                                                    </div>
                                                    <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                        {selectedStudent?.email ||
                                                            t('instructorDashboard.groupForm.student.selectedId', {
                                                                id: form.studentId,
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                                {t('instructorDashboard.groupForm.student.pickHint')}
                                            </p>
                                        )}
                                    </div>

                                    <label className="mt-4 flex items-start gap-3 rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.createFirstSession)}
                                            onChange={(e) => onChange('createFirstSession', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <span>
                                            <span className="block font-semibold text-edubot-ink dark:text-white">
                                                {t('instructorDashboard.groupForm.firstSession.title')}
                                            </span>
                                            <span className="mt-1 block text-xs leading-5">
                                                {t('instructorDashboard.groupForm.firstSession.description')}
                                            </span>
                                        </span>
                                    </label>
                                </section>
                            ) : null}
                        </div>

                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/25 p-5 dark:border-slate-700 dark:bg-slate-900/25">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    {isOffline ? (
                                        <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    ) : (
                                        <FiVideo className="h-4 w-4 text-edubot-orange" />
                                    )}
                                    {t('instructorDashboard.groupForm.sections.delivery')}
                                </div>
                                <div className="mt-3 rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                                    {t('instructorDashboard.groupForm.delivery.courseFormat')}{' '}
                                    <span className="font-semibold text-edubot-ink dark:text-white">{deliveryLabel}</span>
                                </div>
                                <div className="mt-3 rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                                    {t('instructorDashboard.groupForm.delivery.learningFormat')}{' '}
                                    <span className="font-semibold text-edubot-ink dark:text-white">{modeLabel}</span>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    {isOffline && (
                                        <input
                                            value={form.location}
                                            onChange={(e) => onChange('location', e.target.value)}
                                            placeholder={t('instructorDashboard.groupForm.fields.location')}
                                            className="dashboard-field"
                                        />
                                    )}
                                    {isOnlineLive && (
                                        <>
                                            <select
                                                value={form.meetingProvider}
                                                onChange={(e) => onChange('meetingProvider', e.target.value)}
                                                className="dashboard-field dashboard-select"
                                            >
                                                <option value="">{t('instructorDashboard.groupForm.fields.meetingProvider')}</option>
                                                {Object.values(MEETING_PROVIDER).map((provider) => (
                                                    <option key={provider} value={provider}>
                                                        {provider}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                value={form.meetingUrl}
                                                onChange={(e) => onChange('meetingUrl', e.target.value)}
                                                placeholder={t('instructorDashboard.groupForm.fields.meetingUrl')}
                                                className="dashboard-field"
                                            />
                                        </>
                                    )}
                                    {!isOffline && !isOnlineLive && (
                                        <div className="rounded-2xl border border-dashed border-edubot-line/70 px-4 py-4 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                            {t('instructorDashboard.groupForm.delivery.noExtraFields')}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900/95 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800/90">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    {isOffline ? (
                                        <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    ) : isOnlineLive ? (
                                        <FiLink className="h-4 w-4 text-edubot-orange" />
                                    ) : (
                                        <FiVideo className="h-4 w-4 text-edubot-orange" />
                                    )}
                                    {t('instructorDashboard.groupForm.notice.title')}
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {isOffline
                                        ? t('instructorDashboard.groupForm.notice.offline')
                                        : isOnlineLive
                                          ? t('instructorDashboard.groupForm.notice.onlineLive')
                                          : t('instructorDashboard.groupForm.notice.delivery')}
                                </p>
                            </section>
                        </div>

                        <section className="rounded-[1.75rem] border border-edubot-orange/20 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.08),_transparent_36%),rgba(248,250,252,0.72)] p-5 dark:border-edubot-orange/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.10),_transparent_34%),rgba(15,23,42,0.52)] lg:col-span-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-edubot-orange dark:border-edubot-orange/20 dark:bg-slate-950/60">
                                        <FiClock className="h-4 w-4 text-edubot-orange" />
                                        {t('instructorDashboard.groupForm.schedule.eyebrow')}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        <FiClock className="h-4 w-4 text-edubot-orange" />
                                        {t('instructorDashboard.groupForm.schedule.title')}
                                    </div>
                                    <p className="mt-2 max-w-2xl text-sm text-edubot-muted dark:text-slate-400">
                                        {t('instructorDashboard.groupForm.schedule.description')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleScheduleBlockAdd}
                                    className="dashboard-button-secondary shrink-0"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    {t('instructorDashboard.groupForm.actions.addBlock')}
                                </button>
                            </div>

                            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.88fr),minmax(0,1.12fr)]">
                                {isEdit || !isIndividual ? (
                                    <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.groupForm.schedule.noteLabel')}
                                        </label>
                                        <textarea
                                            value={form.scheduleNote}
                                            onChange={(e) => onChange('scheduleNote', e.target.value)}
                                            placeholder={t('instructorDashboard.groupForm.schedule.notePlaceholder')}
                                            rows={3}
                                            className="dashboard-field mt-3 min-h-[104px]"
                                        />
                                    </div>
                                ) : null}

                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                                    <div className="hidden items-center gap-3 border-b border-edubot-line/70 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-edubot-muted dark:border-slate-700 dark:text-slate-400 xl:grid xl:grid-cols-[minmax(0,1fr),minmax(160px,180px),minmax(160px,180px)]">
                                        <span className="truncate">{t('instructorDashboard.groupForm.schedule.day')}</span>
                                        <span className="truncate">{t('instructorDashboard.groupForm.schedule.start')}</span>
                                        <span className="truncate">{t('instructorDashboard.groupForm.schedule.end')}</span>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        {scheduleBlocks.map((block, index) => (
                                            <div
                                                key={`${block.day || 'day'}-${index}`}
                                                className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/45 p-3 dark:border-slate-700 dark:bg-slate-900/70"
                                            >
                                                <div className="mb-2 flex items-center justify-between md:hidden">
                                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {t('instructorDashboard.groupForm.schedule.blockNumber', {
                                                            number: index + 1,
                                                        })}
                                                    </p>
                                                    {scheduleBlocks.length > 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleScheduleBlockRemove(index)}
                                                            className="text-xs font-semibold text-rose-500"
                                                        >
                                                            {t('instructorDashboard.groupForm.actions.delete')}
                                                        </button>
                                                    ) : null}
                                                </div>

                                                <div className="grid gap-3 xl:grid-cols-1">
                                                    <select
                                                        value={block.day}
                                                        onChange={(e) => handleScheduleBlockChange(index, 'day', e.target.value)}
                                                        className="dashboard-field dashboard-select min-w-0"
                                                        aria-label={t('instructorDashboard.groupForm.schedule.dayAria', {
                                                            number: index + 1,
                                                        })}
                                                    >
                                                        <option value="">{t('instructorDashboard.groupForm.schedule.day')}</option>
                                                        {WEEKDAY_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {t(option.labelKey)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <input
                                                            type="time"
                                                            value={block.startTime}
                                                            onChange={(e) => handleScheduleBlockChange(index, 'startTime', e.target.value)}
                                                            className="dashboard-field min-w-0"
                                                            aria-label={t('instructorDashboard.groupForm.schedule.startAria', {
                                                                number: index + 1,
                                                            })}
                                                        />
                                                        <input
                                                            type="time"
                                                            value={block.endTime}
                                                            onChange={(e) => handleScheduleBlockChange(index, 'endTime', e.target.value)}
                                                            className="dashboard-field min-w-0"
                                                            aria-label={t('instructorDashboard.groupForm.schedule.endAria', {
                                                                number: index + 1,
                                                            })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-3 hidden items-center justify-end xl:flex">
                                                    {scheduleBlocks.length > 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleScheduleBlockRemove(index)}
                                                            className="rounded-full px-2 py-2 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                        >
                                                            {t('instructorDashboard.groupForm.actions.delete')}
                                                        </button>
                                                    ) : (
                                                        <span className="px-1 py-2 text-[11px] font-medium text-edubot-muted dark:text-slate-500">
                                                            {t('instructorDashboard.groupForm.schedule.primaryBlock')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 sm:px-7 dark:border-slate-700 dark:bg-[#151922]/95">
                        <button
                            type="button"
                            className="dashboard-button-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            {t('instructorDashboard.groupForm.actions.close')}
                        </button>
                        <button
                            type="submit"
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={saving}
                        >
                            {isEdit ? <FiEdit3 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
                            {saving
                                ? t('instructorDashboard.groupForm.actions.saving')
                                : isEdit
                                  ? t('instructorDashboard.groupForm.actions.updateGroup')
                                  : isIndividual
                                    ? t('instructorDashboard.groupForm.actions.createIndividual')
                                    : t('instructorDashboard.groupForm.actions.createGroup')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

GroupFormModal.propTypes = {
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    course: PropTypes.shape({
        title: PropTypes.string,
    }),
    form: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
        deliveryMode: PropTypes.oneOf(['group', 'individual']),
        studentId: PropTypes.string,
        status: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        seatLimit: PropTypes.string,
        timezone: PropTypes.string,
        location: PropTypes.string,
        meetingProvider: PropTypes.string,
        meetingUrl: PropTypes.string,
        instructorId: PropTypes.string,
        scheduleNote: PropTypes.string,
        scheduleBlocks: PropTypes.arrayOf(
            PropTypes.shape({
                day: PropTypes.string,
                startTime: PropTypes.string,
                endTime: PropTypes.string,
            })
        ),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    saving: PropTypes.bool,
    onRegenerateCode: PropTypes.func.isRequired,
    studentOptions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            name: PropTypes.string,
            email: PropTypes.string,
        })
    ),
    userSearch: PropTypes.string,
    onSearchChange: PropTypes.func,
    loadingUserOptions: PropTypes.bool,
    showDropdown: PropTypes.bool,
    setShowDropdown: PropTypes.func,
};

GroupFormModal.defaultProps = {
    course: null,
    saving: false,
    studentOptions: [],
    userSearch: '',
    onSearchChange: () => {},
    loadingUserOptions: false,
    showDropdown: false,
    setShowDropdown: () => {},
};

export default GroupFormModal;
