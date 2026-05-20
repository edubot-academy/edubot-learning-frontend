import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FiArrowLeft,
    FiBriefcase,
    FiBookOpen,
    FiCreditCard,
    FiFlag,
    FiGlobe,
    FiClock,
    FiImage,
    FiLink,
    FiSave,
    FiSettings,
    FiSliders,
    FiTrash2,
    FiUpload,
    FiUsers,
} from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardHeader,
    DashboardLayout,
    DashboardMetricCard,
    DashboardSectionHeader,
    DashboardTabs,
    EmptyState,
} from '@components/ui/dashboard';
import {
    getCompany,
    fetchCourses,
    listCompanyCourses,
    listCompanyActivity,
    listCompanyMembers,
    assignCourseToCompany,
    unassignCourseFromCompany,
    updateCompany,
    linkCompanyCrmTenant,
    unlinkCompanyCrmTenant,
    uploadCompanyLogo,
} from '@services/api';
import CompanyMembers from '../../../pages/company/CompanyMembers';
import Loader from '@shared/ui/Loader';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import { isCourseTypeAllowedForTenant } from '@shared/utils/tenantFeatures';
import { getDashboardPath } from '@shared/utils/navigation';
import { LOCALE_OPTIONS, getLocaleLabel, normalizeLocale } from '../../../i18n/locale';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';
import { getCourseTypeLabel } from '@shared/i18n/enumLabels';

const TABS = [
    {
        id: 'overview',
        labelKey: 'company.platformTenant.tabs.overview',
        icon: FiBriefcase,
        category: 'primary',
        priority: 1,
    },
    {
        id: 'profile',
        labelKey: 'company.platformTenant.tabs.profile',
        icon: FiSettings,
        category: 'primary',
        priority: 2,
    },
    {
        id: 'domain',
        labelKey: 'company.platformTenant.tabs.domain',
        icon: FiGlobe,
        category: 'primary',
        priority: 3,
    },
    {
        id: 'billing',
        labelKey: 'company.platformTenant.tabs.billing',
        icon: FiCreditCard,
        category: 'secondary',
        priority: 1,
    },
    {
        id: 'crm',
        labelKey: 'company.platformTenant.tabs.crm',
        icon: FiLink,
        category: 'secondary',
        priority: 2,
    },
    {
        id: 'members',
        labelKey: 'company.platformTenant.tabs.members',
        icon: FiUsers,
        category: 'secondary',
        priority: 3,
    },
    {
        id: 'courses',
        labelKey: 'company.platformTenant.tabs.courses',
        icon: FiBookOpen,
        category: 'secondary',
        priority: 4,
    },
    {
        id: 'branding',
        labelKey: 'company.platformTenant.tabs.branding',
        icon: FiImage,
        category: 'secondary',
        priority: 5,
    },
    {
        id: 'settings',
        labelKey: 'company.platformTenant.tabs.settings',
        icon: FiSliders,
        category: 'secondary',
        priority: 6,
    },
    {
        id: 'flags',
        labelKey: 'company.platformTenant.tabs.flags',
        icon: FiFlag,
        category: 'secondary',
        priority: 7,
    },
    {
        id: 'activity',
        labelKey: 'company.platformTenant.tabs.activity',
        icon: FiClock,
        category: 'secondary',
        priority: 8,
    },
];

const adminCompaniesPath = getDashboardPath('admin', 'companies');

const COMPANY_STATUSES = ['trial', 'active', 'inactive', 'suspended', 'archived'];
const COURSE_VISIBILITY_OPTIONS = ['PUBLIC', 'PRIVATE', 'TENANT_ONLY'];

const DEFAULT_BRANDING = {
    displayName: '',
    primaryColor: '#f17e22',
    secondaryColor: '#14b8a6',
    accentColor: '',
    certificateLogoUrl: '',
};

const DEFAULT_SETTINGS = {
    supportEmail: '',
    defaultCourseVisibility: 'PUBLIC',
    allowSelfEnrollment: false,
    requireEnrollmentApproval: false,
};

const BLANK_FEATURE_FLAG = { key: '', value: true };
const FEATURE_FLAG_DEFINITIONS = [
    {
        key: 'courses.video.enabled',
        labelKey: 'company.platformTenant.featureFlags.video.label',
        descriptionKey: 'company.platformTenant.featureFlags.video.description',
    },
    {
        key: 'courses.offline.enabled',
        labelKey: 'company.platformTenant.featureFlags.offline.label',
        descriptionKey: 'company.platformTenant.featureFlags.offline.description',
    },
    {
        key: 'courses.onlineLive.enabled',
        labelKey: 'company.platformTenant.featureFlags.onlineLive.label',
        descriptionKey: 'company.platformTenant.featureFlags.onlineLive.description',
    },
    {
        key: 'certificates.enabled',
        labelKey: 'company.platformTenant.featureFlags.certificates.label',
        descriptionKey: 'company.platformTenant.featureFlags.certificates.description',
    },
    {
        key: 'attendance.enabled',
        labelKey: 'company.platformTenant.featureFlags.attendance.label',
        descriptionKey: 'company.platformTenant.featureFlags.attendance.description',
    },
    {
        key: 'homework.enabled',
        labelKey: 'company.platformTenant.featureFlags.homework.label',
        descriptionKey: 'company.platformTenant.featureFlags.homework.description',
    },
    {
        key: 'crmSync.enabled',
        labelKey: 'company.platformTenant.featureFlags.crmSync.label',
        descriptionKey: 'company.platformTenant.featureFlags.crmSync.description',
    },
    {
        key: 'aiAssistant.enabled',
        labelKey: 'company.platformTenant.featureFlags.aiAssistant.label',
        descriptionKey: 'company.platformTenant.featureFlags.aiAssistant.description',
    },
];
const PREDEFINED_FEATURE_FLAG_KEYS = new Set(FEATURE_FLAG_DEFINITIONS.map((flag) => flag.key));

const cleanPayload = (payload = {}) =>
    Object.fromEntries(
        Object.entries(payload)
            .filter(([, value]) => {
                if (typeof value === 'string') return value.trim() !== '';
                return value !== undefined && value !== null;
            })
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );

const CRM_LINK_FIELDS = new Set(['crmTenantId', 'crmTenantSlug', 'crmPrimaryDomain']);

const splitTenantPayload = (payload = {}) => {
    const tenantPatch = {};
    const crmPatch = {};
    for (const [key, value] of Object.entries(payload)) {
        if (CRM_LINK_FIELDS.has(key)) {
            crmPatch[key] = value;
        } else {
            tenantPatch[key] = value;
        }
    }
    return { tenantPatch, crmPatch };
};

const tenantDomain = (company, t) => {
    if (company?.customDomain) return company.customDomain;
    if (company?.subdomain) return `${company.subdomain}.lms.edubot.it.com`;
    return t('company.platformTenant.notConfigured');
};

const buildForm = (company) => ({
    name: company?.name ?? '',
    logoUrl: company?.logoUrl ?? '',
    website: company?.website ?? '',
    email: company?.email ?? '',
    phone: company?.phone ?? '',
    contactName: company?.contactName ?? '',
    contactEmail: company?.contactEmail ?? '',
    contactPhone: company?.contactPhone ?? '',
    address: company?.address ?? '',
    city: company?.city ?? '',
    country: company?.country ?? '',
    telegram: company?.telegram ?? '',
    whatsapp: company?.whatsapp ?? '',
    instagram: company?.instagram ?? '',
    taxId: company?.taxId ?? '',
    notes: company?.notes ?? '',
    subdomain: company?.subdomain ?? '',
    customDomain: company?.customDomain ?? '',
    status: company?.status ?? 'active',
    plan: company?.plan ?? '',
    billingStatus: company?.billingStatus ?? '',
    crmTenantId: company?.crmTenantId ?? '',
    crmTenantSlug: company?.crmTenantSlug ?? '',
    crmPrimaryDomain: company?.crmPrimaryDomain ?? '',
    timezone: company?.timezone ?? 'Asia/Bishkek',
    locale: normalizeLocale(company?.locale),
});

const buildBrandingForm = (branding) => ({
    ...DEFAULT_BRANDING,
    ...(branding && typeof branding === 'object' ? branding : {}),
});

const buildSettingsForm = (settings) => ({
    ...DEFAULT_SETTINGS,
    ...(settings && typeof settings === 'object' ? settings : {}),
});

const buildFeatureFlagRows = (featureFlags) => {
    const flags = featureFlags && typeof featureFlags === 'object' ? featureFlags : {};
    const predefinedRows = FEATURE_FLAG_DEFINITIONS.map((flag) => ({
        ...flag,
        value: flags[flag.key] !== false,
        predefined: true,
    }));
    const customRows = Object.entries(flags)
        .filter(([key]) => !PREDEFINED_FEATURE_FLAG_KEYS.has(key))
        .map(([key, value]) => ({ key, value: Boolean(value), predefined: false }));
    return [...predefinedRows, ...customRows];
};

const buildFeatureFlagsPayload = (rows) =>
    rows.reduce((acc, row) => {
        const key = row.key.trim();
        if (!key) return acc;
        if (row.predefined && row.value === true) return acc;
        acc[key] = Boolean(row.value);
        return acc;
    }, {});

const customFeatureFlagRows = (rows) => rows.filter((row) => !row.predefined);

const normalizePagedItems = (response) => {
    if (Array.isArray(response)) return response;
    return response?.items ?? response?.courses ?? response?.data ?? [];
};

const courseStatusLabel = (course, t) => {
    const status = course?.status
        ? String(course.status).toLowerCase()
        : course?.isPublished || course?.published
          ? 'published'
          : course?.approved
            ? 'approved'
            : 'draft';
    return t(`company.courses.status.${status}`, {
        defaultValue: status.replace(/_/g, ' '),
    });
};

const disabledCourseTypeMessage = (courseType, t) => {
    const type = String(courseType || '').toLowerCase();
    if (type === 'offline') return t('company.courses.disabled.offline');
    if (type === 'online_live' || type === 'onlinelive') {
        return t('company.courses.disabled.onlineLive');
    }
    return t('company.courses.disabled.generic');
};

const courseFallbackTitle = (course, t) =>
    course?.title || t('company.courses.platform.courseNumber', { id: course?.id });

const companyStatusLabel = (status, t) => {
    const normalizedStatus = String(status || 'active').toLowerCase();
    return t(`company.platformTenant.status.${normalizedStatus}`, {
        defaultValue: normalizedStatus.replace(/_/g, ' '),
    });
};

const courseVisibilityLabel = (visibility, t) => {
    const normalizedVisibility = String(visibility || 'PUBLIC').toUpperCase();
    return t(`company.platformTenant.courseVisibility.${normalizedVisibility}`, {
        defaultValue: normalizedVisibility.replace(/_/g, ' '),
    });
};

const ACTIVITY_LABELS = {
    'tenant.created': 'company.platformTenant.activity.actions.tenantCreated',
    'tenant.updated': 'company.platformTenant.activity.actions.tenantUpdated',
    'tenant.logo_updated': 'company.platformTenant.activity.actions.logoUpdated',
    'member.role_added': 'company.platformTenant.activity.actions.roleAdded',
    'member.role_removed': 'company.platformTenant.activity.actions.roleRemoved',
    'member.removed': 'company.platformTenant.activity.actions.memberRemoved',
    'member.role_set': 'company.platformTenant.activity.actions.roleChanged',
    'course.attached': 'company.platformTenant.activity.actions.courseAttached',
    'course.removed': 'company.platformTenant.activity.actions.courseRemoved',
};

const formatActivitySummary = (activity, t) => {
    const metadata = activity?.metadata || {};
    if (metadata.courseTitle) return metadata.courseTitle;
    if (metadata.role) {
        return t('company.platformTenant.activity.roleSummary', { role: metadata.role });
    }
    if (metadata.userId) {
        return t('company.platformTenant.activity.userNumber', { id: metadata.userId });
    }
    if (metadata.changes) return Object.keys(metadata.changes).join(', ');
    return activity?.targetId
        ? t('company.platformTenant.activity.targetNumber', {
              type: activity.targetType || t('company.platformTenant.activity.target'),
              id: activity.targetId,
          })
        : t('company.platformTenant.activity.noDetails');
};

const displayValue = (value, t) => {
    if (value === undefined || value === null || value === '') return t('company.detail.notSet');
    if (typeof value === 'boolean') {
        return value
            ? t('company.platformTenant.values.enabled')
            : t('company.platformTenant.values.disabled');
    }
    return value;
};

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
    <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
            {label}
        </span>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="dashboard-field w-full"
        />
    </label>
);

const SelectField = ({ label, value, onChange, children }) => (
    <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
            {label}
        </span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-select w-full"
        >
            {children}
        </select>
    </label>
);

const TextareaField = ({ label, value, onChange }) => (
    <label className="space-y-1 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
            {label}
        </span>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-field min-h-28 w-full"
        />
    </label>
);

const ReadField = ({ label, value }) => {
    const { t } = useTranslation();
    return (
        <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 break-words text-sm font-medium text-edubot-ink dark:text-white">
                {displayValue(value, t)}
            </p>
        </div>
    );
};

const SaveButton = ({ onClick, loading = false }) => {
    const { t } = useTranslation();
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
            <FiSave className="h-4 w-4" />
            {loading ? t('company.settings.saving') : t('company.settings.saveChanges')}
        </button>
    );
};

const SectionActions = ({ isEditing, onEdit, onCancel, onSave, loading = false }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {isEditing ? (
                <>
                    <SaveButton onClick={onSave} loading={loading} />
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t('company.settings.cancel')}
                    </button>
                </>
            ) : (
                <button type="button" onClick={onEdit} className="dashboard-button-secondary">
                    {t('company.settings.editProfile')}
                </button>
            )}
        </div>
    );
};

const SwitchControl = ({ checked, onChange, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
            checked
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-edubot-line bg-edubot-surfaceAlt dark:border-slate-700 dark:bg-slate-800'
        }`}
    >
        <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                checked ? 'translate-x-5' : 'translate-x-1'
            }`}
        />
    </button>
);

export default function PlatformTenantDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const tenantId = Number(id);
    const logoInputRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editSection, setEditSection] = useState(null);
    const [company, setCompany] = useState(null);
    const [form, setForm] = useState(buildForm(null));
    const [brandingForm, setBrandingForm] = useState(buildBrandingForm(null));
    const [settingsForm, setSettingsForm] = useState(buildSettingsForm(null));
    const [featureFlagRows, setFeatureFlagRows] = useState(buildFeatureFlagRows(null));
    const [tenantMembers, setTenantMembers] = useState([]);
    const [tenantCourses, setTenantCourses] = useState([]);
    const [tenantCoursesLoading, setTenantCoursesLoading] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');
    const [attachSearch, setAttachSearch] = useState('');
    const [attachOptions, setAttachOptions] = useState([]);
    const [attachLoading, setAttachLoading] = useState(false);
    const [attachingCourseId, setAttachingCourseId] = useState(null);
    const [activityItems, setActivityItems] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [savingSection, setSavingSection] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [confirmationLoading, setConfirmationLoading] = useState(false);

    const loadCompany = useCallback(async () => {
        setLoading(true);
        try {
            const [data, members, coursesResponse] = await Promise.all([
                getCompany(tenantId),
                listCompanyMembers(tenantId).catch(() => []),
                listCompanyCourses(tenantId, { page: 1, limit: 50 }).catch(() => ({ items: [] })),
            ]);
            setCompany(data);
            setTenantMembers(members);
            setTenantCourses(normalizePagedItems(coursesResponse));
            setForm(buildForm(data));
            setBrandingForm(buildBrandingForm(data?.branding));
            setSettingsForm(buildSettingsForm(data?.settings));
            setFeatureFlagRows(buildFeatureFlagRows(data?.featureFlags));
        } catch (error) {
            toast.error(parseApiError(error, t('company.platformTenant.toasts.loadError')).message);
        } finally {
            setLoading(false);
        }
    }, [t, tenantId]);

    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    const loadTenantCourses = useCallback(async () => {
        setTenantCoursesLoading(true);
        try {
            const response = await listCompanyCourses(tenantId, {
                page: 1,
                limit: 50,
                q: courseSearch,
            });
            setTenantCourses(normalizePagedItems(response));
        } catch (error) {
            toast.error(parseApiError(error, t('company.courses.toasts.loadError')).message);
        } finally {
            setTenantCoursesLoading(false);
        }
    }, [courseSearch, t, tenantId]);

    useEffect(() => {
        if (activeTab === 'courses') {
            loadTenantCourses();
        }
    }, [activeTab, loadTenantCourses]);

    const loadActivity = useCallback(async () => {
        setActivityLoading(true);
        try {
            const response = await listCompanyActivity(tenantId, { page: 1, limit: 50 });
            setActivityItems(normalizePagedItems(response));
        } catch (error) {
            toast.error(
                parseApiError(error, t('company.platformTenant.toasts.activityLoadError')).message
            );
        } finally {
            setActivityLoading(false);
        }
    }, [t, tenantId]);

    useEffect(() => {
        if (activeTab === 'activity') {
            loadActivity();
        }
    }, [activeTab, loadActivity]);

    useEffect(() => {
        if (activeTab !== 'courses' || !attachSearch.trim()) {
            setAttachOptions([]);
            setAttachLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setAttachLoading(true);
            try {
                const response = await fetchCourses({
                    q: attachSearch.trim(),
                    limit: 10,
                    excludeIds: tenantCourses.map((course) => course.id).join(','),
                });
                setAttachOptions(normalizePagedItems(response));
            } catch {
                setAttachOptions([]);
            } finally {
                setAttachLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [activeTab, attachSearch, tenantCourses]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const savePatch = async (patch) => {
        setSavingSection(true);
        try {
            const { tenantPatch, crmPatch } = splitTenantPayload(patch);
            const cleanedTenantPatch = cleanPayload(tenantPatch);
            const updated = Object.keys(cleanedTenantPatch).length
                ? await updateCompany(tenantId, cleanedTenantPatch)
                : {};
            const crmTenantId =
                typeof crmPatch.crmTenantId === 'string' ? crmPatch.crmTenantId.trim() : '';
            const hasCrmFields = Object.keys(crmPatch).length > 0;
            const shouldUnlinkCrm = hasCrmFields && !crmTenantId && company?.crmTenantId;
            const crmResult =
                hasCrmFields && crmTenantId
                    ? await linkCompanyCrmTenant(tenantId, cleanPayload(crmPatch))
                    : shouldUnlinkCrm
                      ? await unlinkCompanyCrmTenant(tenantId)
                      : null;
            const crmUpdate = crmResult?.crmLink
                ? {
                      crmTenantId: crmResult.crmLink.crmTenantId,
                      crmTenantSlug: crmResult.crmLink.crmTenantSlug,
                      crmPrimaryDomain: crmResult.crmLink.crmPrimaryDomain,
                  }
                : shouldUnlinkCrm
                  ? {
                        crmTenantId: '',
                        crmTenantSlug: '',
                        crmPrimaryDomain: '',
                    }
                  : {};
            const nextCompany = { ...company, ...updated, ...crmUpdate };
            setCompany((prev) => ({ ...prev, ...updated, ...crmUpdate }));
            setForm(buildForm(nextCompany));
            setBrandingForm(buildBrandingForm(nextCompany.branding));
            setSettingsForm(buildSettingsForm(nextCompany.settings));
            setFeatureFlagRows(buildFeatureFlagRows(nextCompany.featureFlags));
            setEditSection(null);
            toast.success(t('company.platformTenant.toasts.saved'));
        } catch (error) {
            toast.error(parseApiError(error, t('company.platformTenant.toasts.saveError')).message);
        } finally {
            setSavingSection(false);
        }
    };

    const cancelEdit = () => {
        setForm(buildForm(company));
        setBrandingForm(buildBrandingForm(company?.branding));
        setSettingsForm(buildSettingsForm(company?.settings));
        setFeatureFlagRows(buildFeatureFlagRows(company?.featureFlags));
        setEditSection(null);
    };

    const uploadLogo = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const logoUrl = await uploadCompanyLogo(tenantId, file);
            if (!logoUrl) throw new Error(t('company.settings.toasts.logoUploadMissingUrl'));
            setCompany((prev) => ({ ...prev, logoUrl }));
            setForm((prev) => ({ ...prev, logoUrl }));
            toast.success(t('company.settings.toasts.logoUploaded'));
        } catch (error) {
            toast.error(parseApiError(error, t('company.settings.toasts.logoUploadError')).message);
        } finally {
            setUploadingLogo(false);
            event.target.value = '';
        }
    };

    const updateBranding = (key, value) => {
        setBrandingForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateSettings = (key, value) => {
        setSettingsForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateFeatureFlagRow = (index, patch) => {
        setFeatureFlagRows((prev) =>
            prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row))
        );
    };

    const removeFeatureFlagRow = (index) => {
        setFeatureFlagRows((prev) => {
            const nextRows = prev.filter((_, rowIndex) => rowIndex !== index);
            return nextRows.length ? nextRows : buildFeatureFlagRows(null);
        });
    };

    const addCustomFeatureFlagRow = () => {
        setFeatureFlagRows((prev) => [...prev, { ...BLANK_FEATURE_FLAG, predefined: false }]);
    };

    const confirmStatusPatch = (status) => {
        setConfirmation({
            title: t('company.platformTenant.lifecycle.changeTitle'),
            message: t('company.platformTenant.lifecycle.changeMessage', {
                status: companyStatusLabel(status, t),
            }),
            confirmLabel: t('company.platformTenant.lifecycle.changeConfirm'),
            confirmVariant: status === 'active' ? 'primary' : 'danger',
            onConfirm: async () => {
                setConfirmationLoading(true);
                await savePatch({ status });
                setConfirmationLoading(false);
                setConfirmation(null);
            },
        });
    };

    const attachCourse = async (courseId) => {
        const course = attachOptions.find((item) => item.id === courseId);
        if (course && !isCourseTypeAllowedForTenant(company, course.courseType)) {
            toast.error(disabledCourseTypeMessage(course.courseType, t));
            return;
        }

        try {
            setAttachingCourseId(courseId);
            await assignCourseToCompany(courseId, tenantId);
            toast.success(t('company.courses.toasts.attached'));
            setAttachSearch('');
            setAttachOptions([]);
            await loadTenantCourses();
        } catch (error) {
            toast.error(parseApiError(error, t('company.courses.toasts.attachError')).message);
        } finally {
            setAttachingCourseId(null);
        }
    };

    const detachCourse = async (courseId) => {
        setConfirmation({
            title: t('company.courses.detachModal.title'),
            message: t('company.courses.detachModal.message'),
            confirmLabel: t('company.courses.detach'),
            confirmVariant: 'danger',
            onConfirm: async () => {
                setConfirmationLoading(true);
                try {
                    await unassignCourseFromCompany(courseId, tenantId);
                    toast.success(t('company.courses.toasts.detached'));
                    await loadTenantCourses();
                    setConfirmation(null);
                } catch (error) {
                    toast.error(
                        parseApiError(error, t('company.courses.toasts.detachError')).message
                    );
                } finally {
                    setConfirmationLoading(false);
                }
            },
        });
    };

    const adminUser = {
        fullName: user?.fullName || t('company.platformTenant.adminFallback'),
        email: user?.email || 'admin@edubot.kg',
    };

    const dashboardNavItems = TABS.map((item) => ({
        ...item,
        label: t(item.labelKey),
        isActive: item.id === activeTab,
        onSelect: (id) => setActiveTab(id),
    }));

    const headerContent = (
        <DashboardHeader
            user={adminUser}
            role="admin"
            subtitle={t('company.platformTenant.headerSubtitle')}
            actions={[
                {
                    label: sidebarOpen
                        ? t('company.platformTenant.hideMenu')
                        : t('company.platformTenant.showMenu'),
                    onClick: () => setSidebarOpen((prev) => !prev),
                    variant: 'secondary',
                },
                {
                    label: t('company.platformTenant.tenantRegistry'),
                    to: adminCompaniesPath,
                    variant: 'secondary',
                },
            ]}
        />
    );

    const mobileTabs = (
        <DashboardTabs
            items={dashboardNavItems}
            activeId={activeTab}
            onSelect={(id) => setActiveTab(id)}
        />
    );

    if (loading) {
        return (
            <DashboardLayout
                role="admin"
                user={adminUser}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navItems={dashboardNavItems}
                mobileTabs={mobileTabs}
                headerContent={headerContent}
            >
                <Loader fullScreen={false} />
            </DashboardLayout>
        );
    }

    if (!company) {
        return (
            <DashboardLayout
                role="admin"
                user={adminUser}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navItems={dashboardNavItems}
                mobileTabs={mobileTabs}
                headerContent={headerContent}
            >
                <EmptyState
                    title={t('company.platformTenant.notFoundTitle')}
                    subtitle={t('company.platformTenant.notFoundSubtitle')}
                />
            </DashboardLayout>
        );
    }

    const ownerCount = tenantMembers.filter((member) => member.role === 'owner').length;
    const adminCount = tenantMembers.filter((member) => member.role === 'company_admin').length;
    const studentCount = tenantMembers.filter((member) => member.role === 'student').length;
    const configuredFlagCount = Object.keys(company.featureFlags || {}).length;

    return (
        <DashboardLayout
            role="admin"
            user={adminUser}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            navItems={dashboardNavItems}
            mobileTabs={mobileTabs}
            headerContent={headerContent}
        >
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <DashboardSectionHeader
                        eyebrow={t('company.platformTenant.eyebrow')}
                        title={company.name}
                        description={`${companyStatusLabel(company.status, t)} · ${tenantDomain(company, t)}`}
                    />
                    <Link to={adminCompaniesPath} className="dashboard-button-secondary self-start">
                        <FiArrowLeft className="h-4 w-4" />
                        {t('company.platformTenant.tenants')}
                    </Link>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.status')}
                                value={companyStatusLabel(company.status, t)}
                                icon={FiBriefcase}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.plan')}
                                value={company.plan || t('company.detail.notSet')}
                                icon={FiCreditCard}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.owners')}
                                value={ownerCount}
                                icon={FiUsers}
                                tone={ownerCount ? 'green' : 'amber'}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.admins')}
                                value={adminCount}
                                icon={FiUsers}
                                tone={adminCount ? 'blue' : 'amber'}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.courses')}
                                value={tenantCourses.length}
                                icon={FiBookOpen}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.students')}
                                value={studentCount}
                                icon={FiUsers}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.flags')}
                                value={configuredFlagCount}
                                icon={FiFlag}
                            />
                            <DashboardMetricCard
                                label={t('company.platformTenant.metrics.crm')}
                                value={
                                    company.crmTenantSlug ||
                                    company.crmTenantId ||
                                    t('company.platformTenant.notLinked')
                                }
                                icon={FiLink}
                            />
                        </div>
                        <DashboardInsetPanel title={t('company.platformTenant.snapshot.title')}>
                            <div className="grid gap-3 text-sm text-edubot-muted dark:text-slate-400 md:grid-cols-2">
                                <p>{t('company.platformTenant.snapshot.name')}: {company.name}</p>
                                <p>
                                    {t('company.platformTenant.snapshot.locale')}:{' '}
                                    {getLocaleLabel(company.locale)}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.timezone')}:{' '}
                                    {company.timezone || 'Asia/Bishkek'}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.billing')}:{' '}
                                    {company.billingStatus || t('company.detail.notSet')}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.subdomain')}:{' '}
                                    {company.subdomain || t('company.detail.notSet')}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.customDomain')}:{' '}
                                    {company.customDomain || t('company.detail.notSet')}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.crmTenantId')}:{' '}
                                    {company.crmTenantId || t('company.detail.notSet')}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.crmPrimaryDomain')}:{' '}
                                    {company.crmPrimaryDomain || t('company.detail.notSet')}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.domain')}:{' '}
                                    {tenantDomain(company, t)}
                                </p>
                                <p>
                                    {t('company.platformTenant.snapshot.ownerAdminRows')}:{' '}
                                    {ownerCount + adminCount}
                                </p>
                            </div>
                        </DashboardInsetPanel>
                        <DashboardInsetPanel
                            title={t('company.platformTenant.lifecycle.title')}
                            description={t('company.platformTenant.lifecycle.description')}
                        >
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <span className="rounded-full border border-edubot-line px-3 py-1 text-sm font-semibold text-edubot-ink dark:border-slate-700 dark:text-white">
                                    {t('company.platformTenant.lifecycle.current', {
                                        status: companyStatusLabel(company.status, t),
                                    })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => confirmStatusPatch('active')}
                                    disabled={
                                        savingSection || (company.status || 'active') === 'active'
                                    }
                                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t('company.platformTenant.lifecycle.activate')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => confirmStatusPatch('suspended')}
                                    disabled={savingSection || company.status === 'suspended'}
                                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t('company.platformTenant.lifecycle.suspend')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => confirmStatusPatch('archived')}
                                    disabled={savingSection || company.status === 'archived'}
                                    className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t('company.platformTenant.lifecycle.archive')}
                                </button>
                            </div>
                        </DashboardInsetPanel>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.profile')}>
                        {editSection === 'profile' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t('company.fields.logo')}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-4">
                                        {form.logoUrl ? (
                                            <img
                                                src={form.logoUrl}
                                                alt={t('company.platformTenant.logoAlt', {
                                                    name: form.name || t('company.platformTenant.tenant'),
                                                })}
                                                className="h-16 w-32 rounded-lg border border-edubot-line object-contain p-2 dark:border-slate-700"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed border-edubot-line text-xs text-edubot-muted dark:border-slate-700">
                                                {t('company.settings.noLogo')}
                                            </div>
                                        )}
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={uploadLogo}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            disabled={uploadingLogo}
                                            className="dashboard-button-secondary"
                                        >
                                            <FiUpload className="h-4 w-4" />
                                            {uploadingLogo
                                                ? t('company.platformTenant.uploadingLogo')
                                                : t('company.settings.uploadLogoFile')}
                                        </button>
                                    </div>
                                </div>
                                <Field
                                    label={t('company.fields.name')}
                                    value={form.name}
                                    onChange={(value) => updateField('name', value)}
                                />
                                <Field
                                    label={t('company.fields.website')}
                                    value={form.website}
                                    onChange={(value) => updateField('website', value)}
                                />
                                <Field
                                    label={t('company.fields.email')}
                                    value={form.email}
                                    onChange={(value) => updateField('email', value)}
                                />
                                <Field
                                    label={t('company.fields.phone')}
                                    value={form.phone}
                                    onChange={(value) => updateField('phone', value)}
                                />
                                <Field
                                    label={t('company.fields.contactName')}
                                    value={form.contactName}
                                    onChange={(value) => updateField('contactName', value)}
                                />
                                <Field
                                    label={t('company.fields.contactEmail')}
                                    value={form.contactEmail}
                                    onChange={(value) => updateField('contactEmail', value)}
                                />
                                <Field
                                    label={t('company.fields.contactPhone')}
                                    value={form.contactPhone}
                                    onChange={(value) => updateField('contactPhone', value)}
                                />
                                <Field
                                    label={t('company.fields.taxId')}
                                    value={form.taxId}
                                    onChange={(value) => updateField('taxId', value)}
                                />
                                <Field
                                    label={t('company.fields.address')}
                                    value={form.address}
                                    onChange={(value) => updateField('address', value)}
                                />
                                <Field
                                    label={t('company.fields.city')}
                                    value={form.city}
                                    onChange={(value) => updateField('city', value)}
                                />
                                <Field
                                    label={t('company.fields.country')}
                                    value={form.country}
                                    onChange={(value) => updateField('country', value)}
                                />
                                <Field
                                    label={t('company.fields.telegram')}
                                    value={form.telegram}
                                    onChange={(value) => updateField('telegram', value)}
                                />
                                <Field
                                    label={t('company.fields.whatsapp')}
                                    value={form.whatsapp}
                                    onChange={(value) => updateField('whatsapp', value)}
                                />
                                <Field
                                    label={t('company.fields.instagram')}
                                    value={form.instagram}
                                    onChange={(value) => updateField('instagram', value)}
                                />
                                <TextareaField
                                    label={t('company.fields.notes')}
                                    value={form.notes}
                                    onChange={(value) => updateField('notes', value)}
                                />
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t('company.fields.logo')}
                                    </p>
                                    {company.logoUrl ? (
                                        <img
                                            src={company.logoUrl}
                                            alt={t('company.platformTenant.logoAlt', {
                                                name: company.name || t('company.platformTenant.tenant'),
                                            })}
                                            className="mt-3 h-16 w-32 rounded-lg border border-edubot-line object-contain p-2 dark:border-slate-700"
                                        />
                                    ) : (
                                        <p className="mt-2 text-sm font-medium text-edubot-ink dark:text-white">
                                            {t('company.detail.notSet')}
                                        </p>
                                    )}
                                </div>
                                <ReadField label={t('company.fields.name')} value={company.name} />
                                <ReadField
                                    label={t('company.fields.website')}
                                    value={company.website}
                                />
                                <ReadField label={t('company.fields.email')} value={company.email} />
                                <ReadField label={t('company.fields.phone')} value={company.phone} />
                                <ReadField
                                    label={t('company.fields.contactName')}
                                    value={company.contactName}
                                />
                                <ReadField
                                    label={t('company.fields.contactEmail')}
                                    value={company.contactEmail}
                                />
                                <ReadField
                                    label={t('company.fields.contactPhone')}
                                    value={company.contactPhone}
                                />
                                <ReadField label={t('company.fields.taxId')} value={company.taxId} />
                                <ReadField
                                    label={t('company.fields.address')}
                                    value={company.address}
                                />
                                <ReadField label={t('company.fields.city')} value={company.city} />
                                <ReadField
                                    label={t('company.fields.country')}
                                    value={company.country}
                                />
                                <ReadField
                                    label={t('company.fields.telegram')}
                                    value={company.telegram}
                                />
                                <ReadField
                                    label={t('company.fields.whatsapp')}
                                    value={company.whatsapp}
                                />
                                <ReadField
                                    label={t('company.fields.instagram')}
                                    value={company.instagram}
                                />
                                <ReadField label={t('company.fields.notes')} value={company.notes} />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'profile'}
                            onEdit={() => setEditSection('profile')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    name: form.name,
                                    website: form.website,
                                    email: form.email,
                                    phone: form.phone,
                                    contactName: form.contactName,
                                    contactEmail: form.contactEmail,
                                    contactPhone: form.contactPhone,
                                    address: form.address,
                                    city: form.city,
                                    country: form.country,
                                    telegram: form.telegram,
                                    whatsapp: form.whatsapp,
                                    instagram: form.instagram,
                                    taxId: form.taxId,
                                    notes: form.notes,
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'domain' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.domain')}>
                        {editSection === 'domain' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <Field
                                    label={t('company.platformTenant.fields.subdomain')}
                                    value={form.subdomain}
                                    onChange={(value) =>
                                        updateField('subdomain', value.toLowerCase())
                                    }
                                />
                                <Field
                                    label={t('company.platformTenant.fields.customDomain')}
                                    value={form.customDomain}
                                    onChange={(value) =>
                                        updateField('customDomain', value.toLowerCase())
                                    }
                                />
                                <Field
                                    label={t('company.platformTenant.fields.timezone')}
                                    value={form.timezone}
                                    onChange={(value) => updateField('timezone', value)}
                                />
                                <SelectField
                                    label={t('company.platformTenant.fields.locale')}
                                    value={normalizeLocale(form.locale)}
                                    onChange={(value) => updateField('locale', value)}
                                >
                                    {LOCALE_OPTIONS.map((locale) => (
                                        <option key={locale.value} value={locale.value}>
                                            {locale.nativeLabel} ({locale.value})
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <ReadField
                                    label={t('company.platformTenant.fields.subdomain')}
                                    value={company.subdomain}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.customDomain')}
                                    value={company.customDomain}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.effectiveDomain')}
                                    value={tenantDomain(company, t)}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.timezone')}
                                    value={company.timezone || 'Asia/Bishkek'}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.locale')}
                                    value={getLocaleLabel(company.locale)}
                                />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'domain'}
                            onEdit={() => setEditSection('domain')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    subdomain: form.subdomain,
                                    customDomain: form.customDomain,
                                    timezone: form.timezone,
                                    locale: form.locale,
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'billing' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.billing')}>
                        {editSection === 'billing' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <SelectField
                                    label={t('company.platformTenant.fields.status')}
                                    value={form.status}
                                    onChange={(value) => updateField('status', value)}
                                >
                                    {COMPANY_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {companyStatusLabel(status, t)}
                                        </option>
                                    ))}
                                </SelectField>
                                <Field
                                    label={t('company.platformTenant.fields.plan')}
                                    value={form.plan}
                                    onChange={(value) => updateField('plan', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.fields.billingStatus')}
                                    value={form.billingStatus}
                                    onChange={(value) => updateField('billingStatus', value)}
                                />
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <ReadField
                                    label={t('company.platformTenant.fields.status')}
                                    value={companyStatusLabel(company.status, t)}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.plan')}
                                    value={company.plan}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.billingStatus')}
                                    value={company.billingStatus}
                                />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'billing'}
                            onEdit={() => setEditSection('billing')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    status: form.status,
                                    plan: form.plan,
                                    billingStatus: form.billingStatus,
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'crm' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.crm')}>
                        {editSection === 'crm' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <Field
                                    label={t('company.platformTenant.fields.crmTenantId')}
                                    value={form.crmTenantId}
                                    onChange={(value) => updateField('crmTenantId', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.fields.crmSlug')}
                                    value={form.crmTenantSlug}
                                    onChange={(value) => updateField('crmTenantSlug', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.fields.crmPrimaryDomain')}
                                    value={form.crmPrimaryDomain}
                                    onChange={(value) =>
                                        updateField('crmPrimaryDomain', value.toLowerCase())
                                    }
                                />
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <ReadField
                                    label={t('company.platformTenant.fields.crmTenantId')}
                                    value={company.crmTenantId}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.crmSlug')}
                                    value={company.crmTenantSlug}
                                />
                                <ReadField
                                    label={t('company.platformTenant.fields.crmPrimaryDomain')}
                                    value={company.crmPrimaryDomain}
                                />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'crm'}
                            onEdit={() => setEditSection('crm')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    crmTenantId: form.crmTenantId,
                                    crmTenantSlug: form.crmTenantSlug,
                                    crmPrimaryDomain: form.crmPrimaryDomain,
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'members' && (
                    <CompanyMembers
                        companyId={tenantId}
                        currentUser={user}
                        title={t('company.members.platformTitle')}
                        description={t('company.members.platformDescription')}
                        allowedRoles={['owner', 'company_admin']}
                    />
                )}

                {activeTab === 'courses' && (
                    <DashboardInsetPanel
                        title={t('company.courses.platform.title')}
                        description={t('company.courses.platform.description')}
                    >
                        <div className="mt-4 space-y-5">
                            <div className="grid gap-3 lg:grid-cols-2">
                                <label className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t('company.courses.platform.searchTenantCourses')}
                                    </span>
                                    <input
                                        value={courseSearch}
                                        onChange={(event) => setCourseSearch(event.target.value)}
                                        className="dashboard-field w-full"
                                        placeholder={t('company.courses.filterPlaceholder')}
                                    />
                                </label>
                                <label className="relative space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                        {t('company.courses.attach')}
                                    </span>
                                    <input
                                        value={attachSearch}
                                        onChange={(event) => setAttachSearch(event.target.value)}
                                        className="dashboard-field w-full"
                                        placeholder={t('company.courses.platform.attachPlaceholder')}
                                    />
                                    {(attachOptions.length > 0 ||
                                        attachLoading ||
                                        attachSearch.trim()) && (
                                        <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900">
                                            {attachLoading ? (
                                                <div className="px-3 py-2 text-sm text-edubot-muted">
                                                    {t('common.searching')}
                                                </div>
                                            ) : attachOptions.length ? (
                                                attachOptions.map((course) => {
                                                    const courseTypeDisabled =
                                                        !isCourseTypeAllowedForTenant(
                                                            company,
                                                            course.courseType
                                                        );
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={course.id}
                                                            onClick={() => attachCourse(course.id)}
                                                            disabled={
                                                                attachingCourseId === course.id ||
                                                                courseTypeDisabled
                                                            }
                                                            title={
                                                                courseTypeDisabled
                                                                    ? disabledCourseTypeMessage(
                                                                          course.courseType,
                                                                          t
                                                                      )
                                                                    : undefined
                                                            }
                                                            className="block w-full px-3 py-2 text-left hover:bg-edubot-surfaceAlt/70 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800"
                                                        >
                                                            <span className="block truncate text-sm font-medium text-edubot-ink dark:text-white">
                                                                {attachingCourseId === course.id
                                                                    ? t(
                                                                          'company.courses.platform.attaching'
                                                                      )
                                                                    : courseFallbackTitle(
                                                                          course,
                                                                          t
                                                                      )}
                                                            </span>
                                                            <span className="block truncate text-xs text-edubot-muted dark:text-slate-400">
                                                                {course.instructor?.fullName ||
                                                                    course.instructor?.email ||
                                                                    t(
                                                                        'company.courses.platform.noInstructor'
                                                                    )}{' '}
                                                                · {getCourseTypeLabel(
                                                                    course.courseType,
                                                                    t
                                                                )}
                                                                {courseTypeDisabled
                                                                    ? ` · ${t(
                                                                          'company.courses.platform.disabledByFeatureFlags'
                                                                      )}`
                                                                    : ''}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-edubot-muted">
                                                    {t('company.courses.platform.noMatchingCourses')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                                <table className="min-w-[44rem] w-full text-left text-sm">
                                    <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('company.courses.table.course')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('company.courses.table.instructor')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('company.courses.table.type')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('company.courses.table.status')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('company.courses.table.actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                        {tenantCoursesLoading ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-4 py-6 text-center text-edubot-muted"
                                                >
                                                    {t('company.courses.platform.loadingCourses')}
                                                </td>
                                            </tr>
                                        ) : tenantCourses.length ? (
                                            tenantCourses.map((course) => (
                                                <tr
                                                    key={course.id}
                                                    className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-edubot-ink dark:text-white">
                                                            {courseFallbackTitle(course, t)}
                                                        </div>
                                                        <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                            #{course.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                        {course.instructor?.fullName ||
                                                            course.instructor?.email ||
                                                            t('company.detail.notSet')}
                                                    </td>
                                                    <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                        {getCourseTypeLabel(course.courseType, t)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full border border-edubot-line px-2.5 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:text-white">
                                                            {courseStatusLabel(course, t)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => detachCourse(course.id)}
                                                            disabled={confirmationLoading}
                                                            className="dashboard-button-secondary text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {t('company.courses.platform.remove')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-4 py-6 text-center text-edubot-muted"
                                                >
                                                    {t('company.courses.platform.empty')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </DashboardInsetPanel>
                )}

                {activeTab === 'branding' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.branding')}>
                        {editSection === 'branding' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <Field
                                    label={t('company.platformTenant.branding.displayName')}
                                    value={brandingForm.displayName}
                                    onChange={(value) => updateBranding('displayName', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.branding.certificateLogoUrl')}
                                    value={brandingForm.certificateLogoUrl}
                                    onChange={(value) =>
                                        updateBranding('certificateLogoUrl', value)
                                    }
                                />
                                <Field
                                    label={t('company.platformTenant.branding.primaryColor')}
                                    type="color"
                                    value={brandingForm.primaryColor}
                                    onChange={(value) => updateBranding('primaryColor', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.branding.secondaryColor')}
                                    type="color"
                                    value={brandingForm.secondaryColor}
                                    onChange={(value) => updateBranding('secondaryColor', value)}
                                />
                                <Field
                                    label={t('company.platformTenant.branding.accentColor')}
                                    type="color"
                                    value={brandingForm.accentColor || '#111827'}
                                    onChange={(value) => updateBranding('accentColor', value)}
                                />
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <ReadField
                                    label={t('company.platformTenant.branding.displayName')}
                                    value={company.branding?.displayName}
                                />
                                <ReadField
                                    label={t('company.platformTenant.branding.certificateLogoUrl')}
                                    value={company.branding?.certificateLogoUrl}
                                />
                                <ReadField
                                    label={t('company.platformTenant.branding.primaryColor')}
                                    value={company.branding?.primaryColor}
                                />
                                <ReadField
                                    label={t('company.platformTenant.branding.secondaryColor')}
                                    value={company.branding?.secondaryColor}
                                />
                                <ReadField
                                    label={t('company.platformTenant.branding.accentColor')}
                                    value={company.branding?.accentColor}
                                />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'branding'}
                            onEdit={() => setEditSection('branding')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    branding: {
                                        ...(company.branding || {}),
                                        ...cleanPayload(brandingForm),
                                    },
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'settings' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.settings')}>
                        {editSection === 'settings' ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <Field
                                    label={t('company.platformTenant.settings.supportEmail')}
                                    value={settingsForm.supportEmail}
                                    onChange={(value) => updateSettings('supportEmail', value)}
                                />
                                <SelectField
                                    label={t('company.platformTenant.settings.defaultCourseVisibility')}
                                    value={settingsForm.defaultCourseVisibility}
                                    onChange={(value) =>
                                        updateSettings('defaultCourseVisibility', value)
                                    }
                                >
                                    {COURSE_VISIBILITY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {courseVisibilityLabel(option, t)}
                                        </option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    label={t('company.platformTenant.settings.allowSelfEnrollment')}
                                    value={String(settingsForm.allowSelfEnrollment)}
                                    onChange={(value) =>
                                        updateSettings('allowSelfEnrollment', value === 'true')
                                    }
                                >
                                    <option value="true">{t('company.platformTenant.values.enabled')}</option>
                                    <option value="false">{t('company.platformTenant.values.disabled')}</option>
                                </SelectField>
                                <SelectField
                                    label={t('company.platformTenant.settings.requireEnrollmentApproval')}
                                    value={String(settingsForm.requireEnrollmentApproval)}
                                    onChange={(value) =>
                                        updateSettings(
                                            'requireEnrollmentApproval',
                                            value === 'true'
                                        )
                                    }
                                >
                                    <option value="true">{t('company.platformTenant.values.enabled')}</option>
                                    <option value="false">{t('company.platformTenant.values.disabled')}</option>
                                </SelectField>
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <ReadField
                                    label={t('company.platformTenant.settings.supportEmail')}
                                    value={company.settings?.supportEmail}
                                />
                                <ReadField
                                    label={t('company.platformTenant.settings.defaultCourseVisibility')}
                                    value={courseVisibilityLabel(
                                        company.settings?.defaultCourseVisibility,
                                        t
                                    )}
                                />
                                <ReadField
                                    label={t('company.platformTenant.settings.allowSelfEnrollment')}
                                    value={company.settings?.allowSelfEnrollment}
                                />
                                <ReadField
                                    label={t('company.platformTenant.settings.requireEnrollmentApproval')}
                                    value={company.settings?.requireEnrollmentApproval}
                                />
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'settings'}
                            onEdit={() => setEditSection('settings')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    settings: {
                                        ...(company.settings || {}),
                                        ...cleanPayload(settingsForm),
                                    },
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'flags' && (
                    <DashboardInsetPanel title={t('company.platformTenant.tabs.flags')}>
                        {editSection === 'flags' ? (
                            <div className="mt-4 space-y-5">
                                <div className="grid gap-3 md:grid-cols-2">
                                    {featureFlagRows
                                        .filter((row) => row.predefined)
                                        .map((row) => {
                                            const index = featureFlagRows.findIndex(
                                                (candidate) => candidate.key === row.key
                                            );
                                            return (
                                                <div
                                                    key={row.key}
                                                    className="flex items-start justify-between gap-4 rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-edubot-ink dark:text-white">
                                                            {t(row.labelKey)}
                                                        </p>
                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                            {t(row.descriptionKey)}
                                                        </p>
                                                        <p className="mt-2 text-xs text-edubot-muted dark:text-slate-500">
                                                            {row.key}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                                        <SwitchControl
                                                            checked={row.value}
                                                            label={t(row.labelKey)}
                                                            onChange={(value) =>
                                                                updateFeatureFlagRow(index, {
                                                                    value,
                                                                })
                                                            }
                                                        />
                                                        <span className="text-xs font-semibold text-edubot-muted dark:text-slate-400">
                                                            {row.value
                                                                ? t('company.platformTenant.values.enabled')
                                                                : t('company.platformTenant.values.disabled')}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-edubot-ink dark:text-white">
                                            {t('company.platformTenant.featureFlags.customFlags')}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addCustomFeatureFlagRow}
                                            className="dashboard-button-secondary"
                                        >
                                            {t('company.platformTenant.featureFlags.addCustomFlag')}
                                        </button>
                                    </div>
                                    {customFeatureFlagRows(featureFlagRows).length ? (
                                        featureFlagRows.map((row, index) =>
                                            row.predefined ? null : (
                                                <div
                                                    key={`${row.key}-${index}`}
                                                    className="grid gap-3 rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:grid-cols-[1fr_180px_auto]"
                                                >
                                                    <Field
                                                        label={t('company.platformTenant.featureFlags.flagKey')}
                                                        value={row.key}
                                                        onChange={(value) =>
                                                            updateFeatureFlagRow(index, {
                                                                key: value,
                                                            })
                                                        }
                                                        // l10n-audit-ignore: feature flag key example
                                                        placeholder={'custom.feature.enabled'}
                                                    />
                                                    <div className="self-end">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                            {t('company.platformTenant.featureFlags.value')}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <SwitchControl
                                                                checked={row.value}
                                                                label={
                                                                    row.key ||
                                                                    t(
                                                                        'company.platformTenant.featureFlags.customFeatureFlag'
                                                                    )
                                                                }
                                                                onChange={(value) =>
                                                                    updateFeatureFlagRow(index, {
                                                                        value,
                                                                    })
                                                                }
                                                            />
                                                            <span className="text-xs font-semibold text-edubot-muted dark:text-slate-400">
                                                                {row.value
                                                                    ? t('company.platformTenant.values.enabled')
                                                                    : t('company.platformTenant.values.disabled')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeatureFlagRow(index)}
                                                        className="dashboard-button-secondary self-end"
                                                        aria-label={t(
                                                            'company.platformTenant.featureFlags.removeFeatureFlag'
                                                        )}
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                            {t('company.platformTenant.featureFlags.noCustomFlags')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {FEATURE_FLAG_DEFINITIONS.map((flag) => (
                                    <ReadField
                                        key={flag.key}
                                        label={t(flag.labelKey)}
                                        value={company.featureFlags?.[flag.key] !== false}
                                    />
                                ))}
                                {Object.entries(company.featureFlags || {})
                                    .filter(([key]) => !PREDEFINED_FEATURE_FLAG_KEYS.has(key))
                                    .map(([key, value]) => (
                                        <ReadField key={key} label={key} value={Boolean(value)} />
                                    ))}
                            </div>
                        )}
                        <SectionActions
                            isEditing={editSection === 'flags'}
                            onEdit={() => setEditSection('flags')}
                            onCancel={cancelEdit}
                            loading={savingSection}
                            onSave={() =>
                                savePatch({
                                    featureFlags: buildFeatureFlagsPayload(featureFlagRows),
                                })
                            }
                        />
                    </DashboardInsetPanel>
                )}

                {activeTab === 'activity' && (
                    <DashboardInsetPanel
                        title={t('company.platformTenant.tabs.activity')}
                        description={t('company.platformTenant.activity.description')}
                    >
                        <div className="mt-4 overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                            <table className="min-w-[48rem] w-full text-left text-sm">
                                <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">
                                            {t('company.platformTenant.activity.table.action')}
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            {t('company.platformTenant.activity.table.details')}
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            {t('company.platformTenant.activity.table.actor')}
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            {t('company.platformTenant.activity.table.time')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                    {activityLoading ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-4 py-6 text-center text-edubot-muted"
                                            >
                                                {t('company.platformTenant.activity.loading')}
                                            </td>
                                        </tr>
                                    ) : activityItems.length ? (
                                        activityItems.map((activity) => (
                                            <tr
                                                key={activity.id}
                                                className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-edubot-ink dark:text-white">
                                                        {ACTIVITY_LABELS[activity.action]
                                                            ? t(ACTIVITY_LABELS[activity.action])
                                                            : activity.action}
                                                    </div>
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        {activity.action}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {formatActivitySummary(activity, t)}
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {activity.actorFullName ||
                                                        activity.actorEmail ||
                                                        (activity.actorUserId
                                                            ? t(
                                                                  'company.platformTenant.activity.userNumber',
                                                                  { id: activity.actorUserId }
                                                              )
                                                            : t(
                                                                  'company.platformTenant.activity.system'
                                                              ))}
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {activity.createdAt
                                                        ? new Date(
                                                              activity.createdAt
                                                          ).toLocaleString()
                                                        : t('company.detail.notSet')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-4 py-6 text-center text-edubot-muted"
                                            >
                                                {t('company.platformTenant.activity.empty')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DashboardInsetPanel>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={() => {
                    if (!confirmationLoading) setConfirmation(null);
                }}
                onConfirm={confirmation?.onConfirm || (() => {})}
                title={confirmation?.title || t('company.platformTenant.confirmAction')}
                message={confirmation?.message || ''}
                confirmLabel={confirmation?.confirmLabel || t('company.platformTenant.confirm')}
                confirmVariant={confirmation?.confirmVariant || 'danger'}
                loading={confirmationLoading}
            />
        </DashboardLayout>
    );
}
