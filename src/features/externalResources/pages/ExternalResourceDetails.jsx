import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthContext } from '@app/providers';
import { API_BASE_URL } from '../../../config';
import ExternalResourceAuthPrompt from '../components/ExternalResourceAuthPrompt';
import { getResourceBySlug, PROVIDER_COLORS, PROVIDER_LOGOS, resolveLabel } from '../data/externalResources';
import { fetchExternalResourceBySlug, uploadResourceCertificate } from '../api';
import useResourceProgress from '../hooks/useResourceProgress';

const CATEGORY_ICONS = {
    programming: '💻',
    web: '🌐',
    data: '📊',
    ai: '🤖',
    default: '📚',
};

const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);

const ProviderLogo = ({ providerKey, provider, color, size = 'md' }) => {
    const [failed, setFailed] = useState(false);
    const primaryUrl = PROVIDER_LOGOS[providerKey];
    const initial = provider?.charAt(0)?.toUpperCase() ?? '?';
    const sizeClass = size === 'lg'
        ? 'w-14 h-14 sm:w-16 sm:h-16'
        : 'w-11 h-11';
    const imgClass = size === 'lg' ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-7 h-7';
    const textClass = size === 'lg' ? 'text-xl' : 'text-base';

    if (!failed && primaryUrl) {
        return (
            <div className={`${sizeClass} rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden border border-white/60 flex-shrink-0`}>
                <img
                    src={primaryUrl}
                    alt={provider}
                    className={`${imgClass} object-contain`}
                    onError={() => setFailed(true)}
                />
            </div>
        );
    }
    return (
        <div
            className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-bold ${textClass} shadow-lg flex-shrink-0`}
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
};

const Pill = ({ children, variant = 'default' }) => {
    const base = 'inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full border';
    const variants = {
        default: 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
    };
    return <span className={`${base} ${variants[variant]}`}>{children}</span>;
};

const SectionBlock = ({ title, children }) => (
    <div className="flex flex-col gap-5">
        <h2 className="font-suisse font-bold text-xl text-[#141619] dark:text-[#E8ECF3] flex items-center gap-2.5">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] inline-block flex-shrink-0" />
            {title}
        </h2>
        {children}
    </div>
);

const SkeletonDetail = () => (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#1a1a1a] animate-pulse">
        <div className="h-60 sm:h-72 bg-gray-200 dark:bg-white/10" />
        <div className="px-4 sm:px-6 lg:px-12 max-w-screen-lg mx-auto py-8 flex flex-col gap-6">
            <div className="h-5 w-28 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-44 rounded-2xl bg-gray-200 dark:bg-white/10" />
        </div>
    </div>
);

const ExternalResourceDetails = () => {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [coverFailed, setCoverFailed] = useState(false);
    const [resource, setResource] = useState(() => getResourceBySlug(slug));
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [certUploading, setCertUploading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!getResourceBySlug(slug)) setLoading(true);
        fetchExternalResourceBySlug(slug)
            .then((data) => {
                if (!cancelled) {
                    const hasContent = data.content && Object.keys(data.content).length > 0;
                    const staticData = getResourceBySlug(slug);
                    setResource({
                        ...data,
                        priceLabel: staticData?.priceLabel ?? data.priceLabel,
                        durationLabel: staticData?.durationLabel ?? data.durationLabel,
                        certificateLabel: staticData?.certificateLabel ?? data.certificateLabel,
                        content: hasContent ? data.content : (staticData?.content ?? data.content),
                    });
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    const fallback = getResourceBySlug(slug);
                    if (!fallback) setNotFound(true);
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, [slug]);

    const {
        progressLoading,
        getEntry,
        saveResource,
        startResource,
        completeResource,
        toggleWeek,
        removeResource,
        setCertificateUrl,
    } = useResourceProgress();

    const handleSave = useCallback(() => {
        if (!resource) return;
        saveResource(resource.slug, { title: resource.title, provider: resource.provider });
        toast.success(t('public.externalResources.saveToast', { title: resource.title }));
    }, [saveResource, resource, t]);

    const handleStart = useCallback(() => {
        if (!resource) return;
        startResource(resource.slug, { title: resource.title, provider: resource.provider });
        toast.success(t('public.externalResources.startToast', { title: resource.title }));
    }, [startResource, resource, t]);

    const handleComplete = useCallback(() => {
        if (!resource) return;
        completeResource(resource.slug);
        toast.success(t('public.externalResources.completeToast', { title: resource.title }));
    }, [completeResource, resource, t]);

    if (loading) return <SkeletonDetail />;

    if (notFound || !resource) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#222222]">
                <p className="text-gray-500 dark:text-gray-400 text-base">{t('public.externalResources.notFound')}</p>
                <Link to="/resources" className="text-[#E14219] hover:underline text-base font-medium">
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

    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const cl = (obj) => obj?.[lang] ?? obj?.ky ?? null;

    const priceLabelText = resolveLabel(priceLabel, lang);
    const durationLabelText = resolveLabel(durationLabel, lang);
    const certificateLabelText = resolveLabel(certificateLabel, lang);
    const isFree = (
        /акысыз/i.test(typeof priceLabel === 'object' ? priceLabel.ky : priceLabel ?? '') ||
        /free|бесплатно/i.test(typeof priceLabel === 'object' ? priceLabel.en ?? priceLabel.ru : priceLabel ?? '')
    );
    const levelText = level ? t(`public.externalResources.levels.${level}`, { defaultValue: level }) : null;

    const entry = user ? getEntry(resource.slug) : null;

    const weeksTotal = content?.studyPlan?.length ?? 0;
    const weeksDone = entry?.checkedWeeks?.length ?? 0;
    const weeksPct = weeksTotal > 0 ? Math.round((weeksDone / weeksTotal) * 100) : 0;

    const handleOfficialLink = () => {
        if (!url) return;
        const isInternal = /^\/[^/]/.test(url) || url.startsWith(window.location.origin);
        if (isInternal) {
            navigate(url.replace(window.location.origin, ''));
            return;
        }
        window.open(`${API_BASE_URL}/external-resources/${resource.slug}/go`, '_blank', 'noopener,noreferrer');
    };

    const handleCertificateUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCertUploading(true);
        try {
            const updated = await uploadResourceCertificate(resource.slug, file);
            if (updated?.certificateUrl) setCertificateUrl(resource.slug, updated.certificateUrl);
            toast.success(t('public.externalResources.certUploaded'));
        } catch {
            toast.error(t('public.externalResources.certUploadError'));
        } finally {
            setCertUploading(false);
            e.target.value = '';
        }
    };

    // ── Shared button styles ──────────────────────────────────────────────────
    const btnPrimary = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-200 active:scale-[0.98] shadow-sm';
    const btnOutline = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-[#E14219]/40 text-[#E14219] dark:text-[#FF8C6E] hover:bg-[#E14219]/5 dark:hover:bg-[#E14219]/10 transition-all duration-200';
    const btnGhost = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#E14219]/40 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-all duration-200';

    // ── Sidebar / mobile-card CTAs (shared render) ────────────────────────────
    const renderCTAs = () => (
        <div className="flex flex-col gap-3">
            {/* Loading skeleton — prevents actions while progress is being fetched */}
            {user && progressLoading && (
                <div className="h-24 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse" />
            )}

            {/* Not enrolled */}
            {user && !progressLoading && !entry && (
                <>
                    <button onClick={handleStart} className={btnPrimary}>
                        🚀 {t('public.externalResources.start')}
                    </button>
                    <button onClick={handleSave} className={btnGhost}>
                        🔖 {t('public.externalResources.save')}
                    </button>
                </>
            )}

            {/* Enrolled */}
            {user && !progressLoading && entry && (
                <>
                    {weeksTotal > 0 && (
                        <div className="mb-1">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                                <span>{t('public.externalResources.yourProgress')}</span>
                                <span className="font-semibold text-[#E14219]">{weeksDone} / {weeksTotal}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] transition-all duration-500"
                                    style={{ width: `${weeksPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <Link
                        to="/dashboard?tab=free-resources"
                        className={btnPrimary}
                    >
                        {t('public.externalResources.continueOnDashboard')}
                    </Link>
                    {entry.status === 'completed' ? (
                        <div className="w-full rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-5 py-3 text-base text-green-700 dark:text-green-400 font-semibold text-center">
                            🎉 {t('public.externalResources.statusCompleted')}
                        </div>
                    ) : (
                        <button
                            onClick={entry.status === 'saved' ? handleStart : handleComplete}
                            className={entry.status === 'saved' ? btnOutline : 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200'}
                        >
                            {entry.status === 'saved'
                                ? `🚀 ${t('public.externalResources.start')}`
                                : `✓ ${t('public.externalResources.markComplete')}`}
                        </button>
                    )}
                </>
            )}

            {/* Official site / audit */}
            {resource.canAuditFree !== false ? (
                <>
                    <button onClick={handleOfficialLink} className={entry ? btnGhost : (!user ? btnPrimary : btnGhost)}>
                        <ExternalLinkIcon />
                        {t('public.externalResources.auditFreeCta')}
                    </button>
                    {resource.certificateCost && (
                        <button
                            onClick={handleOfficialLink}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
                        >
                            🏅 {t('public.externalResources.getCertificateCta', { cost: resource.certificateCost })}
                        </button>
                    )}
                </>
            ) : (
                <button onClick={handleOfficialLink} className={entry ? btnGhost : (!user ? btnPrimary : btnGhost)}>
                    <ExternalLinkIcon />
                    {t('public.externalResources.signUpCta')}
                </button>
            )}

            <p className="text-sm text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                {t('public.externalResources.officialSiteNote')}
            </p>
        </div>
    );

    // ── Sidebar metadata rows ─────────────────────────────────────────────────
    const renderMetaRows = () => (
        <div className="flex flex-col gap-3">
            {priceLabelText && (
                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('public.externalResources.price')}</span>
                    <span className={`text-sm font-semibold ${isFree ? 'text-green-600 dark:text-green-400' : 'text-[#141619] dark:text-[#E8ECF3]'}`}>
                        {priceLabelText}
                    </span>
                </div>
            )}
            {levelText && (
                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('public.externalResources.level')}</span>
                    <span className="text-sm font-semibold text-right">{levelText}</span>
                </div>
            )}
            {durationLabelText && (
                <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{t('public.externalResources.duration')}</span>
                    <span className="text-sm font-semibold text-right max-w-[55%]">{durationLabelText}</span>
                </div>
            )}
            {certificateLabelText && (
                <div className="flex justify-between items-start gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{t('public.externalResources.certificate')}</span>
                    <span className="text-sm font-semibold text-right max-w-[55%]">{certificateLabelText}</span>
                </div>
            )}
            {resource.certificateCost && (
                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('public.externalResources.certificateCost')}</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{resource.certificateCost}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#1a1a1a] text-[#141619] dark:text-[#E8ECF3]">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-gray-900">
                {coverImageUrl && !coverFailed ? (
                    <>
                        <img
                            src={coverImageUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                            onError={() => setCoverFailed(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0" style={{ backgroundColor: providerColor, opacity: 0.85 }} />
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,0.6) 20px,rgba(255,255,255,0.6) 22px)`,
                            }}
                        />
                        <span
                            className="absolute select-none pointer-events-none"
                            style={{ fontSize: '12rem', lineHeight: 1, bottom: '-1.5rem', right: '2rem', opacity: 0.12, filter: 'grayscale(1)' }}
                        >
                            {categoryIcon}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute bottom-16 left-20 right-4 sm:left-24">
                            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1.5">{provider}</p>
                            <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl leading-tight line-clamp-2 drop-shadow">{title}</p>
                        </div>
                    </>
                )}

                {coverImageUrl && !coverFailed && (
                    <span className="absolute top-4 right-4 text-4xl drop-shadow select-none">{categoryIcon}</span>
                )}

                {isFeatured && (
                    <span className="absolute top-4 left-4 text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                        ⭐ {t('public.externalResources.featured')}
                    </span>
                )}

                {/* Provider logo — bottom left */}
                <div className="absolute bottom-4 left-4">
                    <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} size="lg" />
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">

                {/* ── Back link ─────────────────────────────────────────────── */}
                <div className="pt-5 pb-1">
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-1.5 text-base text-gray-500 dark:text-gray-400 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t('public.externalResources.backToAll')}
                    </Link>
                </div>

                {/* ── Title block ───────────────────────────────────────────── */}
                <div className="py-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: providerColor }} />
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">{provider}</span>
                    </div>
                    <h1 className="font-suisse font-bold text-3xl sm:text-4xl leading-tight text-[#141619] dark:text-[#E8ECF3] mb-5">
                        {title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {priceLabelText && (
                            <Pill variant={isFree ? 'green' : 'default'}>
                                {isFree ? '✓ ' : ''}{priceLabelText}
                            </Pill>
                        )}
                        {level && <Pill>{levelText}</Pill>}
                        {durationLabelText && <Pill>⏱ {durationLabelText}</Pill>}
                        {certificateLabelText && <Pill variant="orange">🏅 {certificateLabelText}</Pill>}
                    </div>
                </div>

                {/* ── Mobile action card (hidden on desktop) ────────────────── */}
                <div className="lg:hidden mt-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#222222] p-5 shadow-sm">
                    {/* Provider */}
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
                        <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Provider</p>
                            <p className="text-base font-semibold text-[#141619] dark:text-[#E8ECF3]">{provider}</p>
                        </div>
                    </div>

                    {/* Stats grid */}
                    {(priceLabelText || levelText || durationLabelText || certificateLabelText) && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
                            {priceLabelText && (
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('public.externalResources.price')}</p>
                                    <p className={`text-base font-bold ${isFree ? 'text-green-600 dark:text-green-400' : ''}`}>{priceLabelText}</p>
                                </div>
                            )}
                            {levelText && (
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('public.externalResources.level')}</p>
                                    <p className="text-base font-bold">{levelText}</p>
                                </div>
                            )}
                            {durationLabelText && (
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('public.externalResources.duration')}</p>
                                    <p className="text-base font-bold">{durationLabelText}</p>
                                </div>
                            )}
                            {certificateLabelText && (
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('public.externalResources.certificate')}</p>
                                    <p className="text-base font-bold">{certificateLabelText}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {renderCTAs()}
                </div>

                {/* ── Main grid ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">

                    {/* ── Left column ─────────────────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-10">

                        {/* Description */}
                        {cl(content?.shortDescription) && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                {cl(content.shortDescription)}
                            </p>
                        )}

                        {!user && (
                            <ExternalResourceAuthPrompt resourceSlug={resource.slug} resourceTitle={title} />
                        )}

                        {/* Enrolled: progress banner */}
                        {user && !progressLoading && entry && (
                            <div className="rounded-2xl border border-orange-100 dark:border-orange-800/30 bg-gradient-to-br from-orange-50/80 to-amber-50/60 dark:from-orange-900/15 dark:to-amber-900/10 p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {entry.status === 'saved' && (
                                            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">🔖 {t('public.externalResources.statusSaved')}</span>
                                        )}
                                        {entry.status === 'started' && (
                                            <span className="text-base font-semibold text-orange-600 dark:text-orange-400">📖 {t('public.externalResources.statusStarted')}</span>
                                        )}
                                        {entry.status === 'completed' && (
                                            <span className="text-base font-semibold text-green-600 dark:text-green-400">🎉 {t('public.externalResources.statusCompleted')}</span>
                                        )}
                                        {weeksTotal > 0 && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                · {t('public.externalResources.weeksProgress', { done: weeksDone, total: weeksTotal })}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        to="/dashboard?tab=free-resources"
                                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all flex-shrink-0"
                                    >
                                        {t('public.externalResources.continueOnDashboard')}
                                    </Link>
                                </div>

                                {weeksTotal > 0 && (
                                    <div className="h-2 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] transition-all duration-500"
                                            style={{ width: `${weeksPct}%` }}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-3 flex-wrap">
                                    {entry.status === 'saved' && (
                                        <button
                                            onClick={handleStart}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all"
                                        >
                                            🚀 {t('public.externalResources.start')}
                                        </button>
                                    )}
                                    {entry.status === 'started' && (
                                        <button
                                            onClick={handleComplete}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                        >
                                            ✓ {t('public.externalResources.markComplete')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removeResource(resource.slug)}
                                        className="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    >
                                        {t('public.externalResources.removeFromPlan')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Compact disclaimer */}
                        <div className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                <strong className="font-semibold text-gray-600 dark:text-gray-300">{provider}</strong>
                                {' '}{t('public.externalResources.disclaimerWithoutProvider')}
                            </p>
                        </div>

                        {/* What you will learn */}
                        {cl(content?.whatYouWillLearn)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.whatYouWillLearn')}>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                                    {cl(content.whatYouWillLearn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-base text-gray-700 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#E14219] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
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
                                <ul className="flex flex-col gap-3">
                                    {cl(content.whoIsItFor).map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 text-base px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="text-[#E14219] font-bold text-lg leading-none mt-0.5 flex-shrink-0">→</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </SectionBlock>
                        )}

                        {/* Why recommended */}
                        {cl(content?.whyRecommended) && (
                            <SectionBlock title={t('public.externalResources.whyRecommended')}>
                                <div className="rounded-xl border-l-4 border-[#E14219] bg-orange-50 dark:bg-orange-900/10 px-5 py-4">
                                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {cl(content.whyRecommended)}
                                    </p>
                                </div>
                            </SectionBlock>
                        )}

                        {/* Study plan */}
                        {content?.studyPlan?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.studyPlan')}>
                                <ol className="relative flex flex-col gap-0">
                                    {content.studyPlan.map((week, idx) => {
                                        const done = entry?.checkedWeeks?.includes(week.week) ?? false;
                                        return (
                                            <li key={week.week} className="flex gap-5 relative">
                                                {idx < content.studyPlan.length - 1 && (
                                                    <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10" />
                                                )}
                                                {user ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleWeek(resource.slug, week.week)}
                                                        className={`flex-shrink-0 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center z-10 mt-3 transition-all ${
                                                            done
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white'
                                                        }`}
                                                        title={done ? '✓' : week.week.toString()}
                                                    >
                                                        {done ? '✓' : week.week}
                                                    </button>
                                                ) : (
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white text-sm font-bold flex items-center justify-center z-10 mt-3">
                                                        {week.week}
                                                    </span>
                                                )}
                                                <div className={`pb-6 flex-1 ${done ? 'opacity-60' : ''}`}>
                                                    <p className={`font-semibold text-base text-[#141619] dark:text-[#E8ECF3] mt-3 leading-snug ${done ? 'line-through' : ''}`}>
                                                        {cl(week.title)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                        {cl(week.description)}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </SectionBlock>
                        )}

                        {/* Difficulty notes — first item is a warning, rest are neutral */}
                        {cl(content?.difficultyNotes)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.difficultyNotes')}>
                                <ul className="flex flex-col gap-2.5">
                                    {cl(content.difficultyNotes).map((note, i) => (
                                        <li
                                            key={i}
                                            className={`flex items-start gap-3 text-base rounded-xl px-4 py-3.5 border ${
                                                i === 0
                                                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20 text-gray-700 dark:text-gray-300'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            <span className={`flex-shrink-0 mt-0.5 ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                                {i === 0 ? '⚠' : '·'}
                                            </span>
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </SectionBlock>
                        )}

                        {/* Related EduBot Lessons */}
                        <SectionBlock title={t('public.externalResources.relatedLessonsTitle')}>
                            <div className="rounded-xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/60 dark:bg-orange-900/10 px-5 py-5 flex flex-col gap-4">
                                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t('public.externalResources.relatedLessonsBody')}
                                </p>
                                {content?.relatedCourseSlugs?.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {content.relatedCourseSlugs.map((rSlug) => (
                                            <Link
                                                key={rSlug}
                                                to={`/resources/${rSlug}`}
                                                className="inline-flex items-center gap-2 text-base font-medium text-[#E14219] hover:underline"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                {rSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <Link
                                    to="/courses"
                                    className="self-start inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all"
                                >
                                    {t('public.externalResources.relatedLessonsBtn')}
                                    <ExternalLinkIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        </SectionBlock>

                        {/* Certificate upload */}
                        {user && !progressLoading && entry?.status === 'completed' && (
                            <SectionBlock title={t('public.externalResources.certSectionTitle')}>
                                {entry?.certificateUrl ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 px-5 py-4">
                                            <span className="text-green-600 dark:text-green-400 text-xl flex-shrink-0">🏆</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-semibold text-green-700 dark:text-green-400">{t('public.externalResources.certUploaded')}</p>
                                                <a
                                                    href={entry.certificateUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-green-600 dark:text-green-500 hover:underline truncate block mt-0.5"
                                                >
                                                    {t('public.externalResources.certView')}
                                                </a>
                                            </div>
                                        </div>
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                                className="sr-only"
                                                disabled={certUploading}
                                                onChange={handleCertificateUpload}
                                            />
                                            {certUploading ? t('public.externalResources.certUploading') : t('public.externalResources.certReplace')}
                                        </label>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${certUploading ? 'border-gray-200 dark:border-white/10 opacity-60 cursor-not-allowed' : 'border-[#E14219]/30 hover:border-[#E14219]/60 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'}`}>
                                        <input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                                            className="sr-only"
                                            disabled={certUploading}
                                            onChange={handleCertificateUpload}
                                        />
                                        <span className="text-3xl">{certUploading ? '⏳' : '📄'}</span>
                                        <p className="text-base font-semibold text-[#E14219]">
                                            {certUploading ? t('public.externalResources.certUploading') : t('public.externalResources.certUploadCta')}
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                                            {t('public.externalResources.certUploadHint')}
                                        </p>
                                    </label>
                                )}
                            </SectionBlock>
                        )}
                    </div>

                    {/* ── Right sidebar (desktop only) ─────────────────────── */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-6 flex flex-col gap-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#222222] p-6 shadow-sm">

                            {/* Provider */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/10">
                                <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Provider</p>
                                    <p className="text-sm font-semibold text-[#141619] dark:text-[#E8ECF3]">{provider}</p>
                                </div>
                            </div>

                            {renderMetaRows()}

                            <hr className="border-gray-100 dark:border-white/10" />

                            {renderCTAs()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalResourceDetails;
