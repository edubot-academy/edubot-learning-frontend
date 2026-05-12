import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FiAlertTriangle,
    FiArrowLeft,
    FiCheckCircle,
    FiDownload,
    FiRefreshCw,
    FiShield,
} from 'react-icons/fi';
import { downloadCourseCertificatePdf } from '@features/courses/api';

const CertificateDownloadPage = () => {
    const { publicId } = useParams();
    const [status, setStatus] = useState('preparing');
    const [error, setError] = useState('');
    const autoDownloadStartedRef = useRef(false);

    const verificationPath = publicId ? `/certificates/${publicId}/verify` : '/';

    const runDownload = useCallback(async () => {
        if (!publicId) {
            setStatus('failed');
            setError('Сертификат идентификатору табылган жок.');
            return;
        }

        setStatus('downloading');
        setError('');

        try {
            await downloadCourseCertificatePdf(
                `/certificates/${publicId}/download`,
                `certificate-${publicId}.pdf`,
            );
            setStatus('ready');
        } catch {
            setStatus('failed');
            setError('PDF жүктөлгөн жок. Браузер жүктөөнү бөгөттөгөн болушу мүмкүн же сертификат азыр жеткиликсиз.');
        }
    }, [publicId]);

    useEffect(() => {
        if (autoDownloadStartedRef.current) return;
        autoDownloadStartedRef.current = true;
        void runDownload();
    }, [runDownload]);

    const isBusy = status === 'preparing' || status === 'downloading';
    const isFailed = status === 'failed';
    const StatusIcon = isFailed ? FiAlertTriangle : status === 'ready' ? FiCheckCircle : FiDownload;

    return (
        <main className="min-h-[calc(100vh-160px)] bg-gradient-to-b from-slate-50 via-white to-amber-50 px-4 py-12">
            <div className="mx-auto flex min-h-[56vh] max-w-3xl items-center">
                <section
                    className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
                    aria-labelledby="certificate-download-title"
                >
                    <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-amber-500 px-8 py-8 text-white">
                        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
                            <FiShield className="h-4 w-4" />
                            Сертификат PDF
                        </div>
                        <h1 id="certificate-download-title" className="mt-4 text-3xl font-bold">
                            Сертификат жүктөлүүдө
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                            PDF файлын даярдап жатабыз. Эгер браузер жүктөөнү бөгөттөсө, бул беттен кайра аракет кылсаңыз болот.
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6" role="status" aria-live="polite">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                                    isFailed ? 'bg-red-100 text-red-700' : status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    <StatusIcon className={`h-6 w-6 ${isBusy ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        {isFailed ? 'Жүктөө ишке ашкан жок' : status === 'ready' ? 'Жүктөө башталды' : 'PDF даярдалып жатат'}
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                                        {isFailed
                                            ? 'Сертификатты азыр жүктөй алган жокпуз'
                                            : status === 'ready'
                                                ? 'Файл браузер аркылуу жүктөлүшү керек'
                                                : 'Сертификат файлы даярдалууда'}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {isFailed
                                            ? error
                                            : status === 'ready'
                                                ? 'Эгер файл көрүнбөсө, браузердин жүктөөлөр тизмесин текшериңиз же кайра жүктөп көрүңүз.'
                                                : 'Бул адатта бир нече секунд гана алат. Бетти жаппай туруңуз.'}
                                    </p>
                                    {publicId ? (
                                        <p className="mt-3 break-all text-xs font-medium text-slate-500">
                                            Certificate ID: {publicId}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={runDownload}
                                disabled={isBusy || !publicId}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isBusy ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiDownload className="h-4 w-4" />}
                                {isBusy ? 'Даярдалып жатат' : 'Кайра жүктөө'}
                            </button>
                            <Link
                                to={verificationPath}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                            >
                                <FiShield className="h-4 w-4" />
                                Текшерүү барагын ачуу
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                            >
                                <FiArrowLeft className="h-4 w-4" />
                                Башкы бетке кайтуу
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default CertificateDownloadPage;
