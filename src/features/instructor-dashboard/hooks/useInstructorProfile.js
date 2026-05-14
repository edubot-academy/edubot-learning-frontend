import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
    fetchInstructorProfile,
    updateInstructorProfile,
} from '@services/api';

export const useInstructorProfile = (user) => {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingProfile(true);
        try {
            const data = await fetchInstructorProfile(user.id);
            setProfile(data);
        } catch (error) {
            console.error('Failed to load instructor profile', error);
            toast.error('Инструктор маалыматын жүктөө мүмкүн болбоду');
        } finally {
            setLoadingProfile(false);
        }
    }, [user]);

    const saveProfile = useCallback(
        async (payload) => {
            if (!user?.id) return false;

            setSavingProfile(true);
            try {
                const updated = await updateInstructorProfile(user.id, payload);
                setProfile(updated);
                toast.success('Инструктор профили сакталды');
                return true;
            } catch (error) {
                console.error('Failed to save instructor profile', error);
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Инструктор профилин сактоо мүмкүн болбоду';
                toast.error(Array.isArray(message) ? message.join(', ') : message);
                return false;
            } finally {
                setSavingProfile(false);
            }
        },
        [user?.id]
    );

    const expertiseTags = useMemo(() => {
        if (Array.isArray(profile?.expertiseTags) && profile.expertiseTags.length) {
            return profile.expertiseTags.filter(Boolean);
        }
        if (typeof profile?.expertiseTagsText === 'string' && profile.expertiseTagsText.trim()) {
            return profile.expertiseTagsText
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
        }
        return [];
    }, [profile]);

    const socialLinks = useMemo(() =>
            Object.entries(profile?.socialLinks || {}).filter(
                ([, value]) => Boolean(value?.trim?.() || value)
            ),
        [profile]
    );

    return {
        profile,
        loadingProfile,
        savingProfile,
        expertiseTags,
        socialLinks,
        loadProfile,
        saveProfile,
    };
};
