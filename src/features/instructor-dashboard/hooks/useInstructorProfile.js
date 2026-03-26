import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchInstructorProfile } from '@services/api';

export const useInstructorProfile = (user) => {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingProfile(true);
        try {
            const data = await fetchInstructorProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load instructor profile', error);
            toast.error('Профилди жүктөө мүмкүн болбоду');
        } finally {
            setLoadingProfile(false);
        }
    }, [user]);

    const expertiseTags = useMemo(() => {
        if (Array.isArray(profile?.expertiseTags) && profile.expertiseTags.length) {
            return profile.expertiseTags;
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
                ([, value]) => typeof value === 'string' && value.trim().length
            ),
        [profile]
    );

    return {
        profile,
        loadingProfile,
        expertiseTags,
        socialLinks,
        loadProfile,
    };
};
