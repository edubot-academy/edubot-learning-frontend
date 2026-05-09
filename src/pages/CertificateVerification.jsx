import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FiAward,
    FiCheckCircle,
    FiClock,
    FiCopy,
    FiExternalLink,
    FiShield,
    FiXCircle,
} from 'react-icons/fi';
import { fetchCertificateVerification } from '@features/courses/api';

const statusMeta = {
    issued: {
        label: 'Тастыкталды',
        tone: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: FiCheckCircle,
        description: 'Бул сертификат активдүү жана EduBot Learning тарабынан берилген.',
    },
    pending_approval: {
        label: 'Кароодо',
        tone: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: FiClock,
        description: 'Сертификат жазуусу бар, бирок ал азырынча толук берилген эмес.',
    },
    revoked: {
        label: 'Жокко чыгарылды',
        tone: 'bg-slate-200 text-slate-700 border-slate-300',
        icon: FiXCircle,
        description: 'Бул сертификат мурда берилген, кийин жокко чыгарылган.',
    },
    rejected: {
        label: 'Четке кагылды',
        tone: 'bg-red-100 text-red-700 border-red-200',
        icon: FiXCircle,
        description: 'Бул сертификат сурамы четке кагылган жана жарактуу эмес.',
    },
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          });
};

const CertificateVerification = () => {
    const { publicId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!publicId) return;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetchCertificateVerification(publicId);
                setData(response);
            } catch (err) {
                console.error('Failed to verify certificate', err);
                setError('Сертификат табылган жок же тастыкталган жок.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [publicId]);

    const meta = statusMeta[data?.status] || statusMeta.rejected;
    const StatusIcon = meta.icon;
    const handleCopy = async () => {
        if (!data?.verificationUrl || !navigator?.clipboard) return;

        try {
            await navigator.clipboard.writeText(data.verificationUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (copyError) {
            console.error('Failed to copy verification link', copyError);
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-white to-amber-50 px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                    <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-amber-500 px-8 py-10 text-white">
                        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
                            <FiShield className="h-4 w-4" />
                            EduBot Learning сертификат реестри
                        </div>
                        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Сертификатты текшерүү</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                            Сертификат EduBot Learning тарабынан берилгенин жана азыркы абалын текшериңиз.
                        </p>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                                Текшерүү маалыматы жүктөлүүдө...
                            </div>
                        ) : error ? (
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                                    {error}
                                </div>
                                <div className="text-center">
                                    <Link to="/" className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                                        EduBot Learning башкы бетине кайтуу
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Сертификат ID
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">{data.publicId}</p>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${meta.tone}`}>
                                        <StatusIcon className="h-4 w-4" />
                                        {meta.label}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                                            <FiAward className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {data.primaryBrandName}
                                            </p>
                                            <h2 className="mt-1 text-2xl font-bold text-slate-900">{data.certificateTitle}</h2>
                                        </div>
                                    </div>
                                    {data.secondaryBrandName ? (
                                        <p className="mt-4 text-sm text-slate-600">
                                            Өнөктөштүктө <span className="font-semibold text-slate-900">{data.secondaryBrandName}</span>
                                        </p>
                                    ) : null}
                                    <p className="mt-4 text-sm leading-6 text-slate-600">{meta.description}</p>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Окуучу</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-900">{data.studentFullName}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Курс</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-900">{data.courseTitle}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Берилген күнү</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(data.issuedAt)}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Кол коюучу</p>
                                            <p className="mt-2 text-lg font-semibold text-slate-900">{data.issuerDisplayName}</p>
                                            <p className="mt-1 text-sm text-slate-500">{data.issuerTitle}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Расмий текшерүү</p>
                                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-amber-50 px-6 text-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                                    <FiShield className="h-6 w-6" />
                                                </div>
                                                <p className="mt-4 text-sm font-semibold text-slate-900">
                                                    EduBot Learning ичинде түз текшерүү
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    Бул сертификатты ырастоо үчүн расмий реестр шилтемесин ачыңыз же бөлүшүңүз.
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-slate-600">
                                            Текшерүү EduBot расмий реестринде жүргүзүлөт жана үчүнчү тарап QR кызматтарына көз каранды эмес.
                                        </p>
                                        {data.verificationUrl ? (
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleCopy}
                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                                                >
                                                    <FiCopy className="h-4 w-4" />
                                                    {copied ? 'Көчүрүлдү' : 'Шилтемени көчүрүү'}
                                                </button>
                                                <a
                                                    href={data.verificationUrl}
                                                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    <FiExternalLink className="h-4 w-4" />
                                                    Текшерүү шилтемесин ачуу
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-200 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Текшерүү шилтемеси</p>
                                        <p className="mt-2 break-all text-sm font-medium text-slate-700">{data.verificationUrl}</p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Реестр ээси</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">{data.primaryBrandName}</p>
                                        <p className="mt-1 text-sm text-slate-500">Бул сертификатты берген жана текшерген негизги тарап.</p>
                                    </div>
                                </div>

                                {data.status === 'revoked' && data.revokedAt ? (
                                    <div className="rounded-3xl border border-slate-300 bg-slate-100 p-5 text-slate-700">
                                        {formatDate(data.revokedAt)} күнү жокко чыгарылган.
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerification;
