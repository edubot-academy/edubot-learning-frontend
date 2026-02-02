import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchSecureCourses, listCourseSessions } from '@services/api';
import { FiCalendar } from 'react-icons/fi';
import GlassCard from '@shared/ui/GlassCard';

const InstructorCourses = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [activeType, setActiveType] = useState('video');

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchSecureCourses({ courseType: activeType === 'video' ? 'video' : activeType });
                const list = response.courses || response.items || [];
                const instructorCourses = list.filter((course) => course.instructor?.id === user?.id);
                setCourses(instructorCourses);
            } catch (err) {
                console.error('Курстарды алуу ишке ашкан жок', err);
            }
        };

        if (user?.role === 'instructor') loadCourses();
    }, [user, activeType]);

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Инструктор</p>
                    <h1 className="text-3xl font-bold text-gray-900">Менин курстарым</h1>
                </div>
                <Link
                    to="/instructor/course/create"
                    className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm shadow"
                >
                    Курс түзүү
                </Link>
            </div>
            <div className="flex gap-2 mb-2">
                {['video', 'offline', 'online_live'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveType(type)}
                        className={`px-4 py-2 rounded-full text-sm transition ${
                            activeType === type
                                ? 'bg-emerald-600 text-white shadow'
                                : 'border border-gray-200 bg-white text-gray-700'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses
                    .filter((c) =>
                        activeType === 'video' ? !c.courseType || c.courseType === 'video' : c.courseType === activeType
                    )
                    .map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
            </div>
        </div>
    );
};

const CourseCard = ({ course }) => {
    const [nextSession, setNextSession] = useState(null);
    useEffect(() => {
        const loadNext = async () => {
            if (!course.courseType || course.courseType === 'video') return;
            try {
                const res = await listCourseSessions(course.id);
                const items = Array.isArray(res?.items) ? res.items : res || [];
                const sorted = [...items].sort(
                    (a, b) => new Date(a.startsAt || a.date || 0) - new Date(b.startsAt || b.date || 0)
                );
                setNextSession(sorted.find((s) => s.status !== 'completed') || sorted[0] || null);
            } catch (error) {
                console.error('Failed to load sessions', error);
            }
        };
        loadNext();
    }, [course]);

    const days = course.daysOfWeek?.length ? course.daysOfWeek.join(', ') : '—';
    return (
        <GlassCard className="p-4 relative border border-gray-100">
            <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                    course.isPublished ? 'bg-green-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                }`}
            >
                {course.isPublished ? 'Жарыяланды' : 'Каралууда'}
            </span>
            <h2 className="text-lg font-semibold mb-1">{course.title}</h2>
            <p className="text-xs text-gray-500 mb-2">
                {course.startDate} → {course.endDate} · {days} · {course.dailyStartTime || course.startTime || '—'}
            </p>
            <p className="text-xs text-gray-500 mb-2">
                Орундар: {course.seatLimit ? `${course.seatLimit}` : '—'}
            </p>
            {nextSession && (
                <div className="text-xs text-gray-600 flex items-center gap-1">
                    <FiCalendar className="text-gray-500" /> {nextSession.date || nextSession.startsAt} ·{' '}
                    {nextSession.startTime}
                </div>
            )}
            <div className="flex items-center justify-between mt-4">
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    {course.courseType || 'video'}
                </span>
                <Link
                    to={
                        course.courseType && course.courseType !== 'video'
                            ? `/instructor/courses/${course.id}/manage`
                            : `/instructor/courses/edit/${course.id}`
                    }
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded transition duration-300 hover:bg-blue-500 hover:shadow-lg"
                >
                    {course.courseType && course.courseType !== 'video'
                        ? 'Башкаруу'
                        : course.isPublished
                          ? 'Tастыктоо'
                          : 'Өзгөртүү'}
                </Link>
            </div>
        </GlassCard>
    );
};

export default InstructorCourses;
