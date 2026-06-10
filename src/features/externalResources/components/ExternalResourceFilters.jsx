import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../data/externalResources';

const ExternalResourceFilters = ({ active, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.key}
                    onClick={() => onChange(cat.key)}
                    className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
                        active === cat.key
                            ? 'bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white border-transparent shadow'
                            : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:border-[#E14219] hover:text-[#E14219] dark:hover:border-[#FF8C6E] dark:hover:text-[#FF8C6E]'
                    }`}
                >
                    {t(`public.externalResources.categories.${cat.key}`)}
                </button>
            ))}
        </div>
    );
};

export default ExternalResourceFilters;
