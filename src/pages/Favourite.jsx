import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse';
import { AuthContext } from '../context/AuthContext';
import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isPublicVideoSignupEnabled } from '@shared/auth-config';
import EmptyState from '@components/ui/dashboard/EmptyState';
import { FiBookOpen, FiHeart, FiRefreshCw, FiSearch, FiSliders } from 'react-icons/fi';

const FavouritePageShell = ({ children, totalCount = 0, visibleCount = 0, actions = null }) => {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)] lg:p-8">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                                <FiHeart className="h-4 w-4" />
                                {t('public.favourites.eyebrow')}
                            </div>
                            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                                {t('public.favourites.title')}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                                {t('public.favourites.description')}
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                    {t('public.favourites.savedCount')}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalCount}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                    {t('public.favourites.visibleCount')}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                    {visibleCount}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                    {t('public.favourites.nextStep')}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                    {totalCount
                                        ? t('public.favourites.nextStepWithItems')
                                        : t('public.favourites.nextStepEmpty')}
                                </p>
                            </div>
                        </div>
                    </div>
                    {actions ? (
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/60 lg:px-8">
                            {actions}
                        </div>
                    ) : null}
                </section>

                {children}
            </div>
        </main>
    );
};

const FavouriteSkeletonGrid = () => {
    const { t } = useTranslation();

    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                aria-label={t('public.favourites.loadingAria')}
            >
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="min-h-[28rem] animate-pulse rounded-3xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                    />
                ))}
            </div>
        </section>
    );
};

const Favourite = () => {
    const { t, i18n } = useTranslation();
    const { favourites, loading, error, refreshFavourites } = useFavourites();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    const visibleFavourites = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const filtered = normalizedSearch
            ? favourites.filter((course) => {
                  const title = String(course.title || '').toLowerCase();
                  const instructor = String(course.instructor?.fullName || '').toLowerCase();
                  return title.includes(normalizedSearch) || instructor.includes(normalizedSearch);
              })
            : favourites;

        return [...filtered].sort((a, b) => {
            if (sortBy === 'title') {
                return String(a.title || '').localeCompare(String(b.title || ''), i18n.language);
            }
            if (sortBy === 'price') {
                return Number(a.price || 0) - Number(b.price || 0);
            }

            const aAddedAt = new Date(a.addedAt || 0).getTime();
            const bAddedAt = new Date(b.addedAt || 0).getTime();

            if (Number.isFinite(aAddedAt) && Number.isFinite(bAddedAt) && aAddedAt !== bAddedAt) {
                return bAddedAt - aAddedAt;
            }

            return Number(b.id || 0) - Number(a.id || 0);
        });
    }, [favourites, i18n.language, search, sortBy]);

    if (!user) {
        return (
            <FavouritePageShell>
                <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                    <EmptyState
                        title={t('public.favourites.accessTitle')}
                        subtitle={
                            isPublicVideoSignupEnabled
                                ? t('public.favourites.accessSignupSubtitle')
                                : t('public.favourites.accessLoginSubtitle')
                        }
                        variant="access"
                        icon={<FiHeart className="h-14 w-14 text-blue-500" aria-hidden="true" />}
                    />
                    <div className="mx-auto mt-2 grid max-w-md gap-3 sm:grid-cols-2">
                        {isPublicVideoSignupEnabled ? (
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-3 text-sm font-semibold text-white orange__shadow transition hover:from-[#C2410C] hover:to-[#C2410C] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                {t('common.signup')}
                            </Link>
                        ) : null}
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#EA580C] hover:bg-[#EA580C] hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-700 dark:text-white"
                        >
                            {t('common.login')}
                        </Link>
                        <Link
                            to="/courses"
                            className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-blue-600 hover:text-blue-800 sm:col-span-2"
                        >
                            {t('public.favourites.browseCourses')}
                        </Link>
                    </div>
                </section>
            </FavouritePageShell>
        );
    }

    if (loading) {
        return (
            <FavouritePageShell>
                <FavouriteSkeletonGrid />
            </FavouritePageShell>
        );
    }

    if (error) {
        return (
            <FavouritePageShell>
                <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                    <EmptyState
                        title={t('public.favourites.loadErrorTitle')}
                        subtitle={String(error)}
                        variant="error"
                        action={{ label: t('public.favourites.retry'), onClick: refreshFavourites }}
                        role="alert"
                    />
                </section>
            </FavouritePageShell>
        );
    }

    const actions = favourites.length ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
            <div>
                <label
                    htmlFor="favourites-search"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {t('public.favourites.searchLabel')}
                </label>
                <div className="relative mt-1">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        id="favourites-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('public.favourites.searchPlaceholder')}
                        className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                </div>
            </div>
            <div>
                <label
                    htmlFor="favourites-sort"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {t('public.favourites.sortLabel')}
                </label>
                <div className="relative mt-1">
                    <FiSliders className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                        id="favourites-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                        <option value="recent">{t('public.favourites.sortOptions.recent')}</option>
                        <option value="title">{t('public.favourites.sortOptions.title')}</option>
                        <option value="price">{t('public.favourites.sortOptions.price')}</option>
                    </select>
                </div>
            </div>
            <Link
                to="/courses"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50 dark:border-orange-500/30 dark:bg-gray-950 dark:text-orange-300 dark:hover:bg-orange-500/10"
            >
                <FiBookOpen className="h-4 w-4" />
                {t('public.favourites.findMoreCourses')}
            </Link>
        </div>
    ) : null;

    return (
        <FavouritePageShell
            totalCount={favourites.length}
            visibleCount={visibleFavourites.length}
            actions={actions}
        >
            <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {t('public.favourites.savedCoursesTitle')}
                        </h2>
                        <p
                            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                            aria-live="polite"
                        >
                            {t('public.favourites.visibleSummary', {
                                visible: visibleFavourites.length,
                                total: favourites.length,
                            })}
                        </p>
                    </div>
                    {favourites.length ? (
                        <button
                            type="button"
                            onClick={refreshFavourites}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-700 dark:border-gray-800 dark:text-gray-300 dark:hover:border-orange-500/40 dark:hover:text-orange-300"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            {t('public.favourites.refresh')}
                        </button>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {favourites.length === 0 ? (
                        <EmptyState
                            title={t('public.favourites.emptyTitle')}
                            subtitle={t('public.favourites.emptySubtitle')}
                            variant="discovery"
                            action={{
                                label: t('public.favourites.browseCourses'),
                                onClick: () => navigate('/courses'),
                            }}
                            className="col-span-full rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                        />
                    ) : visibleFavourites.length === 0 ? (
                        <EmptyState
                            title={t('public.favourites.noSearchResultsTitle')}
                            subtitle={t('public.favourites.noSearchResultsSubtitle')}
                            variant="discovery"
                            action={{
                                label: t('public.favourites.clearSearch'),
                                onClick: () => setSearch(''),
                            }}
                            className="col-span-full rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                        />
                    ) : (
                        visibleFavourites.map((course) => (
                            <CardCourse
                                key={course.id}
                                {...course}
                                title={
                                    course.title ||
                                    t('public.favourites.courseFallback', { id: course.id })
                                }
                                instructor={
                                    course.instructor || {
                                        fullName: t('public.favourites.instructorFallback'),
                                        id: null,
                                    }
                                }
                                price={course.price ?? 0}
                                ratingCount={course.ratingCount ?? 0}
                                ratingAverage={course.ratingAverage ?? 0}
                                durationInHours={course.durationInHours ?? 0}
                                lessonCount={course.lessonCount ?? 0}
                                isPublished={course.isPublished ?? true}
                            />
                        ))
                    )}
                </div>
            </section>
        </FavouritePageShell>
    );
};

export default Favourite;
