import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCatalogCourses } from '@services/api';
import CardCourse from '@features/courses/components/CardCourse';
import EmptyState from '@components/ui/dashboard/EmptyState';
import { FiAlertTriangle, FiBookOpen, FiRefreshCw, FiSliders } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import SectionContainer from '@features/marketing/components/SectionContainer';
import ExternalResourceCard from '@features/externalResources/components/ExternalResourceCard';
import { fetchExternalResources } from '@features/externalResources/api';

const getCourseType = (course) =>
    String(course?.courseType || course?.type || 'video').toLowerCase();

const getCoursePrice = (course) => {
    const price = Number(course?.price);
    return Number.isFinite(price) ? price : 0;
};

const CoursesPage = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('recommended');
    const [visibleCount, setVisibleCount] = useState(9);
    const [featuredResources, setFeaturedResources] = useState([]);

    const loadCourses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchCatalogCourses();
            setCourses(Array.isArray(data?.items) ? data.items : []);
        } catch (err) {
            console.error('Failed to load courses', err);
            setError(t('public.courses.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    useEffect(() => {
        fetchExternalResources({ featured: true })
            .then(({ data }) => setFeaturedResources(data.slice(0, 3)))
            .catch(() => setFeaturedResources([]));
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
        return [...publicVideoCourses].sort((a, b) => {
            if (sortBy === 'price-low') return getCoursePrice(a) - getCoursePrice(b);
            if (sortBy === 'price-high') return getCoursePrice(b) - getCoursePrice(a);
            if (sortBy === 'rating')
                return Number(b?.ratingAverage || 0) - Number(a?.ratingAverage || 0);
            return 0;
        });
    }, [publicVideoCourses, sortBy]);

    const hasActiveSort = sortBy !== 'recommended';
    const visibleCourses = sortedCourses.slice(0, visibleCount);
    const canShowMore = visibleCount < sortedCourses.length;
    const hiddenAssignedCount = courses.length - publicVideoCourses.length;
    const sortLabels = {
        recommended: t('public.courses.sortOptions.recommended'),
        rating: t('public.courses.sortOptions.rating'),
        'price-low': t('public.courses.sortOptions.price-low'),
        'price-high': t('public.courses.sortOptions.price-high'),
    };

    useEffect(() => {
        setVisibleCount(9);
    }, [sortBy]);

    return (
        <div className="min-h-screen bg-white px-4 pb-12 pt-0 dark:bg-gray-900 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-7xl pt-5">
                <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                            <FiBookOpen aria-hidden="true" />
                            {t('public.courses.badge')}
                        </div>
                        <h1 className="text-4xl font-bold text-start mb-0 text-gray-900 dark:text-white">
                            {t('public.courses.title')}
                        </h1>
                        <p className="mt-2 max-w-2xl font-inter text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">
                            {t('public.courses.intro')}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {loading
                                    ? t('public.courses.loadingCount')
                                    : t('public.courses.videoCourseCount', {
                                          count: sortedCourses.length,
                                      })}
                            </span>
                            {!loading && hiddenAssignedCount > 0 && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                                    {t('public.courses.hiddenAssignedCount', {
                                        count: hiddenAssignedCount,
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950 sm:max-w-xs">
                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <FiSliders aria-hidden="true" />
                                {t('public.courses.sortLabel')}
                            </span>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="recommended">{sortLabels.recommended}</option>
                                <option value="rating">{sortLabels.rating}</option>
                                <option value="price-low">{sortLabels['price-low']}</option>
                                <option value="price-high">{sortLabels['price-high']}</option>
                            </select>
                        </label>
                    </div>
                </div>

                {hasActiveSort && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t('public.courses.activeSort', { label: sortLabels[sortBy] })}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setSortBy('recommended');
                            }}
                            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-400 dark:hover:text-orange-300"
                        >
                            {t('public.courses.clearSort')}
                        </button>
                    </div>
                )}

                {error ? (
                    <div
                        className="mt-10 rounded-[24px] border border-red-200 bg-red-50 px-5 py-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                        role="alert"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-red-600 dark:bg-red-500/10 dark:text-red-200">
                                <FiAlertTriangle aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('public.courses.loadErrorTitle')}
                                </h2>
                                <p className="mt-2 text-sm leading-6">{error}</p>
                                <button
                                    type="button"
                                    onClick={loadCourses}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <FiRefreshCw aria-hidden="true" />
                                    {t('public.courses.retry')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : loading ? (
                    <div
                        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        aria-label={t('public.courses.loadingAria')}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="min-h-[28rem] animate-pulse rounded-[24px] border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                            />
                        ))}
                    </div>
                ) : sortedCourses.length ? (
                    <>
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleCourses.map((course) => (
                                <CardCourse key={course.id} {...course} />
                            ))}
                        </div>
                        {canShowMore && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount((count) => count + 9)}
                                    className="rounded-xl border border-orange-500 px-5 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:text-orange-300 dark:hover:bg-orange-950/30"
                                >
                                    {t('public.courses.showMore')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        title={t('public.courses.emptyTitle')}
                        subtitle={t('public.courses.emptySubtitle')}
                        variant="discovery"
                        className="mt-10 rounded-[24px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
                    />
                )}
            </div>

            <SectionContainer
                title={t('public.externalResources.coursesSectionTitle')}
                subtitle={t('public.externalResources.coursesSectionSubtitle')}
                rightContent={
                    <Link
                        to="/resources"
                        className="text-sm font-medium text-[#E14219] hover:underline"
                    >
                        {t('public.externalResources.viewAll')} →
                    </Link>
                }
                items={featuredResources}
                CardComponent={ExternalResourceCard}
            />
        </div>
    );
};

export default CoursesPage;
