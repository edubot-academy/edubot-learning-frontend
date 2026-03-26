import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PhoneInput from '@shared/ui/forms/PhoneInput';
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
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">Профиль</h2>
                {!isEditingProfile ? (
                    <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:border-edubot-orange hover:text-edubot-orange hover:bg-edubot-orange/10 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                    >
                        <span className="transition-transform duration-300 group-hover:scale-110">
                            ✏️ Өзгөртүү
                        </span>
                    </button>
                ) : null}
            </div>
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-semibold text-gray-500">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (formData.fullName || student?.name || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isEditingProfile ? 'Профиль сүрөтү' : 'Каттоо сүрөтү'}
                        </p>
                        {isEditingProfile ? (
                            <>
                                <label className="inline-flex px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm cursor-pointer">
                                    Аватар жүктөө
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {formData.avatar && (
                                    <p className="text-xs text-gray-500">
                                        Тандалды: {formData.avatar.name}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Өзгөртүү режимин ачуу үчүн жогортогу баскычты басыңыз.
                            </p>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Аты-жөнү</p>
                    {isEditingProfile ? (
                        <input
                            type="text"
                            className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                            }
                        />
                    ) : (
                        <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                            {formData.fullName || '—'}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                        <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                            {formData.email || 'student@example.com'}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон</p>
                        {isEditingProfile ? (
                            <div className="mt-1">
                                <PhoneInput
                                    value={formData.phoneNumber}
                                    onChange={(value) =>
                                        setFormData((prev) => ({ ...prev, phoneNumber: value }))
                                    }
                                />
                            </div>
                        ) : (
                            <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-gray-900 dark:text-[#E8ECF3]">
                                {formData.phoneNumber || '—'}
                            </div>
                        )}
                    </div>
                </div>
                {isEditingProfile && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
                                    className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Кеминде 6 белги"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
                                    className="mt-1 w-full border rounded-2xl px-3 py-2 bg-white dark:bg-[#222222] text-gray-900 dark:text-[#E8ECF3] border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Сырсөздү дагы бир жолу киргизиңиз"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={handleSaveProfileClick}
                                disabled={!hasProfileChanges || savingProfile}
                                className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 group disabled:hover:scale-100"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    {savingProfile ? 'Сакталууда...' : '💾 Профилди сактоо'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleResetProfile();
                                    setIsEditingProfile(false);
                                }}
                                disabled={savingProfile}
                                className="px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-semibold disabled:opacity-60 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-105 hover:shadow-md group disabled:hover:scale-100"
                            >
                                <span className="transition-transform duration-300 group-hover:scale-110">
                                    ❌ Жокко чыгаруу
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Эскертмелер
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Кайсы каналдар аркылуу эскертмелерди алгыңыз келерин тандаңыз.
                    </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notificationEntries.length ? (
                        notificationEntries.map(([key, value]) => {
                            const meta = NOTIFICATION_LABELS[key] || {};
                            const label = meta.label || formatNotificationLabel(key);
                            const description = meta.description || '';
                            const inputId = `notification-${key}`;
                            return (
                                <div
                                    key={key}
                                    className="flex items-start justify-between py-3 gap-4"
                                >
                                    <div>
                                        <label
                                            htmlFor={inputId}
                                            className="font-medium text-gray-900 dark:text-[#E8ECF3]"
                                        >
                                            {label}
                                        </label>
                                        {description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id={inputId}
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={Boolean(value)}
                                            onChange={(e) =>
                                                onNotificationChange?.(key, e.target.checked)
                                            }
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                            {value ? 'Күйгүзүлгөн' : 'Өчүрүлгөн'}
                                        </span>
                                    </label>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            Эскертме параметрлери табылган жок.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onSaveNotifications}
                    disabled={savingNotifications}
                    className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                    {savingNotifications ? 'Сакталууда...' : 'Эскертмелерди сактоо'}
                </button>
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
