import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import InstructorEmptyState from './InstructorEmptyState.jsx';
import CreateDeliveryCourseModal from './modals/CreateDeliveryCourseModal.jsx';

const CoursesSection = ({
    courses,
    loading,
    onOpenDeliveryModal,
    showDeliveryModal,
    onCloseDeliveryModal,
    deliveryCourse,
    onDeliveryCourseChange,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    deliveryCategories,
}) => (
    <div className="rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
                <h2 className="text-2xl font-semibold">Курстарым</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Активдүү жана каралуудагы курстар
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenDeliveryModal}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-edubot-teal text-edubot-teal text-sm font-medium hover:bg-edubot-teal hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-edubot-teal/30 group"
                >
                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                        🎓
                    </span>
                    <span className="transition-transform duration-300 group-hover:scale-105">
                        Оффлайн/Live курс
                    </span>
                </button>

                <Link
                    to="/instructor/course/create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-edubot-green to-emerald-600 hover:from-emerald-600 hover:to-edubot-green text-white text-sm font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-edubot-green/30 group"
                >
                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                        ✨
                    </span>
                    <span className="transition-transform duration-300 group-hover:scale-105">
                        Жаңы курс
                    </span>
                </Link>
            </div>
        </div>

        {loading && !courses.length ? (
            <Loader fullScreen={false} />
        ) : courses.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                    <div key={course.id || course.title} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" />
                        <div className="absolute inset-0 bg-gradient-to-br from-edubot-orange/5 via-transparent to-edubot-soft/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative p-6 z-10 flex flex-col gap-4">
                            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-edubot-green to-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>

                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-edubot-orange transition-colors duration-300">
                                            {course.title}
                                        </h3>
                                        {course.category?.name && (
                                            <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                                {course.category.name}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${course.isPublished
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {course.description || 'Сүрөттөмө жок'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-[#a6adba]">
                                <span>
                                    {course.studentsCount
                                        ? `${course.studentsCount} студент`
                                        : 'Студенттер маалымат жок'}
                                </span>
                                <span>
                                    {course.updatedAt
                                        ? new Date(course.updatedAt).toLocaleDateString()
                                        : ''}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-2 py-1 bg-edubot-orange/10 text-edubot-orange dark:bg-edubot-orange/20 rounded-full text-xs font-medium">
                                        {course.category?.name || course.category || 'Категориясыз'}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {course.price ? `${course.price} сом` : 'Акысыз'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Көрүү
                                    </Link>
                                    <Link
                                        to={`/instructor/courses/edit/${course.id}`}
                                        className="px-4 py-2 rounded-full text-sm bg-blue-600 text-white"
                                    >
                                        Өзгөртүү
                                    </Link>
                                </div>
                            </div>

                            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-edubot-orange to-edubot-soft rounded-full w-1/3 transition-all duration-500 group-hover:w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <InstructorEmptyState
                title="Азырынча курс жок"
                description="Алгачкы курсту түзүп студенттерди чакырыңыз."
                actionLabel="Курс түзүү"
                actionLink="/instructor/course/create"
            />
        )}

        {showDeliveryModal && (
            <CreateDeliveryCourseModal
                deliveryCourse={deliveryCourse}
                onDeliveryCourseChange={onDeliveryCourseChange}
                onCloseDeliveryModal={onCloseDeliveryModal}
                onCreateDeliveryCourse={onCreateDeliveryCourse}
                creatingDeliveryCourse={creatingDeliveryCourse}
                deliveryCategories={deliveryCategories}
            />
        )}
    </div>
);

export default CoursesSection;
