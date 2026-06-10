import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PROVIDER_COLORS, PROVIDER_LOGOS, resolveLabel } from '../data/externalResources';

const CATEGORY_ICONS = {
    programming: '💻',
    web: '🌐',
    data: '📊',
    ai: '🤖',
    default: '📚',
};

const ProviderLogo = ({ providerKey, provider }) => {
    const [primaryFailed, setPrimaryFailed] = useState(false);

    const color = PROVIDER_COLORS[providerKey] ?? '#888';
    const initial = provider?.charAt(0)?.toUpperCase() ?? '?';
    const primaryUrl = PROVIDER_LOGOS[providerKey];

    const wrapperCls = 'w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden flex-shrink-0 border border-white/60';

    if (!primaryFailed && primaryUrl) {
        return (
            <div className={wrapperCls}>
                <img
                    src={primaryUrl}
                    alt={provider}
                    className="w-7 h-7 object-contain"
                    onError={() => setPrimaryFailed(true)}
                />
            </div>
        );
    }

    return (
        <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0"
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

const CardHeader = ({ coverImageUrl, providerKey, provider, isFeatured, category }) => {
    const { t } = useTranslation();
    const [imageFailed, setImageFailed] = useState(false);
    const color = PROVIDER_COLORS[providerKey] ?? '#888';
    const categoryIcon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.default;

    return (
        <div className="relative h-32 overflow-hidden">
            {coverImageUrl && !imageFailed ? (
                <>
                    <img
                        src={coverImageUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setImageFailed(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                </>
            ) : (
                <>
                    <div className="absolute inset-0" style={{ backgroundColor: color }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-black/30" />
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.7) 10px, rgba(255,255,255,0.7) 11px)`,
                        }}
                    />
                    <span
                        className="absolute select-none pointer-events-none"
                        style={{ fontSize: '5rem', lineHeight: 1, bottom: '-0.5rem', right: '0.75rem', opacity: 0.15, filter: 'grayscale(1)' }}
                    >
                        {categoryIcon}
                    </span>
                </>
            )}

            {/* Category icon — top right */}
            <span className="absolute top-3 right-3 text-xl drop-shadow select-none">
                {categoryIcon}
            </span>

            {/* Featured badge — top left */}
            {isFeatured && (
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                    ⭐ {t('public.externalResources.featured')}
                </span>
            )}

            {/* Provider logo — bottom left */}
            <div className="absolute bottom-3 left-3">
                <ProviderLogo providerKey={providerKey} provider={provider} />
            </div>
        </div>
    );
};

const ExternalResourceCard = ({
    slug,
    title,
    provider,
    providerKey,
    level,
    category,
    priceLabel,
    certificateLabel,
    durationLabel,
    isFeatured,
    isFree: isFreeOverride,
    ctaLabel,
    coverImageUrl,
    content,
    url,
}) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const priceLabelText = resolveLabel(priceLabel, lang);
    const durationLabelText = resolveLabel(durationLabel, lang);
    const certificateLabelText = resolveLabel(certificateLabel, lang);
    const isFree = isFreeOverride ?? (
        /акысыз/i.test(typeof priceLabel === 'object' ? priceLabel.ky : priceLabel ?? '') ||
        /free|бесплатно/i.test(typeof priceLabel === 'object' ? priceLabel.en ?? priceLabel.ru : priceLabel ?? '')
    );

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">

            <CardHeader
                coverImageUrl={coverImageUrl}
                providerKey={providerKey}
                provider={provider}
                isFeatured={isFeatured}
                category={category}
            />

            <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 truncate">
                    {provider}
                </span>

                <h3 className="font-suisse font-bold text-[#141619] dark:text-[#E8ECF3] text-base leading-snug line-clamp-2 group-hover:text-[#E14219] dark:group-hover:text-[#FF8C6E] transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
                    {content?.shortDescription?.[lang] ?? content?.shortDescription?.ky ?? ''}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {isFree ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            {priceLabelText}
                        </span>
                    ) : priceLabelText ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            {priceLabelText}
                        </span>
                    ) : null}
                    {durationLabelText && (
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            ⏱ {durationLabelText}
                        </span>
                    )}
                    {level && (
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            {t(`public.externalResources.levels.${level}`, { defaultValue: level })}
                        </span>
                    )}
                </div>

                {certificateLabelText && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>🏅</span>
                        <span>{certificateLabelText}</span>
                    </div>
                )}
            </div>

            <div className="px-4 pb-4 flex gap-2">
                <Link
                    to={`/resources/${slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg font-medium text-sm px-4 py-2.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
                >
                    {ctaLabel ?? t('public.externalResources.learnWithGuidance')}
                </Link>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:border-[#E14219] hover:text-[#E14219] dark:hover:border-[#FF8C6E] dark:hover:text-[#FF8C6E] px-3 py-2.5 transition-all duration-300"
                    title={t('public.externalResources.officialSite')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default ExternalResourceCard;
