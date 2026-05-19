import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
    FiAlertTriangle,
    FiAward,
    FiCheckCircle,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiShield,
    FiXCircle,
} from 'react-icons/fi';
import { fetchCertificateVerification } from '@features/courses/api';

const getStatusMeta = (t) => ({
    issued: {
        label: t('certificates.verification.status.issued.label'),
        tone: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        panelTone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        icon: FiCheckCircle,
        description: t('certificates.verification.status.issued.description'),
        guidance: t('certificates.verification.status.issued.guidance'),
    },
    pending_approval: {
        label: t('certificates.verification.status.pending.label'),
        tone: 'bg-amber-100 text-amber-700 border-amber-200',
        panelTone: 'border-amber-200 bg-amber-50 text-amber-900',
        icon: FiClock,
        description: t('certificates.verification.status.pending.description'),
        guidance: t('certificates.verification.status.pending.guidance'),
    },
    revoked: {
        label: t('certificates.verification.status.revoked.label'),
        tone: 'bg-slate-200 text-slate-700 border-slate-300',
        panelTone: 'border-slate-300 bg-slate-100 text-slate-800',
        icon: FiXCircle,
        description: t('certificates.verification.status.revoked.description'),
        guidance: t('certificates.verification.status.revoked.guidance'),
    },
    rejected: {
        label: t('certificates.verification.status.rejected.label'),
        tone: 'bg-red-100 text-red-700 border-red-200',
        panelTone: 'border-red-200 bg-red-50 text-red-800',
        icon: FiXCircle,
        description: t('certificates.verification.status.rejected.description'),
        guidance: t('certificates.verification.status.rejected.guidance'),
    },
});

const formatDate = (value, fallback, language) => {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? fallback
        : date.toLocaleDateString(language || undefined, {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
};

const valueOrFallback = (value, fallback = 'Not specified') => {
    const normalized = String(value || '').trim();
    return normalized || fallback;
};

const DetailCard = ({ label, value, helper }) => (
    <div className="rounded-3xl border border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 break-words text-lg font-semibold text-slate-900">{valueOrFallback(value)}</p>
        {helper ? <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p> : null}
    </div>
);

const CertificateVerification = () => {
    const { t, i18n } = useTranslation();
    const { publicId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [copyState, setCopyState] = useState('idle');

    useEffect(() => {
        if (!publicId) {
            setLoading(false);
            setError(t('certificates.verification.errors.missingId'));
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetchCertificateVerification(publicId);
                if (!cancelled) setData(response);
            } catch (err) {
                console.error('Failed to verify certificate', err);
                if (!cancelled) {
                    setError(t('certificates.verification.errors.notFound'));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [publicId, t]);

    const normalized = useMemo(() => {
        if (!data) return null;
        const fallback = t('certificates.verification.fallbacks.notSpecified');
        return {
            ...data,
            publicId: valueOrFallback(data.publicId || publicId, fallback),
            primaryBrandName: valueOrFallback(data.primaryBrandName, 'EduBot Learning'),
            certificateTitle: valueOrFallback(data.certificateTitle, t('certificates.verification.fallbacks.certificate')),
            studentFullName: valueOrFallback(data.studentFullName, fallback),
            courseTitle: valueOrFallback(data.courseTitle, fallback),
            issuerDisplayName: valueOrFallback(data.issuerDisplayName, fallback),
            issuerTitle: valueOrFallback(data.issuerTitle, fallback),
            verificationUrl: String(data.verificationUrl || '').trim(),
        };
    }, [data, publicId, t]);

    const statusMeta = getStatusMeta(t);
    const meta = statusMeta[normalized?.status] || statusMeta.rejected;
    const StatusIcon = meta.icon;

    const handleCopy = async () => {
        if (!normalized?.verificationUrl) {
            setCopyState('missing');
            return;
        }

        try {
            if (!navigator?.clipboard?.writeText) {
                setCopyState('unsupported');
                return;
            }
            await navigator.clipboard.writeText(normalized.verificationUrl);
            setCopyState('copied');
            window.setTimeout(() => setCopyState('idle'), 2500);
        } catch (copyError) {
            console.error('Failed to copy verification link', copyError);
            setCopyState('failed');
        }
    };

    return (
        <main className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-white to-amber-50 px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <section
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
                    aria-labelledby="certificate-verification-title"
                >
                    <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-amber-500 px-8 py-10 text-white">
                        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
                            <FiShield className="h-4 w-4" />
                            {t('certificates.verification.hero.eyebrow')}
                        </div>
                        <h1 id="certificate-verification-title" className="mt-4 text-3xl font-bold sm:text-4xl">
                            {t('certificates.verification.hero.title')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                            {t('certificates.verification.hero.description')}
                        </p>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500" role="status" aria-live="polite">
                                {t('certificates.verification.loading')}
                            </div>
                        ) : error ? (
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700" role="alert">
                                    <FiAlertTriangle className="mx-auto h-8 w-8" />
                                    <h2 className="mt-4 text-xl font-semibold">{t('certificates.verification.error.title')}</h2>
                                    <p className="mt-2 text-sm leading-6">{error}</p>
                                    <p className="mt-2 text-sm leading-6">
                                        {t('certificates.verification.error.description')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Link to="/contact" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                                        {t('certificates.verification.actions.contactSupport')}
                                    </Link>
                                    <Link to="/" className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                                        {t('certificates.verification.actions.home')}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            {t('certificates.verification.labels.certificateId')}
                                        </p>
                                        <p className="mt-2 break-all text-lg font-semibold text-slate-900">{normalized.publicId}</p>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${meta.tone}`} role="status" aria-live="polite">
                                        <StatusIcon className="h-4 w-4" />
                                        {meta.label}
                                    </div>
                                </div>

                                <div className={`rounded-3xl border p-6 ${meta.panelTone}`}>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                                            <StatusIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">{meta.description}</h2>
                                            <p className="mt-2 text-sm leading-6">{meta.guidance}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                                            <FiAward className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {normalized.primaryBrandName}
                                            </p>
                                            <h2 className="mt-1 break-words text-2xl font-bold text-slate-900">{normalized.certificateTitle}</h2>
                                            {normalized.secondaryBrandName ? (
                                                <p className="mt-3 text-sm text-slate-600">
                                                {t('certificates.verification.labels.partner')}: <span className="font-semibold text-slate-900">{normalized.secondaryBrandName}</span>
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <DetailCard label={t('certificates.verification.labels.student')} value={normalized.studentFullName} />
                                        <DetailCard label={t('certificates.verification.labels.course')} value={normalized.courseTitle} />
                                        <DetailCard label={t('certificates.verification.labels.issuedAt')} value={formatDate(normalized.issuedAt, t('certificates.verification.fallbacks.notSpecified'), i18n.language)} />
                                        <DetailCard
                                            label={t('certificates.verification.labels.signer')}
                                            value={normalized.issuerDisplayName}
                                            helper={normalized.issuerTitle}
                                        />
                                    </div>

                                    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5" aria-labelledby="official-verification-title">
                                        <p id="official-verification-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            {t('certificates.verification.official.title')}
                                        </p>
                                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-amber-50 px-6 text-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                                    <FiShield className="h-6 w-6" />
                                                </div>
                                                <p className="mt-4 text-sm font-semibold text-slate-900">
                                                    {t('certificates.verification.official.registry')}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {t('certificates.verification.official.description')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                                            >
                                                <FiCopy className="h-4 w-4" />
                                                {copyState === 'copied'
                                                    ? t('certificates.verification.actions.copied')
                                                    : t('certificates.verification.actions.copyLink')}
                                            </button>
                                            {normalized.verificationUrl ? (
                                                <a
                                                    href={normalized.verificationUrl}
                                                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    <FiExternalLink className="h-4 w-4" />
                                                    {t('certificates.verification.actions.open')}
                                                </a>
                                            ) : null}
                                        </div>
                                        {copyState !== 'idle' && copyState !== 'copied' ? (
                                            <p className="mt-3 text-sm leading-6 text-amber-700">
                                                {copyState === 'missing'
                                                    ? t('certificates.verification.copy.missing')
                                                    : copyState === 'unsupported'
                                                        ? t('certificates.verification.copy.unsupported')
                                                        : t('certificates.verification.copy.failed')}
                                            </p>
                                        ) : null}
                                    </aside>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-200 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('certificates.verification.labels.verificationLink')}</p>
                                        <p className="mt-2 break-all text-sm font-medium text-slate-700">
                                            {normalized.verificationUrl || t('certificates.verification.fallbacks.noLink')}
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('certificates.verification.labels.registryOwner')}</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">{normalized.primaryBrandName}</p>
                                        <p className="mt-1 text-sm text-slate-500">{t('certificates.verification.labels.registryOwnerHelper')}</p>
                                    </div>
                                </div>

                                {normalized.status === 'revoked' && normalized.revokedAt ? (
                                    <div className="rounded-3xl border border-slate-300 bg-slate-100 p-5 text-slate-700">
                                        {t('certificates.verification.revokedAt', {
                                            date: formatDate(normalized.revokedAt, t('certificates.verification.fallbacks.notSpecified'), i18n.language),
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default CertificateVerification;
