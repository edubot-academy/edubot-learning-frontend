/* eslint-disable react/prop-types */
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import { FiBookOpen, FiFolder, FiLayers, FiTrash2, FiUploadCloud, FiUsers } from 'react-icons/fi';

const getCourseTypeLabel = (courseType) => {
    switch (courseType) {
        case 'offline':
            return 'Оффлайн';
        case 'online_live':
            return 'Онлайн түз эфир';
        default:
            return 'Видео';
    }
};

const AdminCoursesTab = ({
    courses,
    categories,
    users,
    newCategory,
    editingCategoryId,
    editingCategoryName,
    transcodeCourseId,
    transcodeSectionId,
    transcodeLessonId,
    transcodeLoading,
    setNewCategory,
    setEditingCategoryId,
    setEditingCategoryName,
    setTranscodeCourseId,
    setTranscodeSectionId,
    setTranscodeLessonId,
    handleDeleteCourse,
    handleEnrollUser,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleTranscode,
}) => {
    const publishedCourses = courses.filter((course) => course.isPublished).length;
    const deliveryCourses = courses.filter((course) => course.courseType !== 'video').length;

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Catalog operations"
                title="Курстар жана категориялар"
                description="Курстарды, категорияларды жана техникалык курс операцияларын ушул жерден башкарыңыз."
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label="Курстар" value={courses.length} icon={FiBookOpen} />
                <DashboardMetricCard
                    label="Жарыяланган"
                    value={publishedCourses}
                    icon={FiLayers}
                    tone={publishedCourses ? 'green' : 'default'}
                />
                <DashboardMetricCard label="Категориялар" value={categories.length} icon={FiFolder} />
                <DashboardMetricCard
                    label="Delivery курстар"
                    value={deliveryCourses}
                    icon={FiUsers}
                    tone={deliveryCourses ? 'blue' : 'default'}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <DashboardInsetPanel
                    title="Курстар"
                    description="Курс карталарын карап чыгып, алдын ала көрүп жана студент жаздырыңыз."
                >
                    {courses.length ? (
                        <div className="mt-4 space-y-3">
                            {courses.map((course) => (
                                <article
                                    key={course.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-edubot-ink dark:text-white">{course.title}</p>
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
                                                    {getCourseTypeLabel(course.courseType)}
                                                </span>
                                                {course.isPublished ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                        Жарыяланган
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                        Даярдалууда
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                Окутуучу: {course.instructor?.fullName || '—'}
                                            </p>
                                            {course.shortDescription ? (
                                                <p className="mt-2 line-clamp-2 text-sm text-edubot-muted dark:text-slate-400">
                                                    {course.shortDescription}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Link to={`/courses/${course.id}`} className="dashboard-button-secondary">
                                                Көрүү
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Өчүрүү
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-medium text-edubot-muted dark:text-slate-400">
                                            Колдонуучуну курска жазуу
                                        </label>
                                        <select
                                            onChange={(e) => handleEnrollUser(e.target.value, course.id)}
                                            className="dashboard-select w-full"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Колдонуучуну тандаңыз
                                            </option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.fullName} ({u.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <EmptyState
                                title="Системада курстар жок"
                                subtitle="Платформада курстар жазылган эмес"
                            />
                        </div>
                    )}
                </DashboardInsetPanel>

                <div className="space-y-6">
                    <DashboardInsetPanel
                        title="Категориялар"
                        description="Категорияларды кошуп, атын өзгөртүп жана тазалаңыз."
                    >
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                                value={newCategory || ''}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="dashboard-field flex-1"
                                placeholder="Жаңы категориянын аталышы"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="dashboard-button-primary self-start"
                            >
                                Кошуу
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    {editingCategoryId === category.id ? (
                                        <div className="flex flex-col gap-3">
                                            <input
                                                value={editingCategoryName}
                                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                                className="dashboard-field"
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateCategory(category.id)}
                                                    className="dashboard-button-primary"
                                                >
                                                    Сактоо
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(null);
                                                        setEditingCategoryName('');
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Жокко чыгаруу
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="font-medium text-edubot-ink dark:text-white">
                                                {category.name}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(category.id);
                                                        setEditingCategoryName(category.name);
                                                    }}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Өзгөртүү
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="dashboard-button-secondary"
                                                >
                                                    Өчүрүү
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title="HLS транс коддоо"
                        description="MP4 сабакты HLSке айландыруу үчүн Course / Section / Lesson ID киргизиңиз."
                    >
                        <div className="mt-4 grid gap-3">
                            <input
                                type="number"
                                placeholder="Course ID"
                                value={transcodeCourseId || ''}
                                onChange={(e) => setTranscodeCourseId(e.target.value)}
                                className="dashboard-field"
                            />
                            <input
                                type="number"
                                placeholder="Section ID"
                                value={transcodeSectionId}
                                onChange={(e) => setTranscodeSectionId(e.target.value)}
                                className="dashboard-field"
                            />
                            <input
                                type="number"
                                placeholder="Lesson ID"
                                value={transcodeLessonId || ''}
                                onChange={(e) => setTranscodeLessonId(e.target.value)}
                                className="dashboard-field"
                            />
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleTranscode}
                                disabled={transcodeLoading}
                                className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiUploadCloud className="h-4 w-4" />
                                {transcodeLoading ? <Loader fullScreen={false} /> : 'Транс коддоо'}
                            </button>
                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                ffmpeg серверде орнотулган болушу керек.
                            </p>
                        </div>
                    </DashboardInsetPanel>
                </div>
            </div>
        </div>
    );
};

export default AdminCoursesTab;
