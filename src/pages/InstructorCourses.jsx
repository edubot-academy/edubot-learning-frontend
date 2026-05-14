import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useInstructorCourseListPage } from '@features/instructor-dashboard/hooks/useInstructorCourseListPage';

const courseTypeLabel = (type) => {
    const normalized = String(type || 'video').toLowerCase();
    if (normalized === 'offline') return 'Offline';
    if (normalized === 'online_live') return 'Online Live';
    return 'Video';
};

const InstructorCourses = () => {
    const { user } = useContext(AuthContext);
    const { courses, error, loading, refresh } = useInstructorCourseListPage(user);

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Менин курстарым</h1>
            {error && (
                <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                    <p className="font-semibold">Курстарды алуу ишке ашкан жок.</p>
                    <button
                        type="button"
                        onClick={refresh}
                        className="mt-2 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Кайра жүктөө
                    </button>
                </div>
            )}
            {loading && (
                <div className="mb-6 text-center text-gray-600 dark:text-gray-300" role="status">
                    Курстар жүктөлүүдө...
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white dark:bg-[#141619] rounded shadow p-4 relative">
                        {course.coverImageUrl && (
                            <img
                                src={course.coverImageUrl}
                                alt={course.title}
                                className="w-full h-48 object-cover mb-4"
                                loading="lazy"
                                decoding="async"
                            />
                        )}
                        <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                        <span className="inline-flex mb-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {courseTypeLabel(course.courseType || course.type)}
                        </span>
                        <p className="text-gray-700 dark:text-[#a6adba] mb-2">
                            {course.instructor?.fullName || user?.fullName || '—'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-[#a6adba] mb-2">Баасы: {course.price} с</p>
                        <span
                            className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                                course.isPublished
                                    ? 'bg-green-100 text-gray-700 dark:text-[#a6adba]'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                            {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
                        </span>
                        <Link
                            to={`/instructor/courses/edit/${course.id}`}
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded transition duration-300 hover:bg-blue-500 hover:shadow-lg"
                        >
                            {course.isPublished ? 'Tастыктоо' : 'Өзгөртүү'}
                        </Link>
                    </div>
                ))}
            </div>
            {!loading && !error && !courses.length && (
                <div className="rounded border border-gray-200 p-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    Азырынча курстарыңыз жок.
                </div>
            )}
        </div>
    );
};

export default InstructorCourses;
