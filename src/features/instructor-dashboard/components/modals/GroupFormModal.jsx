import PropTypes from 'prop-types';
import {
    FiCalendar,
    FiEdit3,
    FiLayers,
    FiLink,
    FiMapPin,
    FiPlus,
    FiRefreshCw,
    FiVideo,
    FiX,
} from 'react-icons/fi';
import { COURSE_GROUP_STATUS, COURSE_TYPE, MEETING_PROVIDER } from '@shared/contracts';

const GroupFormModal = ({
    mode,
    course,
    form,
    onChange,
    onClose,
    onSubmit,
    saving,
    onRegenerateCode,
}) => {
    const isEdit = mode === 'edit';
    const deliveryType = String(course?.courseType || course?.type || '').trim().toLowerCase();
    const isOffline = deliveryType === COURSE_TYPE.OFFLINE;
    const isOnlineLive = deliveryType === COURSE_TYPE.ONLINE_LIVE;
    const deliveryLabel = isOffline ? 'Оффлайн группа' : isOnlineLive ? 'Онлайн live группа' : 'Delivery группа';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                {isEdit ? <FiEdit3 className="h-3.5 w-3.5" /> : <FiPlus className="h-3.5 w-3.5" />}
                                {isEdit ? 'Edit Group' : 'Create Group'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                                    {isEdit ? form.name || 'Группаны түзөтүү' : 'Жаңы группа'}
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {course?.title || 'Delivery course'} үчүн академиялык группа метамаалыматын башкаруу.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                            aria-label="Жабуу"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 py-5 sm:px-7 lg:grid-cols-[minmax(0,1.1fr),minmax(260px,0.9fr)]">
                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiLayers className="h-4 w-4 text-edubot-orange" />
                                    Негизги маалымат
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <input
                                        value={form.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        placeholder="Group name *"
                                        className="dashboard-field md:col-span-2"
                                    />
                                    <div className="space-y-2 md:col-span-2">
                                        <input
                                            value={form.code}
                                            onChange={(e) => onChange('code', e.target.value)}
                                            placeholder="Group code *"
                                            className="dashboard-field"
                                        />
                                        <div className="flex items-center justify-between text-xs text-edubot-muted dark:text-slate-400">
                                            <span>Код cohort үчүн уникалдуу идентификатор.</span>
                                            <button
                                                type="button"
                                                onClick={onRegenerateCode}
                                                className="inline-flex items-center gap-1 font-medium text-edubot-orange"
                                            >
                                                <FiRefreshCw className="h-3.5 w-3.5" />
                                                Кайра түзүү
                                            </button>
                                        </div>
                                    </div>
                                    <select
                                        value={form.status}
                                        onChange={(e) => onChange('status', e.target.value)}
                                        className="dashboard-field dashboard-select"
                                    >
                                        {Object.values(COURSE_GROUP_STATUS).map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        value={form.instructorId}
                                        onChange={(e) => onChange('instructorId', e.target.value)}
                                        placeholder="Instructor ID"
                                        className="dashboard-field"
                                    />
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiCalendar className="h-4 w-4 text-edubot-orange" />
                                    Период жана орундар
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
                                        placeholder="Seat limit"
                                        className="dashboard-field"
                                    />
                                    <input
                                        value={form.timezone}
                                        onChange={(e) => onChange('timezone', e.target.value)}
                                        placeholder="Timezone"
                                        className="dashboard-field"
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    {isOffline ? (
                                        <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    ) : (
                                        <FiVideo className="h-4 w-4 text-edubot-orange" />
                                    )}
                                    Delivery
                                </div>
                                <div className="mt-3 rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                                    Бул курс форматы: <span className="font-semibold text-edubot-ink dark:text-white">{deliveryLabel}</span>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    {isOffline && (
                                        <input
                                            value={form.location}
                                            onChange={(e) => onChange('location', e.target.value)}
                                            placeholder="Location"
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
                                                <option value="">Meeting provider</option>
                                                {Object.values(MEETING_PROVIDER).map((provider) => (
                                                    <option key={provider} value={provider}>
                                                        {provider}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                value={form.meetingUrl}
                                                onChange={(e) => onChange('meetingUrl', e.target.value)}
                                                placeholder="Meeting URL"
                                                className="dashboard-field"
                                            />
                                        </>
                                    )}
                                    {!isOffline && !isOnlineLive && (
                                        <div className="rounded-2xl border border-dashed border-edubot-line/70 px-4 py-4 text-sm text-edubot-muted dark:border-slate-700 dark:text-slate-400">
                                            Бул курс үчүн кошумча delivery талаалары талап кылынбайт.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    {isOffline ? (
                                        <FiMapPin className="h-4 w-4 text-edubot-orange" />
                                    ) : isOnlineLive ? (
                                        <FiLink className="h-4 w-4 text-edubot-orange" />
                                    ) : (
                                        <FiVideo className="h-4 w-4 text-edubot-orange" />
                                    )}
                                    Эскертүү
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {isOffline
                                        ? 'Бул группа оффлайн окутулат. Локацияны так кармаңыз, ал session workspace контекстинде көрсөтүлөт.'
                                        : isOnlineLive
                                          ? 'Бул группа онлайн live окутулат. Meeting provider жана URL session workflow үчүн негизги дефолт болуп калат.'
                                          : 'Группа enrollment үчүн контейнер. Session, attendance, homework жана meeting workflow өзүнчө session workspace\'те калат.'}
                                </p>
                            </section>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 sm:px-7 dark:border-slate-700 dark:bg-[#151922]/95">
                        <button
                            type="button"
                            className="dashboard-button-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Жабуу
                        </button>
                        <button
                            type="submit"
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={saving}
                        >
                            {isEdit ? <FiEdit3 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
                            {saving
                                ? 'Сакталууда...'
                                : isEdit
                                  ? 'Группаны жаңыртуу'
                                  : 'Группа түзүү'}
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
        status: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        seatLimit: PropTypes.string,
        timezone: PropTypes.string,
        location: PropTypes.string,
        meetingProvider: PropTypes.string,
        meetingUrl: PropTypes.string,
        instructorId: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    saving: PropTypes.bool,
    onRegenerateCode: PropTypes.func.isRequired,
};

GroupFormModal.defaultProps = {
    course: null,
    saving: false,
};

export default GroupFormModal;
