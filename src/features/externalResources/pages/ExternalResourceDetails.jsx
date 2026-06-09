import { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/providers';
import ExternalResourceAuthPrompt from '../components/ExternalResourceAuthPrompt';
import ExternalResourceDisclaimer from '../components/ExternalResourceDisclaimer';
import { getResourceBySlug, PROVIDER_COLORS, PROVIDER_LOGOS } from '../data/externalResources';

const CATEGORY_ICONS = {
    programming: '💻',
    web: '🌐',
    data: '📊',
    ai: '🤖',
    default: '📚',
};

const ProviderLogo = ({ providerKey, provider, color }) => {
    const [failed, setFailed] = useState(false);
    const primaryUrl = PROVIDER_LOGOS[providerKey];
    const initial = provider?.charAt(0)?.toUpperCase() ?? '?';

    if (!failed && primaryUrl) {
        return (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden border border-white/60 flex-shrink-0">
                <img
                    src={primaryUrl}
                    alt={provider}
                    className="w-8 h-8 object-contain"
                    onError={() => setFailed(true)}
                />
            </div>
        );
    }

    return (
        <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

const Pill = ({ children, variant = 'default' }) => {
    const base = 'inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border';
    const variants = {
        default: 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
    };
    return <span className={`${base} ${variants[variant]}`}>{children}</span>;
};

const SectionBlock = ({ title, children }) => (
    <div className="flex flex-col gap-4">
        <h2 className="font-suisse font-bold text-lg text-[#141619] dark:text-[#E8ECF3] flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] inline-block flex-shrink-0" />
            {title}
        </h2>
        {children}
    </div>
);

const ExternalResourceDetails = () => {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [coverFailed, setCoverFailed] = useState(false);

    const resource = getResourceBySlug(slug);

    if (!resource) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#222222]">
                <p className="text-gray-500 dark:text-gray-400">{t('public.externalResources.notFound')}</p>
                <Link to="/resources" className="text-[#E14219] hover:underline text-sm font-medium">
                    ← {t('public.externalResources.backToAll')}
                </Link>
            </div>
        );
    }

    const {
        title, provider, providerKey, level, category,
        priceLabel, certificateLabel, durationLabel,
        url, content, isFeatured, coverImageUrl,
    } = resource;

    const providerColor = PROVIDER_COLORS[providerKey] ?? '#888';
    const categoryIcon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.default;

    // pick the best available language for content fields, fall back to ky
    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const cl = (obj) => obj?.[lang] ?? obj?.ky ?? null;

    const isFree = /акысыз/i.test(priceLabel ?? '') || /free/i.test(priceLabel ?? '');

    const handleOfficialLink = () => {
        const isInternal = /^\/[^/]/.test(url) || url.startsWith(window.location.origin);
        if (isInternal) {
            navigate(url.replace(window.location.origin, ''));
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#1a1a1a] text-[#141619] dark:text-[#E8ECF3]">

            {/* ── Cover hero ── */}
            <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-gray-900">
                {coverImageUrl && !coverFailed ? (
                    <img
                        src={coverImageUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        onError={() => setCoverFailed(true)}
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${providerColor}cc 0%, ${providerColor}55 100%)` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category icon — top right */}
                <span className="absolute top-4 right-4 text-3xl drop-shadow select-none">{categoryIcon}</span>

                {/* Featured badge */}
                {isFeatured && (
                    <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                        ⭐ {t('public.externalResources.featured')}
                    </span>
                )}

                {/* Provider logo — bottom left */}
                <div className="absolute bottom-4 left-4">
                    <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">

                {/* ── Back link ── */}
                <div className="pt-6 pb-2">
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t('public.externalResources.backToAll')}
                    </Link>
                </div>

                {/* ── Title block ── */}
                <div className="py-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: providerColor }} />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{provider}</span>
                    </div>
                    <h1 className="font-suisse font-bold text-2xl sm:text-3xl leading-tight text-[#141619] dark:text-[#E8ECF3] mb-5">
                        {title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {priceLabel && (
                            <Pill variant={isFree ? 'green' : 'default'}>
                                {isFree ? '✓ ' : ''}{priceLabel}
                            </Pill>
                        )}
                        {level && (
                            <Pill>
                                {t(`public.externalResources.levels.${level}`, { defaultValue: level })}
                            </Pill>
                        )}
                        {durationLabel && <Pill>⏱ {durationLabel}</Pill>}
                        {certificateLabel && <Pill variant="orange">🏅 {certificateLabel}</Pill>}
                    </div>
                </div>

                {/* ── Main grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">

                    {/* ── Left column ── */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* Short description */}
                        {cl(content?.shortDescription) && (
                            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {cl(content.shortDescription)}
                            </p>
                        )}

                        {!user && <ExternalResourceAuthPrompt resourceSlug={slug} />}

                        <ExternalResourceDisclaimer providerName={provider} />

                        {/* What you will learn */}
                        {cl(content?.whatYouWillLearn)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.whatYouWillLearn')}>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                    {cl(content.whatYouWillLearn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#E14219] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </SectionBlock>
                        )}

                        {/* Who is it for */}
                        {cl(content?.whoIsItFor)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.whoIsItFor')}>
                                <div className="flex flex-wrap gap-2">
                                    {cl(content.whoIsItFor).map((item, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="text-[#E14219] text-xs">→</span>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </SectionBlock>
                        )}

                        {/* Why recommended */}
                        {cl(content?.whyRecommended) && (
                            <SectionBlock title={t('public.externalResources.whyRecommended')}>
                                <div className="rounded-xl border-l-4 border-[#E14219] bg-orange-50 dark:bg-orange-900/10 px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {cl(content.whyRecommended)}
                                    </p>
                                </div>
                            </SectionBlock>
                        )}

                        {/* Study plan */}
                        {content?.studyPlan?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.studyPlan')}>
                                <ol className="relative flex flex-col gap-0">
                                    {content.studyPlan.map((week, idx) => (
                                        <li key={week.week} className="flex gap-4 relative">
                                            {/* Timeline connector */}
                                            {idx < content.studyPlan.length - 1 && (
                                                <span className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10" />
                                            )}
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white text-xs font-bold flex items-center justify-center z-10 mt-3">
                                                {week.week}
                                            </span>
                                            <div className="pb-5 flex-1">
                                                <p className="font-semibold text-sm text-[#141619] dark:text-[#E8ECF3] mt-3">
                                                    {cl(week.title)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                                    {cl(week.description)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </SectionBlock>
                        )}

                        {/* Difficulty notes */}
                        {cl(content?.difficultyNotes)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.difficultyNotes')}>
                                <ul className="flex flex-col gap-2">
                                    {cl(content.difficultyNotes).map((note, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl px-3 py-2.5 border border-yellow-100 dark:border-yellow-900/20">
                                            <span className="text-yellow-500 flex-shrink-0 mt-0.5">⚠</span>
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </SectionBlock>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#222222] p-6 shadow-sm">

                            {/* Provider logo + name */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/10">
                                <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Provider</p>
                                    <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">{provider}</p>
                                </div>
                            </div>

                            {/* Stats table */}
                            <div className="flex flex-col gap-2.5 text-sm">
                                {priceLabel && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">{t('public.externalResources.price')}</span>
                                        <span className={`font-semibold ${isFree ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {priceLabel}
                                        </span>
                                    </div>
                                )}
                                {level && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">{t('public.externalResources.level')}</span>
                                        <span className="font-medium">{t(`public.externalResources.levels.${level}`, { defaultValue: level })}</span>
                                    </div>
                                )}
                                {durationLabel && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">{t('public.externalResources.duration')}</span>
                                        <span className="font-medium">{durationLabel}</span>
                                    </div>
                                )}
                                {certificateLabel && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">{t('public.externalResources.certificate')}</span>
                                        <span className="font-medium text-right max-w-[55%]">{certificateLabel}</span>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100 dark:border-white/10" />

                            <button
                                onClick={handleOfficialLink}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-4 py-3 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                {t('public.externalResources.officialSiteCta')}
                            </button>

                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                                {t('public.externalResources.officialSiteNote')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalResourceDetails;
