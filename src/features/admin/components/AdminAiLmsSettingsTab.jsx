import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiCpu, FiSave, FiShield, FiSliders } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
} from '@components/ui/dashboard';
import Loader from '@shared/ui/Loader';
import { parseApiError } from '@shared/api/error';
import { fetchUsers } from '@services/api';
import {
    listAiLmsAdminFeatureLimits,
    listAiLmsAdminSettings,
    updateAiLmsAdminFeatureLimit,
    updateAiLmsAdminSettings,
} from '../../aiLms/api';
import AdminAiAuditPanel from './AdminAiAuditPanel';

const FEATURES = [
    'feedback_draft',
    'lesson_quiz_draft',
    'homework_draft',
    'lesson_kit',
    'worksheet_draft',
    'course_draft',
    'message_draft',
];

const DEFAULT_MONTHLY_LIMITS = {
    feedback_draft: 200,
    lesson_quiz_draft: 100,
    homework_draft: 150,
    lesson_kit: 80,
    worksheet_draft: 80,
    course_draft: 30,
    message_draft: 120,
};

const emptyToNull = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

const buildScopeParams = ({ scopeType, companyId, userId }) => ({
    scopeType,
    ...(scopeType === 'tenant' && companyId ? { companyId: Number(companyId) } : {}),
    ...(scopeType === 'independent_instructor' && userId ? { userId: Number(userId) } : {}),
});

const getFeatureLimit = (limits, feature) => limits.find((limit) => limit.feature === feature) || {};

const getUserLabel = (user) => {
    if (!user) return '-';
    const name = user.fullName || user.name || user.email || `ID ${user.id}`;
    return user.email && user.email !== name ? `${name} (${user.email})` : name;
};

const normalizeSettingsState = ({ enabled, defaultLanguage, enabledFeatures }) => ({
    enabled: Boolean(enabled),
    defaultLanguage: defaultLanguage || 'ky',
    enabledFeatures: [...new Set(enabledFeatures || [])].sort(),
});

const areSettingsEqual = (left, right) =>
    Boolean(left && right) &&
    left.enabled === right.enabled &&
    left.defaultLanguage === right.defaultLanguage &&
    left.enabledFeatures.length === right.enabledFeatures.length &&
    left.enabledFeatures.every((feature, index) => feature === right.enabledFeatures[index]);

const AdminAiLmsSettingsTab = ({ companies = [] }) => {
    const { t } = useTranslation();
    const [scopeType, setScopeType] = useState('tenant');
    const [companyId, setCompanyId] = useState('');
    const [userId, setUserId] = useState('');
    const [instructors, setInstructors] = useState([]);
    const [loadingInstructors, setLoadingInstructors] = useState(false);
    const [instructorsLoaded, setInstructorsLoaded] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [defaultLanguage, setDefaultLanguage] = useState('ky');
    const [enabledFeatures, setEnabledFeatures] = useState([]);
    const [savedSettings, setSavedSettings] = useState(null);
    const [limits, setLimits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingLimitFeature, setSavingLimitFeature] = useState('');

    const selectedCompany = useMemo(
        () => companies.find((company) => String(company.id) === String(companyId)),
        [companies, companyId]
    );

    const selectedInstructor = useMemo(
        () => instructors.find((instructor) => String(instructor.id) === String(userId)),
        [instructors, userId]
    );

    useEffect(() => {
        if (!companyId && companies.length) {
            setCompanyId(String(companies[0].id));
        }
    }, [companies, companyId]);

    useEffect(() => {
        if (scopeType !== 'independent_instructor') return;
        if (instructors.length) {
            if (!userId) {
                setUserId(String(instructors[0].id));
            }
            return;
        }
        if (instructorsLoaded) return;
        if (loadingInstructors) return;

        const loadInstructors = async () => {
            setLoadingInstructors(true);
            try {
                const result = await fetchUsers({ page: 1, limit: 200, role: 'instructor' });
                const rows = Array.isArray(result) ? result : (result?.data ?? []);
                setInstructors(rows);
                setInstructorsLoaded(true);
                if (!userId && rows.length) {
                    setUserId(String(rows[0].id));
                }
            } catch (error) {
                toast.error(parseApiError(error, t('adminAiLms.toasts.instructorsLoadError')).message);
            } finally {
                setLoadingInstructors(false);
            }
        };

        loadInstructors();
    }, [instructors, instructors.length, instructorsLoaded, loadingInstructors, scopeType, t, userId]);

    const scopeReady = scopeType === 'tenant' ? Boolean(companyId) : Boolean(userId);
    const scopeParams = useMemo(
        () => buildScopeParams({ scopeType, companyId, userId }),
        [companyId, scopeType, userId]
    );
    const currentSettings = useMemo(
        () => normalizeSettingsState({ enabled, defaultLanguage, enabledFeatures }),
        [defaultLanguage, enabled, enabledFeatures]
    );
    const isSettingsDirty = !areSettingsEqual(currentSettings, savedSettings);

    const loadAiLmsSettings = async () => {
        if (!scopeReady) return;
        setLoading(true);
        try {
            const [settingsRows, limitRows] = await Promise.all([
                listAiLmsAdminSettings(scopeParams),
                listAiLmsAdminFeatureLimits(scopeParams),
            ]);
            const settings = settingsRows?.[0];
            const nextEnabledFeatures = Array.isArray(settings?.settings?.enabledFeatures)
                ? settings.settings.enabledFeatures
                : [];
            setEnabled(Boolean(settings?.enabled));
            setDefaultLanguage(settings?.defaultLanguage || 'ky');
            setEnabledFeatures(nextEnabledFeatures);
            setSavedSettings(normalizeSettingsState({
                enabled: settings?.enabled,
                defaultLanguage: settings?.defaultLanguage,
                enabledFeatures: nextEnabledFeatures,
            }));
            setLimits(Array.isArray(limitRows) ? limitRows : []);
        } catch (error) {
            toast.error(parseApiError(error, t('adminAiLms.toasts.loadError')).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAiLmsSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scopeReady, scopeParams.scopeType, scopeParams.companyId, scopeParams.userId]);

    const toggleFeature = (feature) => {
        setEnabledFeatures((current) =>
            current.includes(feature)
                ? current.filter((item) => item !== feature)
                : [...current, feature]
        );
    };

    const saveSettings = async () => {
        if (!scopeReady) return;
        setSavingSettings(true);
        try {
            const saved = await updateAiLmsAdminSettings({
                ...scopeParams,
                enabled,
                defaultLanguage,
                settings: {
                    rolloutStage: 'beta',
                    enabledFeatures,
                },
            });
            setEnabled(Boolean(saved.enabled));
            setDefaultLanguage(saved.defaultLanguage || defaultLanguage);
            const nextEnabledFeatures = Array.isArray(saved.settings?.enabledFeatures)
                ? saved.settings.enabledFeatures
                : enabledFeatures;
            setEnabledFeatures(nextEnabledFeatures);
            setSavedSettings(normalizeSettingsState({
                enabled: saved.enabled,
                defaultLanguage: saved.defaultLanguage || defaultLanguage,
                enabledFeatures: nextEnabledFeatures,
            }));
            toast.success(t('adminAiLms.toasts.settingsSaved'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminAiLms.toasts.settingsSaveError')).message);
        } finally {
            setSavingSettings(false);
        }
    };

    const saveLimit = async (feature, values) => {
        if (!scopeReady) return;
        setSavingLimitFeature(feature);
        try {
            const saved = await updateAiLmsAdminFeatureLimit({
                ...scopeParams,
                feature,
                enabled: values.enabled !== false,
                dailyLimit: emptyToNull(values.dailyLimit),
                monthlyLimit: emptyToNull(values.monthlyLimit),
            });
            setLimits((current) => {
                const withoutFeature = current.filter((limit) => limit.feature !== feature);
                return [...withoutFeature, saved].sort((a, b) => a.feature.localeCompare(b.feature));
            });
            toast.success(t('adminAiLms.toasts.limitSaved'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminAiLms.toasts.limitSaveError')).message);
        } finally {
            setSavingLimitFeature('');
        }
    };

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('adminAiLms.eyebrow')}
                title={t('adminAiLms.title')}
                description={t('adminAiLms.description')}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label={t('adminAiLms.metrics.scope')}
                    value={scopeType === 'tenant' ? (selectedCompany?.name || '-') : getUserLabel(selectedInstructor)}
                    icon={FiShield}
                />
                <DashboardMetricCard
                    label={t('adminAiLms.metrics.enabledFeatures')}
                    value={enabledFeatures.length}
                    icon={FiCpu}
                    tone={enabledFeatures.length ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminAiLms.metrics.limits')}
                    value={limits.length}
                    icon={FiSliders}
                    tone={limits.length ? 'blue' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title={t('adminAiLms.scope.title')}
                description={t('adminAiLms.scope.description')}
            >
                <div className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_160px]">
                    <select
                        value={scopeType}
                        onChange={(event) => {
                            setScopeType(event.target.value);
                            setUserId('');
                            setEnabled(false);
                            setEnabledFeatures([]);
                            setSavedSettings(null);
                            setLimits([]);
                        }}
                        className="dashboard-select"
                    >
                        <option value="tenant">{t('adminAiLms.scope.tenant')}</option>
                        <option value="independent_instructor">{t('adminAiLms.scope.independentInstructor')}</option>
                    </select>
                    {scopeType === 'tenant' ? (
                        <select
                            value={companyId}
                            onChange={(event) => setCompanyId(event.target.value)}
                            className="dashboard-select"
                        >
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={userId}
                            onChange={(event) => setUserId(event.target.value)}
                            className="dashboard-select"
                            disabled={loadingInstructors}
                        >
                            <option value="">
                                {loadingInstructors
                                    ? t('adminAiLms.scope.loadingInstructors')
                                    : t('adminAiLms.scope.selectInstructor')}
                            </option>
                            {instructors.map((instructor) => (
                                <option key={instructor.id} value={instructor.id}>
                                    {getUserLabel(instructor)} - ID {instructor.id}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        type="button"
                        onClick={loadAiLmsSettings}
                        disabled={!scopeReady || loading}
                        className="dashboard-button-secondary disabled:opacity-60"
                    >
                        {loading ? t('adminAiLms.actions.loading') : t('adminAiLms.actions.reload')}
                    </button>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('adminAiLms.settings.title')}
                description={t('adminAiLms.settings.description')}
            >
                {loading ? (
                    <div className="py-6">
                        <Loader fullScreen={false} />
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
                            <label className="inline-flex items-center gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 text-sm font-semibold text-edubot-ink dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(event) => setEnabled(event.target.checked)}
                                    className="h-4 w-4"
                                />
                                {t('adminAiLms.settings.enabled')}
                            </label>
                            <select
                                value={defaultLanguage}
                                onChange={(event) => setDefaultLanguage(event.target.value)}
                                className="dashboard-select"
                            >
                                <option value="ky">{t('adminAiPrompts.languages.ky')}</option>
                                <option value="ru">{t('adminAiPrompts.languages.ru')}</option>
                                <option value="en">{t('adminAiPrompts.languages.en')}</option>
                            </select>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {FEATURES.map((feature) => (
                                <label
                                    key={feature}
                                    className="flex items-start gap-3 rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    <input
                                        type="checkbox"
                                        checked={enabledFeatures.includes(feature)}
                                        onChange={() => toggleFeature(feature)}
                                        className="mt-1 h-4 w-4"
                                    />
                                    <span>
                                        <span className="block font-semibold text-edubot-ink dark:text-white">
                                            {t(`adminAiLms.features.${feature}`)}
                                        </span>
                                        <span className="text-xs text-edubot-muted dark:text-slate-400">{feature}</span>
                                    </span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={saveSettings}
                            disabled={!scopeReady || loading || savingSettings || !isSettingsDirty}
                            className="dashboard-button-primary disabled:opacity-60"
                        >
                            <FiSave className="h-4 w-4" />
                            {savingSettings
                                ? t('adminAiLms.actions.saving')
                                : !isSettingsDirty && scopeReady
                                    ? t('adminAiLms.actions.saved')
                                    : t('adminAiLms.actions.saveSettings')}
                        </button>
                    </div>
                )}
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('adminAiLms.limits.title')}
                description={t('adminAiLms.limits.description')}
            >
                <div className="mt-4 space-y-3">
                    {FEATURES.map((feature) => {
                        const limit = getFeatureLimit(limits, feature);
                        return (
                            <FeatureLimitRow
                                key={feature}
                                feature={feature}
                                limit={limit}
                                saving={savingLimitFeature === feature}
                                onSave={saveLimit}
                            />
                        );
                    })}
                </div>
            </DashboardInsetPanel>

            <AdminAiAuditPanel scopeParams={scopeParams} />
        </div>
    );
};

const FeatureLimitRow = ({ feature, limit, saving, onSave }) => {
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(limit.enabled !== false);
    const [dailyLimit, setDailyLimit] = useState(limit.dailyLimit ?? '');
    const [monthlyLimit, setMonthlyLimit] = useState(limit.monthlyLimit ?? DEFAULT_MONTHLY_LIMITS[feature] ?? '');

    useEffect(() => {
        setEnabled(limit.enabled !== false);
        setDailyLimit(limit.dailyLimit ?? '');
        setMonthlyLimit(limit.monthlyLimit ?? DEFAULT_MONTHLY_LIMITS[feature] ?? '');
    }, [feature, limit.dailyLimit, limit.enabled, limit.monthlyLimit]);

    return (
        <div className="grid gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/80 lg:grid-cols-[minmax(0,1fr)_120px_140px_140px_auto] lg:items-center">
            <div>
                <p className="font-semibold text-edubot-ink dark:text-white">{t(`adminAiLms.features.${feature}`)}</p>
                <p className="text-xs text-edubot-muted dark:text-slate-400">{feature}</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-edubot-ink dark:text-white">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                    className="h-4 w-4"
                />
                {t('adminAiLms.limits.enabled')}
            </label>
            <input
                type="number"
                min="0"
                value={dailyLimit}
                onChange={(event) => setDailyLimit(event.target.value)}
                className="dashboard-field"
                placeholder={t('adminAiLms.limits.daily')}
            />
            <input
                type="number"
                min="0"
                value={monthlyLimit}
                onChange={(event) => setMonthlyLimit(event.target.value)}
                className="dashboard-field"
                placeholder={t('adminAiLms.limits.monthly')}
            />
            <button
                type="button"
                onClick={() => onSave(feature, { enabled, dailyLimit, monthlyLimit })}
                disabled={saving}
                className="dashboard-button-secondary disabled:opacity-60"
            >
                {saving ? t('adminAiLms.actions.saving') : t('adminAiLms.actions.saveLimit')}
            </button>
        </div>
    );
};

export default AdminAiLmsSettingsTab;
