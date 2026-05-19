import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiLayers,
    FiPercent,
    FiSearch,
    FiUserPlus,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import Loader from '@shared/ui/Loader';

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

const studentShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
});

const studentCollectionShape = PropTypes.oneOfType([
    PropTypes.arrayOf(studentShape),
    PropTypes.shape({
        items: PropTypes.arrayOf(studentShape),
        data: PropTypes.arrayOf(studentShape),
    }),
]);

const EnrollGroupStudentModal = ({
    group,
    course,
    form,
    onChange,
    onClose,
    onSubmit,
    enrolling,
    students,
    loadingStudents,
    studentOptions,
    userSearch,
    onSearchChange,
    loadingUserOptions,
    showDropdown,
    setShowDropdown,
}) => {
    const { t } = useTranslation();
    const normalizedStudentOptions = toArray(studentOptions);
    const normalizedStudents = toArray(students);
    const selectedStudent = normalizedStudentOptions.find((student) => String(student.id) === String(form.userId));
    const seatUsage = group?.seatLimit
        ? `${normalizedStudents.length}/${group.seatLimit}`
        : t('instructorDashboard.enrollGroupStudentModal.unlimited');

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_38%),linear-gradient(135deg,_rgba(255,247,237,0.95),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-edubot-orange/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange dark:border-edubot-orange/25 dark:bg-slate-900/60">
                                <FiUserPlus className="h-3.5 w-3.5" />
                                {t('instructorDashboard.enrollGroupStudentModal.eyebrow')}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                                    {group?.name ||
                                        t('instructorDashboard.enrollGroupStudentModal.fallbacks.groupWithId', {
                                            id: group?.id || '—',
                                        })}
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollGroupStudentModal.description', {
                                        course: course?.title || t('instructorDashboard.enrollGroupStudentModal.fallbacks.deliveryCourse'),
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

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-500">
                                {t('instructorDashboard.enrollGroupStudentModal.course')}
                            </div>
                            <div className="mt-1 font-medium text-edubot-ink dark:text-white">
                                {course?.title || '—'}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-500">
                                {t('instructorDashboard.enrollGroupStudentModal.groupCode')}
                            </div>
                            <div className="mt-1 font-medium text-edubot-ink dark:text-white">
                                {group?.code || '—'}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-500">
                                {t('instructorDashboard.enrollGroupStudentModal.seats')}
                            </div>
                            <div className="mt-1 font-medium text-edubot-ink dark:text-white">{seatUsage}</div>
                        </div>
                    </div>
                </div>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 py-5 sm:px-7 lg:grid-cols-[minmax(0,1.02fr),minmax(260px,0.98fr)]">
                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiSearch className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.enrollGroupStudentModal.search.title')}
                                </div>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollGroupStudentModal.search.description')}
                                </p>

                                <div className="relative mt-4">
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => {
                                            onSearchChange(e.target.value);
                                            setShowDropdown(true);
                                            onChange('userId', '');
                                        }}
                                        className="dashboard-field pl-11"
                                        placeholder={t('instructorDashboard.enrollGroupStudentModal.search.placeholder')}
                                        onFocus={() => setShowDropdown(true)}
                                    />
                                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted" />

                                    {showDropdown && normalizedStudentOptions.length > 0 ? (
                                        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[1.25rem] border border-edubot-line/80 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-[#141619]">
                                            {normalizedStudentOptions.map((student) => {
                                                const active = String(student.id) === form.userId;
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
                                                            onChange('userId', String(student.id));
                                                            onSearchChange(student.name || student.email || '');
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-edubot-ink dark:bg-slate-800 dark:text-white">
                                                            {getInitials(student.name || student.email)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium">
                                                                {student.name ||
                                                                    t('instructorDashboard.enrollGroupStudentModal.fallbacks.unknownStudent')}
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
                                            {t('instructorDashboard.enrollGroupStudentModal.search.notFound')}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/45">
                                    {form.userId ? (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                <FiCheckCircle className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                    {selectedStudent?.name ||
                                                        userSearch ||
                                                        t('instructorDashboard.enrollGroupStudentModal.fallbacks.studentWithId', {
                                                            id: form.userId,
                                                        })}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {selectedStudent?.email ||
                                                        t('instructorDashboard.enrollGroupStudentModal.search.selectedId', {
                                                            id: form.userId,
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.enrollGroupStudentModal.search.pickHint')}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiPercent className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.enrollGroupStudentModal.discount.title')}
                                </div>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollGroupStudentModal.discount.description')}
                                </p>

                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {t('instructorDashboard.enrollGroupStudentModal.discount.label')}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.discountPercentage}
                                        onChange={(e) => onChange('discountPercentage', e.target.value)}
                                        className="dashboard-field"
                                        placeholder={t('instructorDashboard.enrollGroupStudentModal.discount.placeholder')}
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-slate-900 px-5 py-5 text-white dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <FiLayers className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.enrollGroupStudentModal.snapshot.title')}
                                </div>
                                <div className="mt-4 grid gap-3">
                                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                            {t('instructorDashboard.enrollGroupStudentModal.snapshot.groupId')}
                                        </div>
                                        <div className="mt-1 text-sm font-medium">{group?.id || '—'}</div>
                                    </div>
                                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                            {t('instructorDashboard.enrollGroupStudentModal.snapshot.fill')}
                                        </div>
                                        <div className="mt-1 text-sm font-medium">{seatUsage}</div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiUsers className="h-4 w-4 text-edubot-orange" />
                                    {t('instructorDashboard.enrollGroupStudentModal.currentStudents.title')}
                                </div>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollGroupStudentModal.currentStudents.description')}
                                </p>

                                <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/45">
                                    {loadingStudents ? (
                                        <Loader fullScreen={false} />
                                    ) : normalizedStudents.length ? (
                                        <div className="max-h-52 space-y-2 overflow-auto pr-1">
                                            {normalizedStudents.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-edubot-ink dark:bg-slate-800 dark:text-white">
                                                        {getInitials(student.name || student.email)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium text-edubot-ink dark:text-white">
                                                            {student.name}
                                                        </div>
                                                        <div className="truncate text-xs text-edubot-muted dark:text-slate-400">
                                                            {student.email ||
                                                                t('instructorDashboard.enrollGroupStudentModal.fallbacks.noEmail')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.enrollGroupStudentModal.currentStudents.empty')}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-edubot-line/70 bg-white/95 px-6 py-4 sm:px-7 dark:border-slate-700 dark:bg-[#151922]/95">
                        <button
                            type="button"
                            className="dashboard-button-secondary"
                            onClick={onClose}
                            disabled={enrolling}
                        >
                            {t('instructorDashboard.enrollGroupStudentModal.actions.close')}
                        </button>

                        <button
                            type="submit"
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={enrolling}
                        >
                            <FiUserPlus className="h-4 w-4" />
                            {enrolling
                                ? t('instructorDashboard.enrollGroupStudentModal.actions.enrolling')
                                : t('instructorDashboard.enrollGroupStudentModal.actions.enroll')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EnrollGroupStudentModal.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        code: PropTypes.string,
        seatLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    course: PropTypes.shape({
        title: PropTypes.string,
    }),
    form: PropTypes.shape({
        userId: PropTypes.string,
        discountPercentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    enrolling: PropTypes.bool,
    students: studentCollectionShape,
    loadingStudents: PropTypes.bool,
    studentOptions: studentCollectionShape,
    userSearch: PropTypes.string,
    onSearchChange: PropTypes.func.isRequired,
    loadingUserOptions: PropTypes.bool,
    showDropdown: PropTypes.bool,
    setShowDropdown: PropTypes.func.isRequired,
};

EnrollGroupStudentModal.defaultProps = {
    group: null,
    course: null,
    enrolling: false,
    students: [],
    loadingStudents: false,
    studentOptions: [],
    userSearch: '',
    loadingUserOptions: false,
    showDropdown: false,
};

export default EnrollGroupStudentModal;
