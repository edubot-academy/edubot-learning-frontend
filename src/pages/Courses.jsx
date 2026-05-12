import React, { useMemo, useState, useEffect } from 'react';
import { fetchCatalogCourses } from '@services/api';
import CardCourse from '@features/courses/components/CardCourse';

const getCourseType = (course) => String(course?.courseType || course?.type || 'video').toLowerCase();

const getCoursePrice = (course) => {
    const price = Number(course?.price);
    return Number.isFinite(price) ? price : 0;
};

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('recommended');

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchCatalogCourses();
            setCourses(Array.isArray(data?.items) ? data.items : []);
        } catch (err) {
            console.error('Курстар жүктөлбөй калды', err);
            setError('Курстарды жүктөй алган жокпуз. Бир аздан кийин кайра аракет кылыңыз.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const publicVideoCourses = useMemo(() => {
        return courses
            .filter((course) => {
                const isVideoCourse = getCourseType(course) === 'video';
                const isPublished = course?.isPublished !== false;
                return isVideoCourse && isPublished;
            })
            .map((course) => course);
    }, [courses]);

    const sortedCourses = useMemo(() => {
        return [...publicVideoCourses]
            .sort((a, b) => {
                if (sortBy === 'price-low') return getCoursePrice(a) - getCoursePrice(b);
                if (sortBy === 'price-high') return getCoursePrice(b) - getCoursePrice(a);
                if (sortBy === 'rating') return Number(b?.ratingAverage || 0) - Number(a?.ratingAverage || 0);
                return 0;
            });
    }, [publicVideoCourses, sortBy]);

    const hasActiveSort = sortBy !== 'recommended';

    return (
        <div className="min-h-screen bg-white px-4 pb-12 pt-0 dark:bg-gray-900 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-7xl pt-5">
                <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-start mb-0 text-gray-900 dark:text-white">
                            Биздин курстар
                        </h1>
                        <p className="font-inter text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                            Сиз үчүн сунушталган курстар
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {loading ? 'Курстар жүктөлүүдө...' : `${sortedCourses.length} видео курс көрсөтүлүүдө`}
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <label className="block">
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Иреттөө
                            </span>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="recommended">Сунушталган</option>
                                <option value="rating">Рейтинг боюнча</option>
                                <option value="price-low">Арзандан кымбатка</option>
                                <option value="price-high">Кымбаттан арзанга</option>
                            </select>
                        </label>
                    </div>
                </div>

                {hasActiveSort && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Иреттөө активдүү
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setSortBy('recommended');
                            }}
                            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-400 dark:hover:text-orange-300"
                        >
                            Тазалоо
                        </button>
                    </div>
                )}

                {error ? (
                    <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                        <h2 className="text-lg font-semibold">Курстар жүктөлгөн жок</h2>
                        <p className="mt-2 text-sm">{error}</p>
                        <button
                            type="button"
                            onClick={loadCourses}
                            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Кайра аракет кылуу
                        </button>
                    </div>
                ) : loading ? (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Курстар жүктөлүүдө">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-[28rem] animate-pulse rounded border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
                        ))}
                    </div>
                ) : sortedCourses.length ? (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedCourses.map((course) => (
                            <CardCourse key={course.id} {...course} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-8 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                        <h2 className="text-lg font-semibold">Курс табылган жок</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Азырынча коомдук видео курстар жок.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
