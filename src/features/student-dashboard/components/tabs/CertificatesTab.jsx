import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiAward, FiCheckCircle, FiClock, FiDownload, FiExternalLink } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import { downloadCourseCertificatePdf } from '../../../courses/api.js';

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString('ky-KG', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });
};

const getStatusMeta = (status) => {
    if (status === 'issued') {
        return {
            label: 'Берилди',
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        };
    }
    if (status === 'pending_approval') {
        return {
            label: 'Кароодо',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        };
    }
    if (status === 'revoked') {
        return {
            label: 'Жокко чыгарылды',
            className:
                'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
    }
    if (status === 'rejected') {
        return {
            label: 'Четке кагылды',
            className:
                'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        };
    }
    return {
        label: 'Белгисиз',
        className:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    };
};

const CertificatesTab = ({ certificates }) => {
    const [downloadingKey, setDownloadingKey] = useState(null);
    const issuedCount = certificates.filter((item) => item.status === 'issued').length;
    const pendingCount = certificates.filter((item) => item.status === 'pending_approval').length;

    const handleDownload = async (certificate) => {
        if (!certificate.downloadUrl) return;
        const key = certificate.publicId || certificate.id || certificate.courseId;
        setDownloadingKey(key);
        try {
            await downloadCourseCertificatePdf(
                certificate.downloadUrl,
                `certificate-${certificate.publicId || certificate.courseId || 'student'}.pdf`,
            );
        } finally {
            setDownloadingKey(null);
        }
    };

    if (!certificates.length) {
        return (
            <StudentPanelEmpty
                icon={FiAward}
                title="Сертификаттар азырынча жок"
                description="Инструктор сертификат бергенден кийин ал ушул жерде көрүнөт. Берилген сертификатты PDF катары жүктөп же текшерүү шилтемесин ача аласыз."
            />
        );
    }

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Сертификаттар"
                title="Сертификаттар"
                description="Берилген жана кароодо турган сертификаттарыңыз бир жерде көрсөтүлөт."
            />

            <div className="grid gap-3 md:grid-cols-3">
                <DashboardMetricCard label="Жалпы" value={certificates.length} icon={FiAward} />
                <DashboardMetricCard label="Берилди" value={issuedCount} icon={FiCheckCircle} tone="green" />
                <DashboardMetricCard label="Кароодо" value={pendingCount} icon={FiClock} tone="amber" />
            </div>

            <DashboardInsetPanel
                title="Сертификат реестри"
                description="PDF жүктөө же коомдук текшерүү барагын ачуу үчүн сертификатты тандаңыз."
            >
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {certificates.map((certificate) => {
                        const statusMeta = getStatusMeta(certificate.status);
                        const downloadKey =
                            certificate.publicId || certificate.id || certificate.courseId;
                        const isDownloading = downloadingKey === downloadKey;
                        return (
                            <article
                                key={downloadKey}
                                className="rounded-[24px] border border-edubot-line/70 bg-white/80 p-5 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900/70"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {certificate.courseTitle || 'Курс сертификаты'}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {certificate.publicId || '—'} · {formatDate(certificate.issuedAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                                    >
                                        {statusMeta.label}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {certificate.downloadUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(certificate)}
                                            disabled={isDownloading}
                                            className="dashboard-button-primary"
                                        >
                                            <FiDownload className="h-4 w-4" />
                                            {isDownloading ? 'Жүктөлүүдө...' : 'PDF жүктөө'}
                                        </button>
                                    ) : null}
                                    {certificate.verificationUrl ? (
                                        <a
                                            href={certificate.verificationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="dashboard-button-secondary"
                                        >
                                            <FiExternalLink className="h-4 w-4" />
                                            Текшерүү
                                        </a>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

CertificatesTab.propTypes = {
    certificates: PropTypes.arrayOf(PropTypes.object),
};

CertificatesTab.defaultProps = {
    certificates: [],
};

export default CertificatesTab;
