/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import {
    EmptyState,
    DashboardCardSkeleton,
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '@components/ui/dashboard';
import { FiBookOpen, FiClock, FiEdit3, FiEye, FiLayers, FiPlus, FiUsers } from 'react-icons/fi';
import CreateDeliveryCourseModal from './modals/CreateDeliveryCourseModal.jsx';

const CoursesSection = ({
    courses,
    loading,
    onOpenDeliveryModal,
    showDeliveryModal,
    onCloseDeliveryModal,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    deliveryCategories,
}) => {
    const publishedCount = courses.filter((course) => course.isPublished).length;
    const pendingCount = courses.filter((course) => !course.isPublished).length;
    const totalStudents = courses.reduce(
        (sum, course) => sum + Number(course.studentsCount || 0),
        0
    );

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Courses workspace"
                title="Курстарым"
                description="Жарыяланган жана каралуудагы курстарды көзөмөлдөп, жаңы видео же оффлайн/live багыттарды ушул жерден башкарыңыз."
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onOpenDeliveryModal}
                            className="dashboard-button-secondary"
                        >
                            <FiLayers className="h-4 w-4" />
                            Оффлайн/Live курс
                        </button>

                        <Link
                            to="/instructor/course/create"
                            className="dashboard-button-primary"
                        >
                            <FiPlus className="h-4 w-4" />
                            Жаңы курс
                        </Link>
                    </div>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label="Бардык курстар"
                    value={courses.length}
                    icon={FiBookOpen}
                />
                <DashboardMetricCard
                    label="Жарыяланган"
                    value={publishedCount}
                    icon={FiUsers}
                    tone="green"
                />
                <DashboardMetricCard
                    label="Каралууда"
                    value={pendingCount}
                    icon={FiClock}
                    tone="amber"
                />
                <DashboardMetricCard
                    label="Студенттер"
                    value={totalStudents}
                    icon={FiUsers}
                    tone="blue"
                />
            </div>

            <DashboardInsetPanel
                title="Курс тизмеси"
                description="Ар бир курстун абалын, категориясын жана акыркы жаңыртылган убактысын ушул жерден көрүңүз."
            >
                <div className="mt-4">
                    {loading && !courses.length ? (
                        <DashboardCardSkeleton cards={4} />
                    ) : courses.length ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {courses.map((course) => (
                                <div
                                    key={course.id || course.title}
                                    className="group rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:border-edubot-orange/40 hover:shadow-edubot-hover dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-edubot-ink transition-colors duration-300 group-hover:text-edubot-orange dark:text-white">
                                                {course.title}
                                            </h3>
                                            {course.category?.name ? (
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {course.category.name}
                                                </p>
                                            ) : null}
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                course.isPublished
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                            }`}
                                        >
                                            {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                        {course.description || 'Сүрөттөмө жок'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-edubot-orange/10 px-2.5 py-1 text-xs font-medium text-edubot-orange dark:bg-edubot-orange/20">
                                            {course.category?.name || course.category || 'Категориясыз'}
                                        </span>
                                        <span className="text-xs text-edubot-muted dark:text-slate-400">
                                            {course.price ? `${course.price} сом` : 'Акысыз'}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Студенттер
                                            </p>
                                            <p className="mt-2 text-lg font-semibold text-edubot-ink dark:text-white">
                                                {course.studentsCount ? `${course.studentsCount}` : '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted dark:text-slate-400">
                                                Жаңыртылды
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                {course.updatedAt
                                                    ? new Date(course.updatedAt).toLocaleDateString()
                                                    : 'Маалымат жок'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="dashboard-button-secondary"
                                        >
                                            <FiEye className="h-4 w-4" />
                                            Көрүү
                                        </Link>
                                        <Link
                                            to={`/instructor/courses/edit/${course.id}`}
                                            className="dashboard-button-primary"
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            Өзгөртүү
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Курстар азырынча жок"
                            subtitle="Биринчи курсуңузду түзүп баштаңыз."
                            icon={<FiBookOpen className="h-8 w-8 text-edubot-orange" />}
                            action={(
                                <Link
                                    to="/instructor/course/create"
                                    className="dashboard-button-primary"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Курс түзүү
                                </Link>
                            )}
                        />
                    )}
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

const CoursesSectionWithModal = (props) => (
    <>
        <CoursesSection {...props} />
        {props.showDeliveryModal && (
            <CreateDeliveryCourseModal
                isOpen={props.showDeliveryModal}
                onClose={props.onCloseDeliveryModal}
                onCreateDeliveryCourse={props.onCreateDeliveryCourse}
                creatingDeliveryCourse={props.creatingDeliveryCourse}
                deliveryCategories={props.deliveryCategories}
            />
        )}
    </>
);

export default CoursesSectionWithModal;
