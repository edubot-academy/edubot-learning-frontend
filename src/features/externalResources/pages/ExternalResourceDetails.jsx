import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthContext } from '@app/providers';
import { API_BASE_URL } from '../../../config';
import ExternalResourceAuthPrompt from '../components/ExternalResourceAuthPrompt';
import { PROVIDER_COLORS, PROVIDER_LOGOS, resolveLabel } from '../data/externalResources';
import { fetchExternalResourceBySlug, uploadResourceCertificate } from '../api';
import useResourceProgress from '../hooks/useResourceProgress';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);

const PlayIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const BookmarkIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CheckCircleIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const StarIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const AcademicCapIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
);

const DocumentIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const BookOpenIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
);

const ExclamationIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const ChevronRightSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" aria-hidden>
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const BackChevron = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
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

const CategorySvg = ({ category, className }) => {
    const s = CATEGORY_SVG[category] ?? CATEGORY_SVG.default;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
            <path fillRule={s.fillRule} clipRule={s.clipRule} d={s.d} />
        </svg>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const ProviderLogo = ({ providerKey, provider, color, size = 'md' }) => {
    const [failed, setFailed] = useState(false);
    const primaryUrl = PROVIDER_LOGOS[providerKey];
    const initial = provider?.charAt(0)?.toUpperCase() ?? '?';
    const sizeClass = size === 'lg' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-11 h-11';
    const textClass = size === 'lg' ? 'text-xl' : 'text-base';

    if (!failed && primaryUrl) {
        return (
            <img
                src={primaryUrl}
                alt={provider}
                className={`${sizeClass} object-contain drop-shadow-lg flex-shrink-0`}
                loading="lazy"
                onError={() => setFailed(true)}
            />
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
        green:   'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        orange:  'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
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
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#1a1a1a] motion-safe:animate-pulse">
        <div className="h-60 sm:h-72 bg-gray-200 dark:bg-white/10" />
        <div className="px-4 sm:px-6 lg:px-12 max-w-screen-lg mx-auto py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <div className="h-3 w-24 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-40 rounded-full bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="h-10 w-3/4 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="flex gap-2">
                <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-28 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="h-44 rounded-2xl bg-gray-200 dark:bg-white/10" />
        </div>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ExternalResourceDetails = () => {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [coverFailed, setCoverFailed] = useState(false);
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [certUploading, setCertUploading] = useState(false);
    const [confirmingRemove, setConfirmingRemove] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);
        fetchExternalResourceBySlug(slug)
            .then((data) => { if (!cancelled) { setResource(data); setLoading(false); } })
            .catch(() => { if (!cancelled) { setNotFound(true); setLoading(false); } });
        return () => { cancelled = true; };
    }, [slug]);

    const { progressLoading, getEntry, saveResource, startResource, completeResource, toggleWeek, removeResource, setCertificateUrl } = useResourceProgress();

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

    const { title, provider, providerKey, level, category, priceLabel, certificateLabel, durationLabel, url, content, isFeatured, coverImageUrl } = resource;
    const providerColor = PROVIDER_COLORS[providerKey] ?? '#888';

    const lang = i18n.language?.split('-')[0] ?? 'ky';
    const cl = (obj) => obj?.[lang] ?? obj?.ky ?? null;

    const priceLabelText = resolveLabel(priceLabel, lang);
    const durationLabelText = resolveLabel(durationLabel, lang);
    const certificateLabelText = resolveLabel(certificateLabel, lang);
    const certificateCostText = resolveLabel(resource.certificateCost, lang);
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
        if (isInternal) { navigate(url.replace(window.location.origin, '')); return; }
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
    const btnPrimary = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-200 active:scale-[0.98] shadow-sm focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:ring-offset-2 focus-visible:outline-none';
    const btnOutline = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-[#E14219]/40 text-[#E14219] dark:text-[#FF8C6E] hover:bg-[#E14219]/5 dark:hover:bg-[#E14219]/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none';
    const btnGhost = 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#E14219]/40 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none';

    const renderMetaRow = (label, value, valueClassName = 'text-[#141619] dark:text-[#E8ECF3]') => {
        const isLong = String(value).length > 26;

        return (
            <div className={`min-w-0 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] px-4 py-3 ${isLong ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                </span>
                <span className={`mt-1 block min-w-0 text-sm font-semibold leading-snug break-words ${valueClassName}`}>
                    {value}
                </span>
            </div>
        );
    };
    const renderMetaRows = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {priceLabelText && (
                renderMetaRow(
                    t('public.externalResources.price'),
                    priceLabelText,
                    isFree ? 'text-green-600 dark:text-green-400' : 'text-[#141619] dark:text-[#E8ECF3]',
                )
            )}
            {levelText && (
                renderMetaRow(t('public.externalResources.level'), levelText)
            )}
            {durationLabelText && (
                renderMetaRow(t('public.externalResources.duration'), durationLabelText)
            )}
            {certificateLabelText && (
                renderMetaRow(t('public.externalResources.certificate'), certificateLabelText)
            )}
            {certificateCostText && (
                renderMetaRow(
                    t('public.externalResources.certificateCost'),
                    certificateCostText,
                    'text-amber-600 dark:text-amber-400',
                )
            )}
        </div>
    );

    // ── Sidebar / mobile-card CTAs ────────────────────────────────────────────
    const renderCTAs = () => (
        <div className="flex flex-col gap-3">
            {user && progressLoading && (
                <div className="h-24 rounded-xl bg-gray-100 dark:bg-white/10 motion-safe:animate-pulse" />
            )}

            {user && !progressLoading && !entry && (
                <>
                    <button onClick={handleStart} className={btnPrimary}>
                        <PlayIcon /> {t('public.externalResources.start')}
                    </button>
                    <button onClick={handleSave} className={btnGhost}>
                        <BookmarkIcon /> {t('public.externalResources.save')}
                    </button>
                </>
            )}

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
                    <Link to="/dashboard?tab=free-resources" className={btnPrimary}>
                        {t('public.externalResources.continueOnDashboard')}
                    </Link>
                    {entry.status === 'completed' ? (
                        <div className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-5 py-3 text-base text-green-700 dark:text-green-400 font-semibold">
                            <CheckCircleIcon className="w-5 h-5" /> {t('public.externalResources.statusCompleted')}
                        </div>
                    ) : (
                        <button
                            onClick={entry.status === 'saved' ? handleStart : handleComplete}
                            className={entry.status === 'saved' ? btnOutline : 'w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none'}
                        >
                            {entry.status === 'saved'
                                ? <><PlayIcon /> {t('public.externalResources.start')}</>
                                : <><CheckIcon /> {t('public.externalResources.markComplete')}</>}
                        </button>
                    )}
                </>
            )}

            {resource.canAuditFree !== false ? (
                <>
                    <button onClick={handleOfficialLink} className={entry ? btnGhost : (!user ? btnPrimary : btnGhost)}>
                        <ExternalLinkIcon />
                        {t('public.externalResources.auditFreeCta')}
                    </button>
                    {certificateCostText && (
                        <button
                            onClick={handleOfficialLink}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3 border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        >
                            <AcademicCapIcon className="w-4 h-4" />
                            {t('public.externalResources.getCertificateCta', { cost: certificateCostText })}
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
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                            onError={() => setCoverFailed(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0" style={{ backgroundColor: providerColor, opacity: 0.85 }} />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,0.6) 20px,rgba(255,255,255,0.6) 22px)` }} />
                        <div className="absolute pointer-events-none select-none" style={{ bottom: '-3rem', right: '1rem' }}>
                            <CategorySvg category={category} className="w-72 h-72 text-white opacity-10" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    </>
                )}

                {/* Category icon — top right */}
                <CategorySvg category={category} className="absolute top-4 right-4 w-7 h-7 text-white/60 drop-shadow" />

                {/* Featured badge — top left */}
                {isFeatured && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                        <StarIcon className="w-3.5 h-3.5" />
                        {t('public.externalResources.featured')}
                    </span>
                )}

                {/* Provider logo — bottom left */}
                <div className="absolute bottom-4 left-4 sm:left-6">
                    <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} size="lg" />
                </div>

                {/* Title overlay — always visible */}
                <div className="absolute bottom-4 left-24 sm:left-32 right-4 sm:right-6">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{provider}</p>
                    <p className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight line-clamp-2 drop-shadow">{title}</p>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">

                {/* ── Breadcrumb ────────────────────────────────────────────── */}
                <nav className="pt-5 pb-1 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
                    <Link
                        to="/resources"
                        className="text-gray-500 dark:text-gray-400 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors font-medium"
                    >
                        {t('public.externalResources.backToAll', 'Resources')}
                    </Link>
                    <ChevronRightSmall />
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[220px] sm:max-w-sm" aria-current="page">
                        {title}
                    </span>
                </nav>

                {/* ── Title block ───────────────────────────────────────────── */}
                <div className="py-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: providerColor }} />
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">{provider}</span>
                    </div>
                    <h1 className="font-suisse font-bold text-3xl sm:text-4xl leading-tight text-[#141619] dark:text-[#E8ECF3] mb-5">
                        {title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {priceLabelText && (
                            <Pill variant={isFree ? 'green' : 'default'}>
                                {isFree && <CheckIcon className="w-3.5 h-3.5" />}
                                {priceLabelText}
                            </Pill>
                        )}
                        {level && <Pill>{levelText}</Pill>}
                        {durationLabelText && (
                            <Pill>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {durationLabelText}
                            </Pill>
                        )}
                        {certificateLabelText && (
                            <Pill variant="orange">
                                <AcademicCapIcon className="w-3.5 h-3.5" />
                                {certificateLabelText}
                            </Pill>
                        )}
                    </div>
                </div>

                {/* ── Mobile action card ────────────────────────────────────── */}
                <div className="lg:hidden mt-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#222222] p-5 shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
                        <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
                                {t('public.externalResources.provider', 'Provider')}
                            </p>
                            <p className="text-base font-semibold text-[#141619] dark:text-[#E8ECF3]">{provider}</p>
                        </div>
                    </div>
                    {renderMetaRows()}
                    <hr className="my-4 border-gray-100 dark:border-white/10" />
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

                        {!user && <ExternalResourceAuthPrompt resourceSlug={resource.slug} resourceTitle={title} />}

                        {/* Progress banner */}
                        {user && !progressLoading && entry && (
                            <div className="rounded-2xl border border-orange-100 dark:border-orange-800/30 bg-gradient-to-br from-orange-50/80 to-amber-50/60 dark:from-orange-900/15 dark:to-amber-900/10 p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {entry.status === 'saved' && (
                                            <span className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-700 dark:text-gray-300">
                                                <BookmarkIcon className="w-4 h-4" /> {t('public.externalResources.statusSaved')}
                                            </span>
                                        )}
                                        {entry.status === 'started' && (
                                            <span className="inline-flex items-center gap-1.5 text-base font-semibold text-orange-600 dark:text-orange-400">
                                                <BookOpenIcon className="w-4 h-4" /> {t('public.externalResources.statusStarted')}
                                            </span>
                                        )}
                                        {entry.status === 'completed' && (
                                            <span className="inline-flex items-center gap-1.5 text-base font-semibold text-green-600 dark:text-green-400">
                                                <CheckCircleIcon className="w-4 h-4" /> {t('public.externalResources.statusCompleted')}
                                            </span>
                                        )}
                                        {weeksTotal > 0 && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                · {t('public.externalResources.weeksProgress', { done: weeksDone, total: weeksTotal })}
                                            </span>
                                        )}
                                    </div>
                                    {/* "Continue on Dashboard" hidden on desktop — sidebar has it */}
                                    <Link
                                        to="/dashboard?tab=free-resources"
                                        className="lg:hidden inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none"
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
                                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none"
                                        >
                                            <PlayIcon /> {t('public.externalResources.start')}
                                        </button>
                                    )}
                                    {entry.status === 'started' && (
                                        <button
                                            onClick={handleComplete}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
                                        >
                                            <CheckIcon /> {t('public.externalResources.markComplete')}
                                        </button>
                                    )}
                                    {confirmingRemove ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{t('public.externalResources.removeConfirm')}</span>
                                            <button
                                                onClick={() => removeResource(resource.slug)}
                                                className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors focus-visible:underline"
                                            >
                                                {t('public.externalResources.removeConfirmYes')}
                                            </button>
                                            <button
                                                onClick={() => setConfirmingRemove(false)}
                                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {t('public.externalResources.removeConfirmCancel')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmingRemove(true)}
                                            className="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            {t('public.externalResources.removeFromPlan')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* What you will learn */}
                        {cl(content?.whatYouWillLearn)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.whatYouWillLearn')}>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                                    {cl(content.whatYouWillLearn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-base text-gray-700 dark:text-gray-300">
                                            <CheckIcon className="w-5 h-5 text-[#E14219] flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </SectionBlock>
                        )}

                        {/* Disclaimer — after content begins, before further details */}
                        <div className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3.5">
                            <InfoIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                <strong className="font-semibold text-gray-600 dark:text-gray-300">{provider}</strong>
                                {' '}{t('public.externalResources.disclaimerWithoutProvider')}
                            </p>
                        </div>

                        {/* Who is it for */}
                        {cl(content?.whoIsItFor)?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.whoIsItFor')}>
                                <ul className="flex flex-col gap-3">
                                    {cl(content.whoIsItFor).map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 text-base px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="text-[#E14219] font-bold text-base leading-none mt-0.5 flex-shrink-0">›</span>
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

                        {/* Difficulty notes — before study plan so users know what they're signing up for */}
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
                                            {i === 0
                                                ? <ExclamationIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                : <span className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1 text-xs">●</span>}
                                            {note}
                                        </li>
                                    ))}
                                </ul>
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
                                                        className={`flex-shrink-0 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center z-10 mt-3 transition-all focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none ${
                                                            done ? 'bg-green-500 text-white' : 'bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white'
                                                        }`}
                                                        aria-label={done ? `Week ${week.week} done` : `Mark week ${week.week} as done`}
                                                    >
                                                        {done ? <CheckIcon className="w-4 h-4" /> : week.week}
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

                        {/* Related EduBot course links — only when populated */}
                        {content?.relatedCourseSlugs?.length > 0 && (
                            <SectionBlock title={t('public.externalResources.relatedLessonsTitle')}>
                                <div className="flex flex-col gap-2">
                                    {content.relatedCourseSlugs.map((rSlug) => (
                                        <Link
                                            key={rSlug}
                                            to={`/resources/${rSlug}`}
                                            className="inline-flex items-center gap-2 text-base font-medium text-[#E14219] hover:underline focus-visible:underline focus-visible:outline-none"
                                        >
                                            <ChevronRightSmall />
                                            {rSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Link>
                                    ))}
                                </div>
                            </SectionBlock>
                        )}

                        {/* Compact "Explore EduBot" CTA */}
                        <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-[#E14219]/15 dark:border-[#E14219]/20 bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-orange-900/10 dark:to-amber-900/5 px-5 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                                {t('public.externalResources.relatedLessonsBody')}
                            </p>
                            <Link
                                to="/courses"
                                className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all focus-visible:ring-2 focus-visible:ring-[#E14219] focus-visible:outline-none"
                            >
                                {t('public.externalResources.relatedLessonsBtn')}
                                <ExternalLinkIcon className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Certificate upload */}
                        {user && !progressLoading && entry?.status === 'completed' && (
                            <SectionBlock title={t('public.externalResources.certSectionTitle')}>
                                {entry?.certificateUrl ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 px-5 py-4">
                                            <AcademicCapIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
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
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-[#E14219] dark:hover:text-[#FF8C6E] transition-colors w-fit">
                                            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" disabled={certUploading} onChange={handleCertificateUpload} />
                                            {certUploading ? t('public.externalResources.certUploading') : t('public.externalResources.certReplace')}
                                        </label>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${certUploading ? 'border-gray-200 dark:border-white/10 opacity-60 cursor-not-allowed' : 'border-[#E14219]/30 hover:border-[#E14219]/60 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'}`}>
                                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" disabled={certUploading} onChange={handleCertificateUpload} />
                                        {certUploading
                                            ? <div className="w-8 h-8 rounded-full border-2 border-[#E14219] border-t-transparent motion-safe:animate-spin" />
                                            : <DocumentIcon className="w-8 h-8 text-[#E14219]/60" />}
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
                        <div className="sticky top-20 flex flex-col gap-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#222222] p-6 shadow-sm">

                            {/* Provider */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/10">
                                <ProviderLogo providerKey={providerKey} provider={provider} color={providerColor} />
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
                                        {t('public.externalResources.provider', 'Provider')}
                                    </p>
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
