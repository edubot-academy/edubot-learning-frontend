import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBell, FiLock, FiMail, FiPhone, FiSave, FiUser } from 'react-icons/fi';
import { formatNotificationLabel } from '../../utils/studentDashboard.helpers.js';
import { NOTIFICATION_LABELS } from '../../utils/studentDashboard.constants.js';

const ProfileTab = ({
    student,
    notificationSettings,
    onSaveProfile,
    savingProfile,
    onNotificationChange,
    onSaveNotifications,
    savingNotifications,
}) => {
    const { t } = useTranslation();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [formData, setFormData] = useState({
        fullName: student?.name || '',
        email: student?.email || '',
        phoneNumber: student?.phone || '',
        avatar: null,
    });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [preview, setPreview] = useState(student?.avatar || null);

    useEffect(() => {
        setFormData({
            fullName: student?.name || '',
            email: student?.email || '',
            phoneNumber: student?.phone || '',
            avatar: null,
        });
        setPreview(student?.avatar || null);
        setPasswordData({ newPassword: '', confirmPassword: '' });
    }, [student]);

    useEffect(() => {
        if (!formData.avatar) return undefined;
        const objectUrl = URL.createObjectURL(formData.avatar);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [formData.avatar]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFormData((prev) => ({ ...prev, avatar: file }));
    };

    const handleSaveProfileClick = async () => {
        if (!onSaveProfile) return;
        const success = await onSaveProfile({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            avatarFile: formData.avatar,
        });
        if (success) {
            setFormData((prev) => ({ ...prev, avatar: null }));
            setIsEditingProfile(false);
        }
    };

    const handleSaveSecurityClick = async () => {
        if (!onSaveProfile) return;
        const success = await onSaveProfile({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
        });
        if (success) {
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
    };

    const handleResetProfile = () => {
        setFormData({
            fullName: student?.name || '',
            email: student?.email || '',
            phoneNumber: student?.phone || '',
            avatar: null,
        });
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPreview(student?.avatar || null);
    };

    const hasProfileChanges =
        formData.fullName.trim() !== (student?.name || '').trim() ||
        formData.phoneNumber.trim() !== (student?.phone || '').trim() ||
        Boolean(formData.avatar);

    const hasPasswordChanges =
        Boolean(passwordData.newPassword) || Boolean(passwordData.confirmPassword);

    const notificationEntries = Object.entries(notificationSettings || {});
    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('studentDashboard.profile.eyebrow')}
                title={t('studentDashboard.profile.title')}
                description={t('studentDashboard.profile.description')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label={t('studentDashboard.profile.fields.fullName')}
                    value={formData.fullName || '—'}
                    icon={FiUser}
                />
                <DashboardMetricCard
                    label="Email"
                    value={formData.email || '—'}
                    icon={FiMail}
                    tone="blue"
                />
                <DashboardMetricCard
                    label={t('studentDashboard.profile.fields.phone')}
                    value={formData.phoneNumber || '—'}
                    icon={FiPhone}
                    tone="green"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <DashboardInsetPanel
                    title={t('studentDashboard.profile.account.title')}
                    description={t('studentDashboard.profile.account.description')}
                    action={
                        !isEditingProfile ? (
                            <button
                                type="button"
                                onClick={() => setIsEditingProfile(true)}
                                className="dashboard-button-secondary"
                            >
                                <FiUser className="h-4 w-4" />
                                {t('studentDashboard.profile.actions.edit')}
                            </button>
                        ) : null
                    }
                >
                    <div className="mt-4 space-y-5">
                        {isEditingProfile ? (
                            <>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-edubot-line bg-edubot-surfaceAlt text-xl font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-900">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt={t('studentDashboard.profile.account.avatarPreviewAlt')}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-edubot-ink dark:text-slate-200">
                                            {t('studentDashboard.profile.account.profilePhoto')}
                                        </p>
                                        <label className="dashboard-button-secondary inline-flex cursor-pointer items-center justify-center self-start whitespace-nowrap">
                                            {t('studentDashboard.profile.actions.uploadAvatar')}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {formData.avatar ? (
                                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                                {t('studentDashboard.profile.account.selectedFile', {
                                                    file: formData.avatar.name,
                                                })}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {t('studentDashboard.profile.fields.fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        className="dashboard-field mt-1"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                            Email
                                        </label>
                                        <div className="mt-1 rounded-2xl border border-edubot-line/80 bg-edubot-surfaceAlt/50 px-3 py-2 text-edubot-ink dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">
                                            {formData.email || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <PhoneInput
                                            id="student-profile-phone"
                                            value={formData.phoneNumber}
                                            onChange={(value) =>
                                                setFormData((prev) => ({ ...prev, phoneNumber: value }))
                                            }
                                            label={t('studentDashboard.profile.fields.phone')}
                                            helperText={t('studentDashboard.profile.fields.phoneHelper')}
                                            className="dashboard-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSaveProfileClick}
                                        disabled={!hasProfileChanges || savingProfile}
                                        className="dashboard-button-primary"
                                    >
                                        <FiSave className="h-4 w-4" />
                                        {savingProfile
                                            ? t('studentDashboard.profile.actions.saving')
                                            : t('studentDashboard.profile.actions.saveProfile')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleResetProfile();
                                            setIsEditingProfile(false);
                                        }}
                                        disabled={savingProfile}
                                        className="dashboard-button-secondary"
                                    >
                                        {t('studentDashboard.profile.actions.cancel')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-4 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-edubot-line bg-white text-xl font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-950">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt={t('studentDashboard.profile.account.avatarPreviewAlt')}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            {t('studentDashboard.profile.account.visibleInfo')}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {t('studentDashboard.profile.fields.fullName')}
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-edubot-ink dark:text-white">
                                        {formData.fullName || '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        Email
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-edubot-ink dark:text-white">
                                        {formData.email || '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {t('studentDashboard.profile.fields.phone')}
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-edubot-ink dark:text-white">
                                        {formData.phoneNumber || '—'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title={t('studentDashboard.profile.security.title')}
                    description={t('studentDashboard.profile.security.description')}
                >
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="student-security-password" className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                {t('studentDashboard.profile.security.newPassword')}
                            </label>
                            <input
                                id="student-security-password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                className="dashboard-field mt-1"
                                placeholder={t('studentDashboard.profile.security.passwordPlaceholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="student-security-password-confirm" className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                {t('studentDashboard.profile.security.confirmPassword')}
                            </label>
                            <input
                                id="student-security-password-confirm"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                className="dashboard-field mt-1"
                                placeholder={t('studentDashboard.profile.security.confirmPasswordPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSaveSecurityClick}
                            disabled={!hasPasswordChanges || savingProfile}
                            className="dashboard-button-primary"
                        >
                            <FiLock className="h-4 w-4" />
                            {savingProfile
                                ? t('studentDashboard.profile.actions.saving')
                                : t('studentDashboard.profile.actions.updatePassword')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setPasswordData({ newPassword: '', confirmPassword: '' })}
                            disabled={!hasPasswordChanges || savingProfile}
                            className="dashboard-button-secondary"
                        >
                            {t('studentDashboard.profile.actions.clear')}
                        </button>
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title={t('studentDashboard.profile.notificationSettings.title')}
                    description={t('studentDashboard.profile.notificationSettings.description')}
                >
                    <div className="mt-4 space-y-3">
                        {notificationEntries.length ? (
                            notificationEntries.map(([key, value]) => {
                                const meta = NOTIFICATION_LABELS[key] || {};
                                const label = meta.labelKey
                                    ? t(meta.labelKey)
                                    : formatNotificationLabel(key);
                                const description = meta.descriptionKey ? t(meta.descriptionKey) : '';
                                const inputId = `notification-${key}`;
                                return (
                                    <div
                                        key={key}
                                        className="flex items-start justify-between gap-4 rounded-2xl border border-edubot-line/80 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        <div className="min-w-0">
                                            <label
                                                htmlFor={inputId}
                                                className="text-sm font-semibold text-edubot-ink dark:text-white"
                                            >
                                                {label}
                                            </label>
                                            {description ? (
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {description}
                                                </p>
                                            ) : null}
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                id={inputId}
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={Boolean(value)}
                                                onChange={(e) =>
                                                    onNotificationChange?.(key, e.target.checked)
                                                }
                                            />
                                            <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-edubot-orange dark:bg-slate-700" />
                                            <span className="ml-3 text-sm text-edubot-muted dark:text-slate-400">
                                                {value
                                                    ? t('studentDashboard.profile.notificationSettings.on')
                                                    : t('studentDashboard.profile.notificationSettings.off')}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState
                                title={t('studentDashboard.profile.notificationSettings.emptyTitle')}
                                subtitle={t('studentDashboard.profile.notificationSettings.emptySubtitle')}
                                icon={<FiBell className="h-8 w-8 text-edubot-orange" />}
                                className="py-8"
                            />
                        )}
                    </div>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={onSaveNotifications}
                            disabled={savingNotifications}
                            className="dashboard-button-primary"
                        >
                            <FiLock className="h-4 w-4" />
                            {savingNotifications
                                ? t('studentDashboard.profile.actions.saving')
                                : t('studentDashboard.profile.actions.saveNotifications')}
                        </button>
                    </div>
                </DashboardInsetPanel>
            </div>
        </div>
    );
};

ProfileTab.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        avatar: PropTypes.string,
    }).isRequired,
    notificationSettings: PropTypes.object,
    onSaveProfile: PropTypes.func,
    savingProfile: PropTypes.bool,
    onNotificationChange: PropTypes.func,
    onSaveNotifications: PropTypes.func.isRequired,
    savingNotifications: PropTypes.bool,
};

ProfileTab.defaultProps = {
    notificationSettings: {},
    onSaveProfile: undefined,
    savingProfile: false,
    onNotificationChange: undefined,
    savingNotifications: false,
};

export default ProfileTab;
