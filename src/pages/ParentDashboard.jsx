import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getParentProfile, updateGuardianConsent } from '@features/parent/api';
import Loader from '@shared/ui/Loader';

const consentBadge = (status, t) => {
    if (status === 'granted') {
        return (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {t('parent.dashboard.badge.granted')}
            </span>
        );
    }
    if (status === 'revoked') {
        return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {t('parent.dashboard.badge.revoked')}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            {t('parent.dashboard.badge.pending')}
        </span>
    );
};

const GuardianLinkCard = ({ link, onConsentChange }) => {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);

    const handleConsent = async (status) => {
        setSubmitting(true);
        try {
            await updateGuardianConsent(link.id, status);
            onConsentChange(link.id, status);
            toast.success(status === 'granted' ? t('parent.dashboard.toast.consentGranted') : t('parent.dashboard.toast.consentRevoked'));
        } catch {
            toast.error(t('parent.dashboard.toast.consentError'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {link.studentName ?? `Student #${link.studentId}`}
                    </p>
                    {link.relationship && (
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {link.relationship}
                        </p>
                    )}
                    <div className="mt-2">{consentBadge(link.consentStatus, t)}</div>
                </div>

                <div className="flex shrink-0 gap-2">
                    {link.consentStatus !== 'granted' && (
                        <button
                            type="button"
                            onClick={() => handleConsent('granted')}
                            disabled={submitting}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {t('parent.dashboard.btn.grantConsent')}
                        </button>
                    )}
                    {link.consentStatus === 'granted' && (
                        <button
                            type="button"
                            onClick={() => handleConsent('revoked')}
                            disabled={submitting}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t('parent.dashboard.btn.revoke')}
                        </button>
                    )}
                </div>
            </div>

            {(link.consentStatus === 'pending' || link.consentStatus === 'revoked') && (
                <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                    {link.consentStatus === 'revoked'
                        ? t('parent.dashboard.revokedNotice')
                        : t('parent.dashboard.consentNotice')}
                </p>
            )}
        </div>
    );
};

const ParentDashboard = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getParentProfile()
            .then(setProfile)
            .catch(() => toast.error(t('parent.dashboard.toast.profileError')))
            .finally(() => setLoading(false));
    }, [t]);

    const handleConsentChange = (guardianId, newStatus) => {
        setProfile((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                guardianLinks: prev.guardianLinks.map((l) =>
                    l.id === guardianId ? { ...l, consentStatus: newStatus } : l
                ),
            };
        });
    };

    if (loading) return <Loader fullScreen />;

    const pendingLinks = profile?.guardianLinks?.filter((l) => l.consentStatus === 'pending') ?? [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('parent.dashboard.title', 'Parent Portal')}
                    </h1>
                    {profile?.fullName && (
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {t('parent.dashboard.welcome', { name: profile.fullName, defaultValue: `Welcome, ${profile.fullName}` })}
                        </p>
                    )}
                </div>

                {pendingLinks.length > 0 && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                        <p className="font-medium text-orange-800 dark:text-orange-300">
                            {t('parent.dashboard.consentRequired', 'Action required: consent pending')}
                        </p>
                        <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                            {t(
                                'parent.dashboard.consentRequiredDesc',
                                'Review and grant consent below to receive updates about your child.'
                            )}
                        </p>
                    </div>
                )}

                {profile?.guardianLinks?.length > 0 ? (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('parent.dashboard.children', 'Your children')}
                        </h2>
                        {profile.guardianLinks.map((link) => (
                            <GuardianLinkCard
                                key={link.id}
                                link={link}
                                onConsentChange={handleConsentChange}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-gray-500 dark:text-gray-400">
                            {t('parent.dashboard.noChildren', 'No children linked to your account yet.')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;
