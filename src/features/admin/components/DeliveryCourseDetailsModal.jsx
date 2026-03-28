/* eslint-disable react/prop-types */
import AdvancedModal from '@shared/ui/AdvancedModal';
import { FiBookOpen, FiClock, FiLayers, FiMapPin, FiUser } from 'react-icons/fi';

const getCourseTypeLabel = (courseType) => {
    if (courseType === 'offline') return 'Оффлайн';
    if (courseType === 'online_live') return 'Онлайн түз эфир';
    return 'Видео';
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const DeliveryCourseDetailsModal = ({ course, isOpen, onClose }) => {
    if (!course) return null;

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Delivery курс маалыматы"
            subtitle="Бул курс коомдук видео-баракчага эмес, ички башкаруу агымдарына тиешелүү."
            size="md"
            actions={[
                {
                    id: 'close',
                    label: 'Жабуу',
                    onClick: onClose,
                    variant: 'primary',
                },
            ]}
        >
            <div className="space-y-4">
                <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                            {course.title}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {getCourseTypeLabel(course.courseType)}
                        </span>
                    </div>
                    {course.description ? (
                        <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                            {course.description}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                            <FiLayers className="h-4 w-4" />
                            Категория
                        </p>
                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                            {course.category?.name || 'Категориясыз'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                            <FiUser className="h-4 w-4" />
                            Окутуучу
                        </p>
                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                            {course.instructor?.fullName || '—'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                            <FiBookOpen className="h-4 w-4" />
                            Баасы
                        </p>
                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                            {Number(course.price || 0) > 0 ? `${course.price} сом` : 'Акысыз'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                            <FiClock className="h-4 w-4" />
                            Түзүлгөн күнү
                        </p>
                        <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                            {formatDate(course.createdAt)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70 sm:col-span-2">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                            <FiMapPin className="h-4 w-4" />
                            Эскертүү
                        </p>
                        <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                            Delivery курстар үчүн деталдуу башкаруу группа, сессия жана enrollment табдары аркылуу жүргүзүлөт.
                        </p>
                    </div>
                </div>
            </div>
        </AdvancedModal>
    );
};

export default DeliveryCourseDetailsModal;
