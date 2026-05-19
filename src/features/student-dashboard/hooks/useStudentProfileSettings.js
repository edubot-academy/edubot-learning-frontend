import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    fetchStudentNotificationSettings,
    fetchUserProfile,
    updateStudentNotificationSettings,
    updateUserProfile,
} from '@services/api';
import { parseApiError } from '@shared/api/error';
import { normalizeUserAvatar } from '@shared/utils/avatar';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../utils/studentDashboard.constants.js';

export const useStudentProfileSettings = ({ studentId }) => {
    const { t } = useTranslation();
    const [notificationSettings, setNotificationSettings] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [notificationsLoaded, setNotificationsLoaded] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    const loadNotificationSettings = useCallback(async () => {
        if (!studentId) return;
        setNotificationLoading(true);
        try {
            const data = await fetchStudentNotificationSettings(studentId);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(data || {}),
            });
        } catch (error) {
            console.error('Failed to load notification settings', error);
            toast.error(parseApiError(error, t('studentDashboard.profile.toasts.notificationsLoadError')).message);
            setNotificationSettings((prev) => prev ?? DEFAULT_NOTIFICATION_SETTINGS);
        } finally {
            setNotificationLoading(false);
            setNotificationsLoaded(true);
        }
    }, [studentId, t]);

    const loadProfileData = useCallback(async () => {
        if (!studentId) return;
        setProfileLoading(true);
        try {
            const data = await fetchUserProfile(studentId);
            setProfileData(data || null);
        } catch (error) {
            console.error('Failed to load profile data', error);
            toast.error(parseApiError(error, t('studentDashboard.profile.toasts.profileLoadError')).message);
            setProfileData(null);
        } finally {
            setProfileLoading(false);
            setProfileLoaded(true);
        }
    }, [studentId, t]);

    const handleNotificationChange = useCallback((key, value) => {
        setNotificationSettings((prev) => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(prev || {}),
            [key]: value,
        }));
    }, []);

    const handleSaveNotifications = useCallback(async () => {
        if (!studentId) return;
        setSavingNotifications(true);
        try {
            const payload = {
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(notificationSettings || {}),
            };
            const updated = await updateStudentNotificationSettings(studentId, payload);
            setNotificationSettings({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...(updated || {}),
            });
            toast.success(t('studentDashboard.profile.toasts.notificationsSaved'));
        } catch (error) {
            console.error('Failed to save notifications', error);
            toast.error(parseApiError(error, t('studentDashboard.profile.toasts.notificationsSaveError')).message);
        } finally {
            setSavingNotifications(false);
        }
    }, [studentId, notificationSettings, t]);

    const handleSaveProfile = useCallback(
        async ({ fullName, phoneNumber, avatarFile, newPassword, confirmPassword }) => {
            if (!studentId) return false;

            if (newPassword && newPassword !== confirmPassword) {
                toast.error(t('studentDashboard.profile.validation.passwordMismatch'));
                return false;
            }
            if (newPassword && newPassword.length < 6) {
                toast.error(t('studentDashboard.profile.validation.passwordTooShort'));
                return false;
            }
            if (phoneNumber) {
                const digitsOnly = String(phoneNumber).replace(/\D/g, '');
                if (digitsOnly.length < 10 || !/^\+\d{10,15}$/.test(String(phoneNumber))) {
                    toast.error(t('studentDashboard.profile.validation.phoneInternational'));
                    return false;
                }
            }

            setSavingProfile(true);
            try {
                const form = new FormData();
                form.append('fullName', (fullName || '').trim());
                if (phoneNumber) form.append('phoneNumber', String(phoneNumber).trim());
                if (avatarFile instanceof File) form.append('avatar', avatarFile);
                if (newPassword) form.append('password', newPassword);

                const updated = await updateUserProfile(studentId, form);
                const nextUser = updated?.user || {};

                setProfileData((prev) => ({
                    ...(prev || {}),
                    ...normalizeUserAvatar(nextUser),
                    fullName: nextUser.fullName || fullName,
                    phoneNumber: nextUser.phoneNumber || phoneNumber,
                }));

                try {
                    const storedRaw = localStorage.getItem('user');
                    const stored = storedRaw ? JSON.parse(storedRaw) : {};
                    const normalizedUser = normalizeUserAvatar({
                        ...stored,
                        ...nextUser,
                        fullName: nextUser.fullName || fullName,
                        phoneNumber: nextUser.phoneNumber || phoneNumber,
                    });
                    localStorage.setItem(
                        'user',
                        JSON.stringify(normalizedUser)
                    );
                } catch {
                    // Profile is already persisted on the backend; local cache sync is best effort.
                }

                toast.success(t('studentDashboard.profile.toasts.profileSaved'));
                return true;
            } catch (error) {
                console.error('Failed to update profile', error);
                toast.error(parseApiError(error, t('studentDashboard.profile.toasts.profileSaveError')).message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [studentId, t]
    );

    return {
        handleNotificationChange,
        handleSaveNotifications,
        handleSaveProfile,
        loadNotificationSettings,
        loadProfileData,
        notificationLoading,
        notificationSettings,
        notificationsLoaded,
        profileData,
        profileLoaded,
        profileLoading,
        savingNotifications,
        savingProfile,
    };
};
