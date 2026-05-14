import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    fetchStudentNotificationSettings,
    fetchUserProfile,
    updateStudentNotificationSettings,
    updateUserProfile,
} from '@services/api';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../utils/studentDashboard.constants.js';

export const useStudentProfileSettings = ({ studentId }) => {
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
            toast.error('Эскертмелерди жүктөө мүмкүн болбоду');
            setNotificationSettings((prev) => prev ?? DEFAULT_NOTIFICATION_SETTINGS);
        } finally {
            setNotificationLoading(false);
            setNotificationsLoaded(true);
        }
    }, [studentId]);

    const loadProfileData = useCallback(async () => {
        if (!studentId) return;
        setProfileLoading(true);
        try {
            const data = await fetchUserProfile(studentId);
            setProfileData(data || null);
        } catch (error) {
            console.error('Failed to load profile data', error);
            toast.error('Профиль маалыматы жүктөлгөн жок');
            setProfileData(null);
        } finally {
            setProfileLoading(false);
            setProfileLoaded(true);
        }
    }, [studentId]);

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
            toast.success('Эскертмелер сакталды');
        } catch (error) {
            console.error('Failed to save notifications', error);
            toast.error('Эскертмелерди сактоо мүмкүн болбоду');
        } finally {
            setSavingNotifications(false);
        }
    }, [studentId, notificationSettings]);

    const handleSaveProfile = useCallback(
        async ({ fullName, phoneNumber, avatarFile, newPassword, confirmPassword }) => {
            if (!studentId) return false;

            if (newPassword && newPassword !== confirmPassword) {
                toast.error('Жаңы сырсөздөр дал келбейт.');
                return false;
            }
            if (newPassword && newPassword.length < 6) {
                toast.error('Сырсөз кеминде 6 белги болушу керек.');
                return false;
            }
            if (phoneNumber) {
                const digitsOnly = String(phoneNumber).replace(/\D/g, '');
                if (digitsOnly.length < 10 || !/^\+\d{10,15}$/.test(String(phoneNumber))) {
                    toast.error(
                        'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456'
                    );
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
                    ...nextUser,
                    fullName: nextUser.fullName || fullName,
                    phoneNumber: nextUser.phoneNumber || phoneNumber,
                }));

                try {
                    const storedRaw = localStorage.getItem('user');
                    const stored = storedRaw ? JSON.parse(storedRaw) : {};
                    localStorage.setItem(
                        'user',
                        JSON.stringify({
                            ...stored,
                            ...nextUser,
                            fullName: nextUser.fullName || fullName,
                            phoneNumber: nextUser.phoneNumber || phoneNumber,
                        })
                    );
                } catch {
                    // Profile is already persisted on the backend; local cache sync is best effort.
                }

                toast.success('Профиль ийгиликтүү жаңыртылды');
                return true;
            } catch (error) {
                console.error('Failed to update profile', error);
                const rawMessage = error?.response?.data?.message || 'Профилди сактоо мүмкүн болбоду';
                const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
                toast.error(message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [studentId]
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
