import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
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

const EnrollStudentModal = ({
    offering,
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
    const seatUsage =
        offering?.capacity != null
            ? `${offering.enrolledCount ?? 0}/${offering.capacity}`
            : t('instructorDashboard.enrollStudentModal.unlimited');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-[52rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:bg-[#151922]">
                <div className="border-b border-edubot-line/70 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.98))] px-6 py-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_rgba(24,28,39,0.98),_rgba(21,25,34,1))] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-500/20 dark:bg-slate-900/60 dark:text-sky-300">
                                <FiUserPlus className="h-3.5 w-3.5" />
                                {t('instructorDashboard.enrollStudentModal.eyebrow')}
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-[2rem]">
                                    {offering?.course?.title || t('instructorDashboard.enrollStudentModal.fallbacks.offering')}
                                </h2>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollStudentModal.description', {
                                        offering: offering?.title || t('instructorDashboard.enrollStudentModal.fallbacks.offering'),
                                    })}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-edubot-line/80 bg-white/80 text-edubot-muted transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                            aria-label={t('common.closeMenu')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-500">
                                {t('instructorDashboard.enrollStudentModal.fallbacks.offering')}
                            </div>
                            <div className="mt-1 font-medium text-edubot-ink dark:text-white">
                                {offering?.title || '—'}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-500">
                                {t('instructorDashboard.enrollStudentModal.seats')}
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
                                    <FiSearch className="h-4 w-4 text-sky-600" />
                                    {t('instructorDashboard.enrollStudentModal.search.title')}
                                </div>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollStudentModal.search.description')}
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
                                        placeholder={t('instructorDashboard.enrollStudentModal.search.placeholder')}
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
                                                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
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
                                                                {student.name || t('instructorDashboard.enrollStudentModal.fallbacks.unknownStudent')}
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
                                            {t('instructorDashboard.enrollStudentModal.search.notFound')}
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
                                                        t('instructorDashboard.enrollStudentModal.fallbacks.studentWithId', {
                                                            id: form.userId,
                                                        })}
                                                </div>
                                                <div className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {selectedStudent?.email ||
                                                        t('instructorDashboard.enrollStudentModal.search.selectedId', {
                                                            id: form.userId,
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.enrollStudentModal.search.pickHint')}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiPercent className="h-4 w-4 text-sky-600" />
                                    {t('instructorDashboard.enrollStudentModal.discount.title')}
                                </div>
                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {t('instructorDashboard.enrollStudentModal.discount.label')}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.discountPercentage}
                                        onChange={(e) => onChange('discountPercentage', e.target.value)}
                                        className="dashboard-field"
                                        placeholder={t('instructorDashboard.enrollStudentModal.discount.placeholder')}
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-5">
                            <section className="rounded-[1.75rem] border border-edubot-line/70 bg-edubot-surfaceAlt/35 p-5 dark:border-slate-700 dark:bg-slate-900/35">
                                <div className="flex items-center gap-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                    <FiUsers className="h-4 w-4 text-sky-600" />
                                    {t('instructorDashboard.enrollStudentModal.currentStudents.title')}
                                </div>
                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.enrollStudentModal.currentStudents.description')}
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
                                                            {student.email || t('instructorDashboard.enrollStudentModal.fallbacks.noEmail')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('instructorDashboard.enrollStudentModal.currentStudents.empty')}
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
                            {t('instructorDashboard.enrollStudentModal.actions.close')}
                        </button>

                        <button
                            type="submit"
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={enrolling}
                        >
                            <FiUserPlus className="h-4 w-4" />
                            {enrolling
                                ? t('instructorDashboard.enrollStudentModal.actions.enrolling')
                                : t('instructorDashboard.enrollStudentModal.actions.enroll')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EnrollStudentModal.propTypes = {
    offering: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        title: PropTypes.string,
        capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        enrolledCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        course: PropTypes.shape({
            title: PropTypes.string,
        }),
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

EnrollStudentModal.defaultProps = {
    offering: null,
    enrolling: false,
    students: [],
    loadingStudents: false,
    studentOptions: [],
    userSearch: '',
    loadingUserOptions: false,
    showDropdown: false,
};

export default EnrollStudentModal;
