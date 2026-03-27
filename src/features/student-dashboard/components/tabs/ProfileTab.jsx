import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
        });
        if (success) {
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setFormData((prev) => ({ ...prev, avatar: null }));
            setIsEditingProfile(false);
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
        Boolean(formData.avatar) ||
        Boolean(passwordData.newPassword) ||
        Boolean(passwordData.confirmPassword);

    const notificationEntries = Object.entries(notificationSettings || {});
    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Profile workspace"
                title="Профиль"
                description="Аккаунт маалыматыңызды жаңыртып, кайсы каналдар боюнча эскертме алууну көзөмөлдөңүз."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label="Аты-жөнү"
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
                    label="Телефон"
                    value={formData.phoneNumber || '—'}
                    icon={FiPhone}
                    tone="green"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <DashboardInsetPanel
                    title="Аккаунт маалыматы"
                    description="Жеке маалымат жана коопсуздук параметрлери."
                    action={
                        !isEditingProfile ? (
                            <button
                                type="button"
                                onClick={() => setIsEditingProfile(true)}
                                className="dashboard-button-secondary"
                            >
                                <FiUser className="h-4 w-4" />
                                Өзгөртүү
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
                                                alt="Avatar preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-edubot-ink dark:text-slate-200">
                                            Профиль сүрөтү
                                        </p>
                                        <label className="dashboard-button-secondary inline-flex cursor-pointer items-center justify-center self-start whitespace-nowrap">
                                            Аватар жүктөө
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {formData.avatar ? (
                                            <p className="text-xs text-edubot-muted dark:text-slate-400">
                                                Тандалды: {formData.avatar.name}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        Аты-жөнү
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
                                        <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                            Телефон
                                        </label>
                                        <div className="mt-1">
                                            <PhoneInput
                                                value={formData.phoneNumber}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({ ...prev, phoneNumber: value }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                            Жаңы сырсөз
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    newPassword: e.target.value,
                                                }))
                                            }
                                            className="dashboard-field mt-1"
                                            placeholder="Кеминде 6 белги"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                            Сырсөздү кайталоо
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value,
                                                }))
                                            }
                                            className="dashboard-field mt-1"
                                            placeholder="Сырсөздү дагы бир жолу киргизиңиз"
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
                                        {savingProfile ? 'Сакталууда...' : 'Профилди сактоо'}
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
                                        Жокко чыгаруу
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
                                                alt="Avatar preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                            Аккаунтта көрүнгөн негизги маалымат жана байланыш каналдары.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        Аты-жөнү
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
                                        Телефон
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
                    title="Эскертме жөндөөлөрү"
                    description="Кайсы каналдар аркылуу жаңыртууларды алууну тандаңыз."
                >
                    <div className="mt-4 space-y-3">
                        {notificationEntries.length ? (
                            notificationEntries.map(([key, value]) => {
                                const meta = NOTIFICATION_LABELS[key] || {};
                                const label = meta.label || formatNotificationLabel(key);
                                const description = meta.description || '';
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
                                                {value ? 'Күйгүзүлгөн' : 'Өчүрүлгөн'}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState
                                title="Эскертме параметрлери табылган жок"
                                subtitle="Бул аккаунт үчүн эскертме жөндөөлөрү жүктөлгөн жок."
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
                            {savingNotifications ? 'Сакталууда...' : 'Эскертмелерди сактоо'}
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
