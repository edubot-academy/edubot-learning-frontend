import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PROVIDER_COLORS, PROVIDER_LOGOS, resolveLabel } from '../data/externalResources';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const BadgeCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" aria-hidden>
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);

// Category SVG paths — 20×20 heroicons solid
const CATEGORY_SVG = {
    programming: { fillRule: 'evenodd', clipRule: 'evenodd', d: 'M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z' },
    web:         { fillRule: 'evenodd', clipRule: 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z' },
    data:        { d: 'M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' },
    ai:          { fillRule: 'evenodd', clipRule: 'evenodd', d: 'M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z' },
    english:     { fillRule: 'evenodd', clipRule: 'evenodd', d: 'M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-3.89H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z' },
    business:    { fillRule: 'evenodd', clipRule: 'evenodd', d: 'M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z' },
    cloud:       { d: 'M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z' },
    default:     { d: 'M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z' },
};

const CategorySvgPath = ({ category, className }) => {
    const shape = CATEGORY_SVG[category] ?? CATEGORY_SVG.default;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
            <path fillRule={shape.fillRule} clipRule={shape.clipRule} d={shape.d} />
        </svg>
    );
};

// ─── Provider logo ────────────────────────────────────────────────────────────
const ProviderLogo = ({ providerKey, provider }) => {
    const [failed, setFailed] = useState(false);
    const color = PROVIDER_COLORS[providerKey] ?? '#888';
    const initial = provider?.charAt(0)?.toUpperCase() ?? '?';
    const url = PROVIDER_LOGOS[providerKey];

    if (!failed && url) {
        return (
            <img
                src={url}
                alt={provider}
                className="w-14 h-14 object-contain drop-shadow-lg flex-shrink-0"
                loading="lazy"
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

// ─── Card header ─────────────────────────────────────────────────────────────
const CardHeader = ({ coverImageUrl, providerKey, provider, isFeatured, isFree, category }) => {
    const { t } = useTranslation();
    const [imageFailed, setImageFailed] = useState(false);
    const color = PROVIDER_COLORS[providerKey] ?? '#888';

    return (
        <div className="relative h-36 overflow-hidden">
            {coverImageUrl && !imageFailed ? (
                <>
                    <img
                        src={coverImageUrl}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setImageFailed(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5" />
                </>
            ) : (
                <>
                    <div className="absolute inset-0" style={{ backgroundColor: color }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/30" />
                    <CategorySvgPath
                        category={category}
                        className="absolute bottom-[-1.5rem] right-[-1rem] w-36 h-36 opacity-[0.12]"
                    />
                </>
            )}

            {/* Category icon — top right */}
            <CategorySvgPath
                category={category}
                className="absolute top-3 right-3 w-5 h-5 text-white drop-shadow opacity-90"
            />

            {/* Badges — top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                        <StarIcon />
                        {t('public.externalResources.featured')}
                    </span>
                )}
                {isFree && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/80 text-white backdrop-blur-sm border border-green-400/40">
                        {t('public.externalResources.auditFreeLabel', 'Free')}
                    </span>
                )}
            </div>

            {/* Provider logo — bottom left */}
            <div className="absolute bottom-3 left-3">
                <ProviderLogo providerKey={providerKey} provider={provider} />
            </div>
        </div>
    );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
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
    const navigate = useNavigate();
    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const priceLabelText = resolveLabel(priceLabel, lang);
    const durationLabelText = resolveLabel(durationLabel, lang);
    const certificateLabelText = resolveLabel(certificateLabel, lang);
    const isFree = isFreeOverride ?? (
        /акысыз/i.test(typeof priceLabel === 'object' ? priceLabel.ky : priceLabel ?? '') ||
        /free|бесплатно/i.test(typeof priceLabel === 'object' ? priceLabel.en ?? priceLabel.ru : priceLabel ?? '')
    );
    const description = content?.shortDescription?.[lang] ?? content?.shortDescription?.ky ?? '';

    const handleOfficialLink = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!url) return;

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const isInternal = /^\/[^/]/.test(url) || (origin && url.startsWith(origin));
        if (isInternal) {
            navigate(url.replace(origin, ''));
            return;
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <article className="relative flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-xl hover:border-[#E14219]/20 dark:hover:border-[#E14219]/20 transition-all duration-300 group cursor-pointer">

            {/* Stretched link — makes entire card clickable */}
            <Link
                to={`/resources/${slug}`}
                className="absolute inset-0 z-[1] rounded-2xl focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none"
                aria-label={title}
            />

            <CardHeader
                coverImageUrl={coverImageUrl}
                providerKey={providerKey}
                provider={provider}
                isFeatured={isFeatured}
                isFree={isFree}
                category={category}
            />

            <div className="relative z-[2] flex flex-col flex-1 px-4 pt-3.5 pb-3 gap-2 pointer-events-none">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 truncate">
                    {provider}
                </span>

                <h3 className="font-suisse font-bold text-[#141619] dark:text-[#E8ECF3] text-base leading-snug line-clamp-2 group-hover:text-[#E14219] dark:group-hover:text-[#FF8C6E] transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
                    {description || `${t(`public.externalResources.categories.${category}`, { defaultValue: category })} · ${provider}`}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {isFree ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            {priceLabelText}
                        </span>
                    ) : priceLabelText ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            {priceLabelText}
                        </span>
                    ) : null}
                    {durationLabelText && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            <ClockIcon /> {durationLabelText}
                        </span>
                    )}
                    {level && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                            {t(`public.externalResources.levels.${level}`, { defaultValue: level })}
                        </span>
                    )}
                </div>

                {certificateLabelText && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                        <BadgeCheckIcon />
                        <span>{certificateLabelText}</span>
                    </div>
                )}
            </div>

            {/* Footer — pointer-events-none so clicks fall through to stretched link; only external <a> re-enables */}
            <div className="relative z-[2] px-4 pb-4 flex gap-2 pointer-events-none">
                <div className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg font-semibold text-sm px-4 py-2.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white select-none">
                    {ctaLabel ?? t('public.externalResources.learnWithGuidance')}
                </div>
                <button
                    type="button"
                    onClick={handleOfficialLink}
                    aria-label={t('public.externalResources.officialSite')}
                    className="pointer-events-auto relative z-[3] inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:border-[#E14219] hover:text-[#E14219] dark:hover:border-[#FF8C6E] dark:hover:text-[#FF8C6E] px-3 py-2.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none"
                >
                    <ExternalLinkIcon />
                </button>
            </div>
        </article>
    );
};

export default ExternalResourceCard;
