import { useEffect, useMemo, useState } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiAward, FiGlobe, FiPenTool, FiSave, FiUsers, FiX } from 'react-icons/fi';

const SOCIAL_FIELDS = [
    ['website', 'Сайт / Портфолио'],
    ['linkedin', 'LinkedIn'],
    ['instagram', 'Instagram'],
    ['youtube', 'YouTube'],
    ['facebook', 'Facebook'],
    ['twitter', 'Twitter / X'],
];

const createFormState = (profile) => ({
    title: profile?.title || '',
    bio: profile?.bio || '',
    yearsOfExperience:
        profile?.yearsOfExperience === undefined || profile?.yearsOfExperience === null
            ? ''
            : String(profile.yearsOfExperience),
    expertiseTagsText: Array.isArray(profile?.expertiseTags) ? profile.expertiseTags.join(', ') : '',
    socialLinks: SOCIAL_FIELDS.reduce((acc, [key]) => {
        acc[key] = profile?.socialLinks?.[key] || '';
        return acc;
    }, {}),
});

const ProfileSection = ({ profile, onSaveProfile, savingProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(createFormState(profile));

    useEffect(() => {
        setForm(createFormState(profile));
        setIsEditing(false);
    }, [profile]);

    const expertiseTags = useMemo(
        () =>
            (form.expertiseTagsText || '')
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
        [form.expertiseTagsText]
    );

    const socialLinks = useMemo(
        () =>
            Object.entries(form.socialLinks || {}).filter(([, value]) =>
                Boolean(value?.trim?.() || value)
            ),
        [form.socialLinks]
    );

    const handleSave = async () => {
        if (!onSaveProfile) return;

        const payload = {
            title: form.title.trim() || null,
            bio: form.bio.trim() || null,
            yearsOfExperience: form.yearsOfExperience === '' ? null : Number(form.yearsOfExperience),
            expertiseTags: expertiseTags,
            socialLinks: Object.entries(form.socialLinks).reduce((acc, [key, value]) => {
                const normalized = value.trim();
                if (normalized) acc[key] = normalized;
                return acc;
            }, {}),
        };

        const success = await onSaveProfile(payload);
        if (success) setIsEditing(false);
    };

    const resetForm = () => {
        setForm(createFormState(profile));
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
        <DashboardSectionHeader
            eyebrow="Profile workspace"
            title="Профиль"
            description="Өзүңүз тууралуу негизги маалымат, эксперттик темалар жана коомдук шилтемелер ушул жерде көрүнөт."
        />

        <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetricCard
                label="Наам"
                value={form.title.trim() || '—'}
                icon={FiAward}
            />
            <DashboardMetricCard
                label="Тажрыйба"
                value={form.yearsOfExperience ? `${form.yearsOfExperience} жыл` : '—'}
                icon={FiPenTool}
                tone="blue"
            />
            <DashboardMetricCard
                label="Студенттер"
                value={profile?.numberOfStudents ?? '—'}
                icon={FiUsers}
                tone="green"
            />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardInsetPanel
                title="Био / Өзүм жөнүндө"
                description="Студенттерге жана командага көрүнгөн кыскача тааныштыруу."
                action={(
                    <button
                        type="button"
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="dashboard-button-secondary"
                    >
                        <FiPenTool className="h-4 w-4" />
                        {isEditing ? 'Жабуу' : 'Өзгөртүү'}
                    </button>
                )}
            >
                {isEditing ? (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Наам
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    className="dashboard-field mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                    Иш тажрыйбасы
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.yearsOfExperience}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            yearsOfExperience: e.target.value,
                                        }))
                                    }
                                    className="dashboard-field mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                Био / Өзүм жөнүндө
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, bio: e.target.value }))
                                }
                                rows={6}
                                className="dashboard-field mt-1 min-h-[140px]"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                Эксперттик билимдер
                            </label>
                            <input
                                type="text"
                                value={form.expertiseTagsText}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        expertiseTagsText: e.target.value,
                                    }))
                                }
                                className="dashboard-field mt-1"
                                placeholder="Frontend, UI/UX, Product Design"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={savingProfile}
                                className="dashboard-button-primary"
                            >
                                <FiSave className="h-4 w-4" />
                                {savingProfile ? 'Сакталууда...' : 'Сактоо'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={savingProfile}
                                className="dashboard-button-secondary"
                            >
                                <FiX className="h-4 w-4" />
                                Жокко чыгаруу
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-edubot-ink dark:text-slate-200">
                        {form.bio.trim() || 'Маалымат кошула элек'}
                    </p>
                )}
            </DashboardInsetPanel>

            <div className="space-y-6">
                <DashboardInsetPanel
                    title="Эксперттик билимдер"
                    description="Профилде көрүнгөн негизги адистик темалары."
                >
                    <div className="mt-4">
                        {expertiseTags.length ? (
                            <div className="flex flex-wrap gap-2">
                                {expertiseTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-edubot-line bg-edubot-surfaceAlt px-3 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Эксперттик билимдер кошула элек"
                                subtitle="Профилди түзөтүү бетинде негизги темаларыңызды кошсоңуз, алар ушул жерде көрүнөт."
                                icon={<FiAward className="h-8 w-8 text-edubot-orange" />}
                                className="py-8"
                            />
                        )}
                    </div>
                </DashboardInsetPanel>

                <DashboardInsetPanel
                    title="Социалдык шилтемелер"
                    description="Тышкы профилдер жана коомдук байланыш каналдары."
                >
                    {isEditing ? (
                        <div className="mt-4 space-y-4">
                            {SOCIAL_FIELDS.map(([key, label]) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                                        {label}
                                    </label>
                                    <input
                                        type="url"
                                        value={form.socialLinks[key]}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                socialLinks: {
                                                    ...prev.socialLinks,
                                                    [key]: e.target.value,
                                                },
                                            }))
                                        }
                                        className="dashboard-field mt-1"
                                        placeholder="https://..."
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {socialLinks.length ? (
                                socialLinks.map(([key, value]) => (
                                    <a
                                        key={key}
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-2xl border border-edubot-line/80 bg-white/90 px-4 py-3 text-sm text-edubot-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                            <FiGlobe className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 truncate">{value}</span>
                                    </a>
                                ))
                            ) : (
                                <EmptyState
                                    title="Социалдык шилтемелер жок"
                                    subtitle="Портфолио же коомдук профиль шилтемелерин кошкондо алар ушул жерде пайда болот."
                                    icon={<FiGlobe className="h-8 w-8 text-edubot-orange" />}
                                    className="py-8"
                                />
                            )}
                        </div>
                    )}
                </DashboardInsetPanel>
            </div>
        </div>
    </div>
    );
};

export default ProfileSection;
