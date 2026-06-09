import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExternalResourceCard from '../components/ExternalResourceCard';
import ExternalResourceFilters from '../components/ExternalResourceFilters';
import { EXTERNAL_RESOURCES, getResourcesByCategory } from '../data/externalResources';

const ExternalResourcesPage = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');
    const items = getResourcesByCategory(activeCategory);

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            <div className="px-4 py-12 sm:px-6 lg:px-12 max-w-screen-xl mx-auto">
                <div className="mb-10">
                    <h1 className="font-suisse font-bold text-3xl sm:text-4xl text-[#141619] dark:text-[#E8ECF3] mb-3">
                        {t('public.externalResources.pageTitle')}
                    </h1>
                    <p className="font-suisse text-[#3E424A] dark:text-[#a6adba] text-base max-w-2xl">
                        {t('public.externalResources.pageSubtitle', { count: EXTERNAL_RESOURCES.length })}
                    </p>
                </div>

                <div className="mb-8">
                    <ExternalResourceFilters
                        active={activeCategory}
                        onChange={setActiveCategory}
                    />
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">
                        {t('public.externalResources.emptyCategory')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((resource) => (
                            <ExternalResourceCard key={resource.id} {...resource} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExternalResourcesPage;
