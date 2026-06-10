import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExternalResourceCard from '../components/ExternalResourceCard';
import ExternalResourceFilters from '../components/ExternalResourceFilters';
import { fetchExternalResources } from '../api';
import { getResourcesByCategory } from '../data/externalResources';

const useResources = (category) => {
    const [items, setItems] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setError(false);
        setItems(null);

        fetchExternalResources({ category })
            .then((data) => {
                if (!cancelled) setItems(data);
            })
            .catch(() => {
                if (!cancelled) {
                    // Fall back to static data when API is unavailable
                    setItems(getResourcesByCategory(category));
                    setError(true);
                }
            });

        return () => { cancelled = true; };
    }, [category]);

    return { items, loading: items === null && !error, error };
};

const SkeletonCard = () => (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 h-72 animate-pulse" />
);

const ExternalResourcesPage = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');
    const { items, loading } = useResources(activeCategory);

    const totalCount = items?.length ?? getResourcesByCategory('all').length;

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            <div className="px-4 py-12 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">
                <div className="mb-10">
                    <h1 className="font-suisse font-bold text-3xl sm:text-4xl text-[#141619] dark:text-[#E8ECF3] mb-3">
                        {t('public.externalResources.pageTitle')}
                    </h1>
                    <p className="font-suisse text-[#3E424A] dark:text-[#a6adba] text-base max-w-2xl">
                        {t('public.externalResources.pageSubtitle', { count: totalCount })}
                    </p>
                </div>

                <div className="mb-8">
                    <ExternalResourceFilters
                        active={activeCategory}
                        onChange={setActiveCategory}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : items?.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">
                        {t('public.externalResources.emptyCategory')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((resource) => (
                            <ExternalResourceCard key={resource.id ?? resource.slug} {...resource} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExternalResourcesPage;
