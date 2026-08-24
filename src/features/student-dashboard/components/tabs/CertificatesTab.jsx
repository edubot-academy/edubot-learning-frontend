import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FiAward, FiCheckCircle, FiClock, FiDownload, FiExternalLink } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '../../../../components/ui/dashboard';
import StudentPanelEmpty from '../shared/StudentPanelEmpty.jsx';
import { downloadCourseCertificatePdf } from '../../../courses/api/courseCertificates.js';
import {
    CERTIFICATE_STATUS,
    formatCertificateDate,
    getCertificateDownloadKey,
    getCertificatePdfFilename,
    getStudentCertificateStatusMeta,
} from '../../../courses/utils/certificatePresentation.js';

const CertificatesTab = ({ certificates }) => {
    const { i18n, t } = useTranslation();
    const [downloadingKey, setDownloadingKey] = useState(null);
    const issuedCount = certificates.filter(
        (item) => item.status === CERTIFICATE_STATUS.ISSUED
    ).length;
    const pendingCount = certificates.filter(
        (item) => item.status === CERTIFICATE_STATUS.PENDING_APPROVAL
    ).length;

    const handleDownload = async (certificate) => {
        if (!certificate.downloadUrl) return;
        const key = getCertificateDownloadKey(certificate);
        setDownloadingKey(key);
        try {
            await downloadCourseCertificatePdf(
                certificate.downloadUrl,
                getCertificatePdfFilename({
                    courseId: certificate.courseId,
                    publicId: certificate.publicId,
                }),
            );
        } finally {
            setDownloadingKey(null);
        }
    };

    if (!certificates.length) {
        return (
            <StudentPanelEmpty
                icon={FiAward}
                title={t('studentDashboard.certificates.empty.title')}
                description={t('studentDashboard.certificates.empty.description')}
            />
        );
    }

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('studentDashboard.certificates.eyebrow')}
                title={t('studentDashboard.certificates.title')}
                description={t('studentDashboard.certificates.description')}
            />

            <div className="grid gap-3 md:grid-cols-3">
                <DashboardMetricCard label={t('studentDashboard.certificates.metrics.total')} value={certificates.length} icon={FiAward} />
                <DashboardMetricCard label={t('studentDashboard.certificates.metrics.issued')} value={issuedCount} icon={FiCheckCircle} tone="green" />
                <DashboardMetricCard label={t('studentDashboard.certificates.metrics.pending')} value={pendingCount} icon={FiClock} tone="amber" />
            </div>

            <DashboardInsetPanel
                title={t('studentDashboard.certificates.registry.title')}
                description={t('studentDashboard.certificates.registry.description')}
            >
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {certificates.map((certificate) => {
                        const statusMeta = getStudentCertificateStatusMeta(certificate.status);
                        const downloadKey = getCertificateDownloadKey(certificate);
                        const isDownloading = downloadingKey === downloadKey;
                        return (
                            <article
                                key={downloadKey}
                                className="rounded-[24px] border border-edubot-line/70 bg-white/80 p-5 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-900/70"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                            {certificate.courseTitle || t('studentDashboard.certificates.fallbackCourseTitle')}
                                        </p>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {certificate.publicId || '—'} · {formatCertificateDate(certificate.issuedAt, i18n.language)}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                                    >
                                        {t(statusMeta.labelKey)}
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
                                            {isDownloading
                                                ? t('studentDashboard.certificates.actions.downloading')
                                                : t('studentDashboard.certificates.actions.downloadPdf')}
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
                                            {t('studentDashboard.certificates.actions.verify')}
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
