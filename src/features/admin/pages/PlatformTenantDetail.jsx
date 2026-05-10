/* eslint-disable react/prop-types */
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
    uploadCompanyLogo,
} from '@services/api';
import CompanyMembers from '../../../pages/company/CompanyMembers';
import Loader from '@shared/ui/Loader';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import {
    getCourseTypeTenantDisabledMessage,
    isCourseTypeAllowedForTenant,
} from '@shared/utils/tenantFeatures';

const TABS = [
    { id: 'overview', label: 'Overview', icon: FiBriefcase, category: 'primary', priority: 1 },
    { id: 'profile', label: 'Profile', icon: FiSettings, category: 'primary', priority: 2 },
    { id: 'domain', label: 'Domain', icon: FiGlobe, category: 'primary', priority: 3 },
    { id: 'billing', label: 'Plan/Billing', icon: FiCreditCard, category: 'secondary', priority: 1 },
    { id: 'crm', label: 'CRM Link', icon: FiLink, category: 'secondary', priority: 2 },
    { id: 'members', label: 'Owners & Admins', icon: FiUsers, category: 'secondary', priority: 3 },
    { id: 'courses', label: 'Courses', icon: FiBookOpen, category: 'secondary', priority: 4 },
    { id: 'branding', label: 'Branding', icon: FiImage, category: 'secondary', priority: 5 },
    { id: 'settings', label: 'Settings', icon: FiSliders, category: 'secondary', priority: 6 },
    { id: 'flags', label: 'Feature Flags', icon: FiFlag, category: 'secondary', priority: 7 },
    { id: 'activity', label: 'Activity', icon: FiClock, category: 'secondary', priority: 8 },
];

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
        key: 'courses.offline.enabled',
        label: 'Offline courses',
        description: 'Allow this tenant to run in-person course delivery.',
    },
    {
        key: 'courses.onlineLive.enabled',
        label: 'Online live courses',
        description: 'Allow this tenant to run scheduled live online delivery.',
    },
    {
        key: 'certificates.enabled',
        label: 'Certificates',
        description: 'Enable certificate issuing and certificate configuration.',
    },
    {
        key: 'attendance.enabled',
        label: 'Attendance',
        description: 'Enable attendance workflows for live or offline sessions.',
    },
    {
        key: 'homework.enabled',
        label: 'Homework',
        description: 'Enable homework and submission workflows.',
    },
    {
        key: 'crmSync.enabled',
        label: 'CRM sync',
        description: 'Enable LMS tenant sync with a linked CRM tenant.',
    },
    {
        key: 'aiAssistant.enabled',
        label: 'AI assistant',
        description: 'Enable AI chat and course assistant capabilities.',
    },
];
const PREDEFINED_FEATURE_FLAG_KEYS = new Set(FEATURE_FLAG_DEFINITIONS.map((flag) => flag.key));

const cleanPayload = (payload = {}) => Object.fromEntries(
    Object.entries(payload)
        .filter(([, value]) => {
            if (typeof value === 'string') return value.trim() !== '';
            return value !== undefined && value !== null;
        })
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
);

const tenantDomain = (company) => {
    if (company?.customDomain) return company.customDomain;
    if (company?.subdomain) return `${company.subdomain}.edubot.it.com`;
    return 'Not configured';
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
    locale: company?.locale ?? 'ky',
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

const buildFeatureFlagsPayload = (rows) => rows.reduce((acc, row) => {
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

const courseStatusLabel = (course) => {
    if (course?.status) return course.status;
    if (course?.isPublished || course?.published) return 'published';
    if (course?.approved) return 'approved';
    return 'draft';
};

const ACTIVITY_LABELS = {
    'tenant.created': 'Tenant created',
    'tenant.updated': 'Tenant updated',
    'tenant.logo_updated': 'Logo updated',
    'member.role_added': 'Role added',
    'member.role_removed': 'Role removed',
    'member.removed': 'Member removed',
    'member.role_set': 'Role changed',
    'course.attached': 'Course attached',
    'course.removed': 'Course removed',
};

const formatActivitySummary = (activity) => {
    const metadata = activity?.metadata || {};
    if (metadata.courseTitle) return metadata.courseTitle;
    if (metadata.role) return `Role: ${metadata.role}`;
    if (metadata.userId) return `User #${metadata.userId}`;
    if (metadata.changes) return Object.keys(metadata.changes).join(', ');
    return activity?.targetId ? `${activity.targetType || 'target'} #${activity.targetId}` : 'No details';
};

const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return 'Not set';
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
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
        <select value={value} onChange={(e) => onChange(e.target.value)} className="dashboard-select w-full">
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

const ReadField = ({ label, value }) => (
    <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
            {label}
        </p>
        <p className="mt-2 break-words text-sm font-medium text-edubot-ink dark:text-white">
            {displayValue(value)}
        </p>
    </div>
);

const SaveButton = ({ onClick, loading = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
        <FiSave className="h-4 w-4" />
        {loading ? 'Saving...' : 'Save'}
    </button>
);

const SectionActions = ({ isEditing, onEdit, onCancel, onSave, loading = false }) => (
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
                    Cancel
                </button>
            </>
        ) : (
            <button type="button" onClick={onEdit} className="dashboard-button-secondary">
                Edit
            </button>
        )}
    </div>
);

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
        } catch {
            toast.error('Tenant жүктөлгөн жок');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

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
        } catch {
            toast.error('Tenant курстары жүктөлгөн жок');
        } finally {
            setTenantCoursesLoading(false);
        }
    }, [courseSearch, tenantId]);

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
        } catch {
            toast.error('Tenant activity жүктөлгөн жок');
        } finally {
            setActivityLoading(false);
        }
    }, [tenantId]);

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
            const updated = await updateCompany(tenantId, cleanPayload(patch));
            const nextCompany = { ...company, ...updated };
            setCompany((prev) => ({ ...prev, ...updated }));
            setForm(buildForm(nextCompany));
            setBrandingForm(buildBrandingForm(nextCompany.branding));
            setSettingsForm(buildSettingsForm(nextCompany.settings));
            setFeatureFlagRows(buildFeatureFlagRows(nextCompany.featureFlags));
            setEditSection(null);
            toast.success('Tenant жаңыртылды');
        } catch {
            toast.error('Tenant жаңыртууда ката кетти');
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
            if (!logoUrl) throw new Error('Missing logo URL');
            setCompany((prev) => ({ ...prev, logoUrl }));
            setForm((prev) => ({ ...prev, logoUrl }));
            toast.success('Logo uploaded');
        } catch {
            toast.error('Logo upload failed');
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
        setFeatureFlagRows((prev) => prev.map((row, rowIndex) => (
            rowIndex === index ? { ...row, ...patch } : row
        )));
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
            title: 'Change tenant status',
            message: `Change tenant status to ${status}?`,
            confirmLabel: 'Change status',
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
            toast.error(getCourseTypeTenantDisabledMessage(course.courseType));
            return;
        }

        try {
            setAttachingCourseId(courseId);
            await assignCourseToCompany(courseId, tenantId);
            toast.success('Course attached');
            setAttachSearch('');
            setAttachOptions([]);
            await loadTenantCourses();
        } catch {
            toast.error('Course attach failed');
        } finally {
            setAttachingCourseId(null);
        }
    };

    const detachCourse = async (courseId) => {
        setConfirmation({
            title: 'Remove course',
            message: 'Remove this course from the tenant?',
            confirmLabel: 'Remove',
            confirmVariant: 'danger',
            onConfirm: async () => {
                setConfirmationLoading(true);
                try {
                    await unassignCourseFromCompany(courseId, tenantId);
                    toast.success('Course removed');
                    await loadTenantCourses();
                    setConfirmation(null);
                } catch {
                    toast.error('Course removal failed');
                } finally {
                    setConfirmationLoading(false);
                }
            },
        });
    };

    const adminUser = {
        fullName: user?.fullName || 'Админ',
        email: user?.email || 'admin@edubot.kg',
    };

    const dashboardNavItems = TABS.map((item) => ({
        ...item,
        isActive: item.id === activeTab,
        onSelect: (id) => setActiveTab(id),
    }));

    const headerContent = (
        <DashboardHeader
            user={adminUser}
            role="admin"
            subtitle="Платформа tenant профилин, доменин, планын жана байланыштарын башкарыңыз."
            actions={[
                {
                    label: sidebarOpen ? 'Менюну жашыруу' : 'Менюну көрсөтүү',
                    onClick: () => setSidebarOpen((prev) => !prev),
                    variant: 'secondary',
                },
                {
                    label: 'Tenant registry',
                    to: '/admin?tab=companies',
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
                <EmptyState title="Tenant not found" subtitle="Return to the platform tenant registry." />
            </DashboardLayout>
        );
    }

    const ownerCount = tenantMembers.filter((member) => member.role === 'owner').length;
    const adminCount = tenantMembers.filter((member) => ['admin', 'company_admin'].includes(member.role)).length;
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
                    eyebrow="Platform tenant"
                    title={company.name}
                    description={`${company.status || 'active'} · ${tenantDomain(company)}`}
                />
                <Link to="/admin?tab=companies" className="dashboard-button-secondary self-start">
                    <FiArrowLeft className="h-4 w-4" />
                    Tenants
                </Link>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <DashboardMetricCard label="Status" value={company.status || 'active'} icon={FiBriefcase} />
                        <DashboardMetricCard label="Plan" value={company.plan || 'Not set'} icon={FiCreditCard} />
                        <DashboardMetricCard label="Owners" value={ownerCount} icon={FiUsers} tone={ownerCount ? 'green' : 'amber'} />
                        <DashboardMetricCard label="Admins" value={adminCount} icon={FiUsers} tone={adminCount ? 'blue' : 'amber'} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <DashboardMetricCard label="Courses" value={tenantCourses.length} icon={FiBookOpen} />
                        <DashboardMetricCard label="Students" value={studentCount} icon={FiUsers} />
                        <DashboardMetricCard label="Flags" value={configuredFlagCount} icon={FiFlag} />
                        <DashboardMetricCard label="CRM" value={company.crmTenantSlug || company.crmTenantId || 'Not linked'} icon={FiLink} />
                    </div>
                    <DashboardInsetPanel title="Tenant Snapshot">
                        <div className="grid gap-3 text-sm text-edubot-muted dark:text-slate-400 md:grid-cols-2">
                            <p>Name: {company.name}</p>
                            <p>Locale: {company.locale || 'ky'}</p>
                            <p>Timezone: {company.timezone || 'Asia/Bishkek'}</p>
                            <p>Billing: {company.billingStatus || 'Not set'}</p>
                            <p>Subdomain: {company.subdomain || 'Not set'}</p>
                            <p>Custom domain: {company.customDomain || 'Not set'}</p>
                            <p>CRM tenant ID: {company.crmTenantId || 'Not set'}</p>
                            <p>CRM primary domain: {company.crmPrimaryDomain || 'Not set'}</p>
                            <p>Domain: {tenantDomain(company)}</p>
                            <p>Owner/admin rows: {ownerCount + adminCount}</p>
                        </div>
                    </DashboardInsetPanel>
                    <DashboardInsetPanel
                        title="Lifecycle"
                        description="Use status changes for tenant access control before considering destructive cleanup."
                    >
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-edubot-line px-3 py-1 text-sm font-semibold text-edubot-ink dark:border-slate-700 dark:text-white">
                                Current: {company.status || 'active'}
                            </span>
                            <button
                                type="button"
                                onClick={() => confirmStatusPatch('active')}
                                disabled={savingSection || (company.status || 'active') === 'active'}
                                className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Activate
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmStatusPatch('suspended')}
                                disabled={savingSection || company.status === 'suspended'}
                                className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Suspend
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmStatusPatch('archived')}
                                disabled={savingSection || company.status === 'archived'}
                                className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Archive
                            </button>
                        </div>
                    </DashboardInsetPanel>
                </div>
            )}

            {activeTab === 'profile' && (
                <DashboardInsetPanel title="Profile">
                    {editSection === 'profile' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                    Logo
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                    {form.logoUrl ? (
                                        <img
                                            src={form.logoUrl}
                                            alt={`${form.name || 'Tenant'} logo`}
                                            className="h-16 w-32 rounded-lg border border-edubot-line object-contain p-2 dark:border-slate-700"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed border-edubot-line text-xs text-edubot-muted dark:border-slate-700">
                                            No logo
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
                                        {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                                    </button>
                                </div>
                            </div>
                            <Field label="Name" value={form.name} onChange={(value) => updateField('name', value)} />
                            <Field label="Website" value={form.website} onChange={(value) => updateField('website', value)} />
                            <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} />
                            <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} />
                            <Field label="Contact name" value={form.contactName} onChange={(value) => updateField('contactName', value)} />
                            <Field label="Contact email" value={form.contactEmail} onChange={(value) => updateField('contactEmail', value)} />
                            <Field label="Contact phone" value={form.contactPhone} onChange={(value) => updateField('contactPhone', value)} />
                            <Field label="Tax ID" value={form.taxId} onChange={(value) => updateField('taxId', value)} />
                            <Field label="Address" value={form.address} onChange={(value) => updateField('address', value)} />
                            <Field label="City" value={form.city} onChange={(value) => updateField('city', value)} />
                            <Field label="Country" value={form.country} onChange={(value) => updateField('country', value)} />
                            <Field label="Telegram" value={form.telegram} onChange={(value) => updateField('telegram', value)} />
                            <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => updateField('whatsapp', value)} />
                            <Field label="Instagram" value={form.instagram} onChange={(value) => updateField('instagram', value)} />
                            <TextareaField label="Notes" value={form.notes} onChange={(value) => updateField('notes', value)} />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                    Logo
                                </p>
                                {company.logoUrl ? (
                                    <img
                                        src={company.logoUrl}
                                        alt={`${company.name || 'Tenant'} logo`}
                                        className="mt-3 h-16 w-32 rounded-lg border border-edubot-line object-contain p-2 dark:border-slate-700"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-medium text-edubot-ink dark:text-white">Not set</p>
                                )}
                            </div>
                            <ReadField label="Name" value={company.name} />
                            <ReadField label="Website" value={company.website} />
                            <ReadField label="Email" value={company.email} />
                            <ReadField label="Phone" value={company.phone} />
                            <ReadField label="Contact name" value={company.contactName} />
                            <ReadField label="Contact email" value={company.contactEmail} />
                            <ReadField label="Contact phone" value={company.contactPhone} />
                            <ReadField label="Tax ID" value={company.taxId} />
                            <ReadField label="Address" value={company.address} />
                            <ReadField label="City" value={company.city} />
                            <ReadField label="Country" value={company.country} />
                            <ReadField label="Telegram" value={company.telegram} />
                            <ReadField label="WhatsApp" value={company.whatsapp} />
                            <ReadField label="Instagram" value={company.instagram} />
                            <ReadField label="Notes" value={company.notes} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'profile'}
                        onEdit={() => setEditSection('profile')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
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
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'domain' && (
                <DashboardInsetPanel title="Domain">
                    {editSection === 'domain' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field label="Subdomain" value={form.subdomain} onChange={(value) => updateField('subdomain', value.toLowerCase())} />
                            <Field label="Custom domain" value={form.customDomain} onChange={(value) => updateField('customDomain', value.toLowerCase())} />
                            <Field label="Timezone" value={form.timezone} onChange={(value) => updateField('timezone', value)} />
                            <Field label="Locale" value={form.locale} onChange={(value) => updateField('locale', value)} />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <ReadField label="Subdomain" value={company.subdomain} />
                            <ReadField label="Custom domain" value={company.customDomain} />
                            <ReadField label="Effective domain" value={tenantDomain(company)} />
                            <ReadField label="Timezone" value={company.timezone || 'Asia/Bishkek'} />
                            <ReadField label="Locale" value={company.locale || 'ky'} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'domain'}
                        onEdit={() => setEditSection('domain')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
                            subdomain: form.subdomain,
                            customDomain: form.customDomain,
                            timezone: form.timezone,
                            locale: form.locale,
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'billing' && (
                <DashboardInsetPanel title="Plan/Billing">
                    {editSection === 'billing' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <SelectField label="Status" value={form.status} onChange={(value) => updateField('status', value)}>
                                {COMPANY_STATUSES.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </SelectField>
                            <Field label="Plan" value={form.plan} onChange={(value) => updateField('plan', value)} />
                            <Field label="Billing status" value={form.billingStatus} onChange={(value) => updateField('billingStatus', value)} />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <ReadField label="Status" value={company.status || 'active'} />
                            <ReadField label="Plan" value={company.plan} />
                            <ReadField label="Billing status" value={company.billingStatus} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'billing'}
                        onEdit={() => setEditSection('billing')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
                            status: form.status,
                            plan: form.plan,
                            billingStatus: form.billingStatus,
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'crm' && (
                <DashboardInsetPanel title="CRM Link">
                    {editSection === 'crm' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <Field label="CRM tenant ID" value={form.crmTenantId} onChange={(value) => updateField('crmTenantId', value)} />
                            <Field label="CRM slug" value={form.crmTenantSlug} onChange={(value) => updateField('crmTenantSlug', value)} />
                            <Field label="CRM primary domain" value={form.crmPrimaryDomain} onChange={(value) => updateField('crmPrimaryDomain', value.toLowerCase())} />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <ReadField label="CRM tenant ID" value={company.crmTenantId} />
                            <ReadField label="CRM slug" value={company.crmTenantSlug} />
                            <ReadField label="CRM primary domain" value={company.crmPrimaryDomain} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'crm'}
                        onEdit={() => setEditSection('crm')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
                            crmTenantId: form.crmTenantId,
                            crmTenantSlug: form.crmTenantSlug,
                            crmPrimaryDomain: form.crmPrimaryDomain,
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'members' && (
                <CompanyMembers
                    companyId={tenantId}
                    currentUser={user}
                    title="Owners & Admins"
                    description="Manage only tenant owner and admin authority from the platform tenant detail view."
                    allowedRoles={['owner', 'admin', 'company_admin']}
                />
            )}

            {activeTab === 'courses' && (
                <DashboardInsetPanel
                    title="Courses"
                    description="Attach existing courses to this tenant and remove tenant links when needed."
                >
                    <div className="mt-4 space-y-5">
                        <div className="grid gap-3 lg:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                    Search tenant courses
                                </span>
                                <input
                                    value={courseSearch}
                                    onChange={(event) => setCourseSearch(event.target.value)}
                                    className="dashboard-field w-full"
                                    placeholder="Search attached courses"
                                />
                            </label>
                            <label className="relative space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                    Attach course
                                </span>
                                <input
                                    value={attachSearch}
                                    onChange={(event) => setAttachSearch(event.target.value)}
                                    className="dashboard-field w-full"
                                    placeholder="Search existing course"
                                />
                                {(attachOptions.length > 0 || attachLoading || attachSearch.trim()) && (
                                    <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900">
                                        {attachLoading ? (
                                            <div className="px-3 py-2 text-sm text-edubot-muted">Searching...</div>
                                        ) : attachOptions.length ? attachOptions.map((course) => {
                                            const courseTypeDisabled = !isCourseTypeAllowedForTenant(company, course.courseType);
                                            return (
                                                <button
                                                    type="button"
                                                    key={course.id}
                                                    onClick={() => attachCourse(course.id)}
                                                    disabled={attachingCourseId === course.id || courseTypeDisabled}
                                                    title={courseTypeDisabled ? getCourseTypeTenantDisabledMessage(course.courseType) : undefined}
                                                    className="block w-full px-3 py-2 text-left hover:bg-edubot-surfaceAlt/70 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800"
                                                >
                                                    <span className="block truncate text-sm font-medium text-edubot-ink dark:text-white">
                                                        {attachingCourseId === course.id ? 'Attaching...' : (course.title || `Course #${course.id}`)}
                                                    </span>
                                                    <span className="block truncate text-xs text-edubot-muted dark:text-slate-400">
                                                        {course.instructor?.fullName || course.instructor?.email || 'No instructor'} · {course.courseType || 'course'}
                                                        {courseTypeDisabled ? ' · disabled by feature flags' : ''}
                                                    </span>
                                                </button>
                                            );
                                        }) : (
                                            <div className="px-3 py-2 text-sm text-edubot-muted">
                                                No matching courses found.
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
                                        <th className="px-4 py-3 font-semibold">Course</th>
                                        <th className="px-4 py-3 font-semibold">Instructor</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                    {tenantCoursesLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-edubot-muted">
                                                Loading courses...
                                            </td>
                                        </tr>
                                    ) : tenantCourses.length ? (
                                        tenantCourses.map((course) => (
                                            <tr key={course.id} className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-edubot-ink dark:text-white">
                                                        {course.title || `Course #${course.id}`}
                                                    </div>
                                                    <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                        #{course.id}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {course.instructor?.fullName || course.instructor?.email || 'Not set'}
                                                </td>
                                                <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                    {course.courseType || 'video'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full border border-edubot-line px-2.5 py-1 text-xs font-semibold text-edubot-ink dark:border-slate-700 dark:text-white">
                                                        {courseStatusLabel(course)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => detachCourse(course.id)}
                                                        disabled={confirmationLoading}
                                                        className="dashboard-button-secondary text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-edubot-muted">
                                                No courses attached to this tenant.
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
                <DashboardInsetPanel title="Branding">
                    {editSection === 'branding' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field
                                label="Display name"
                                value={brandingForm.displayName}
                                onChange={(value) => updateBranding('displayName', value)}
                            />
                            <Field
                                label="Certificate logo URL"
                                value={brandingForm.certificateLogoUrl}
                                onChange={(value) => updateBranding('certificateLogoUrl', value)}
                            />
                            <Field
                                label="Primary color"
                                type="color"
                                value={brandingForm.primaryColor}
                                onChange={(value) => updateBranding('primaryColor', value)}
                            />
                            <Field
                                label="Secondary color"
                                type="color"
                                value={brandingForm.secondaryColor}
                                onChange={(value) => updateBranding('secondaryColor', value)}
                            />
                            <Field
                                label="Accent color"
                                type="color"
                                value={brandingForm.accentColor || '#111827'}
                                onChange={(value) => updateBranding('accentColor', value)}
                            />
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <ReadField label="Display name" value={company.branding?.displayName} />
                            <ReadField label="Certificate logo URL" value={company.branding?.certificateLogoUrl} />
                            <ReadField label="Primary color" value={company.branding?.primaryColor} />
                            <ReadField label="Secondary color" value={company.branding?.secondaryColor} />
                            <ReadField label="Accent color" value={company.branding?.accentColor} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'branding'}
                        onEdit={() => setEditSection('branding')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
                            branding: {
                                ...(company.branding || {}),
                                ...cleanPayload(brandingForm),
                            },
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'settings' && (
                <DashboardInsetPanel title="Settings">
                    {editSection === 'settings' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field
                                label="Support email"
                                value={settingsForm.supportEmail}
                                onChange={(value) => updateSettings('supportEmail', value)}
                            />
                            <SelectField
                                label="Default course visibility"
                                value={settingsForm.defaultCourseVisibility}
                                onChange={(value) => updateSettings('defaultCourseVisibility', value)}
                            >
                                {COURSE_VISIBILITY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </SelectField>
                            <SelectField
                                label="Allow self enrollment"
                                value={String(settingsForm.allowSelfEnrollment)}
                                onChange={(value) => updateSettings('allowSelfEnrollment', value === 'true')}
                            >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </SelectField>
                            <SelectField
                                label="Require enrollment approval"
                                value={String(settingsForm.requireEnrollmentApproval)}
                                onChange={(value) => updateSettings('requireEnrollmentApproval', value === 'true')}
                            >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </SelectField>
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <ReadField label="Support email" value={company.settings?.supportEmail} />
                            <ReadField label="Default course visibility" value={company.settings?.defaultCourseVisibility} />
                            <ReadField label="Allow self enrollment" value={company.settings?.allowSelfEnrollment} />
                            <ReadField label="Require enrollment approval" value={company.settings?.requireEnrollmentApproval} />
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'settings'}
                        onEdit={() => setEditSection('settings')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({
                            settings: {
                                ...(company.settings || {}),
                                ...cleanPayload(settingsForm),
                            },
                        })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'flags' && (
                <DashboardInsetPanel title="Feature Flags">
                    {editSection === 'flags' ? (
                        <div className="mt-4 space-y-5">
                            <div className="grid gap-3 md:grid-cols-2">
                                {featureFlagRows.filter((row) => row.predefined).map((row) => {
                                    const index = featureFlagRows.findIndex((candidate) => candidate.key === row.key);
                                    return (
                                        <div
                                            key={row.key}
                                            className="flex items-start justify-between gap-4 rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-edubot-ink dark:text-white">{row.label}</p>
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {row.description}
                                                </p>
                                                <p className="mt-2 text-xs text-edubot-muted dark:text-slate-500">
                                                    {row.key}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-2">
                                                <SwitchControl
                                                    checked={row.value}
                                                    label={row.label}
                                                    onChange={(value) => updateFeatureFlagRow(index, { value })}
                                                />
                                                <span className="text-xs font-semibold text-edubot-muted dark:text-slate-400">
                                                    {row.value ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        Custom flags
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addCustomFeatureFlagRow}
                                        className="dashboard-button-secondary"
                                    >
                                        Add custom flag
                                    </button>
                                </div>
                                {customFeatureFlagRows(featureFlagRows).length ? (
                                    featureFlagRows.map((row, index) => row.predefined ? null : (
                                        <div key={`${row.key}-${index}`} className="grid gap-3 rounded-2xl border border-edubot-line/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950 md:grid-cols-[1fr_180px_auto]">
                                            <Field
                                                label="Flag key"
                                                value={row.key}
                                                onChange={(value) => updateFeatureFlagRow(index, { key: value })}
                                                placeholder="custom.feature.enabled"
                                            />
                                            <div className="self-end">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                                                    Value
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <SwitchControl
                                                        checked={row.value}
                                                        label={row.key || 'Custom feature flag'}
                                                        onChange={(value) => updateFeatureFlagRow(index, { value })}
                                                    />
                                                    <span className="text-xs font-semibold text-edubot-muted dark:text-slate-400">
                                                        {row.value ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFeatureFlagRow(index)}
                                                className="dashboard-button-secondary self-end"
                                                aria-label="Remove feature flag"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-edubot-muted dark:text-slate-400">
                                        No custom flags configured.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {FEATURE_FLAG_DEFINITIONS.map((flag) => (
                                <ReadField
                                    key={flag.key}
                                    label={flag.label}
                                    value={company.featureFlags?.[flag.key] !== false}
                                />
                            ))}
                            {Object.entries(company.featureFlags || {})
                                .filter(([key]) => !PREDEFINED_FEATURE_FLAG_KEYS.has(key))
                                .map(([key, value]) => (
                                    <ReadField key={key} label={key} value={Boolean(value)} />
                                ))
                            }
                        </div>
                    )}
                    <SectionActions
                        isEditing={editSection === 'flags'}
                        onEdit={() => setEditSection('flags')}
                        onCancel={cancelEdit}
                        loading={savingSection}
                        onSave={() => savePatch({ featureFlags: buildFeatureFlagsPayload(featureFlagRows) })}
                    />
                </DashboardInsetPanel>
            )}

            {activeTab === 'activity' && (
                <DashboardInsetPanel
                    title="Activity"
                    description="Recent tenant changes recorded by the backend."
                >
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                        <table className="min-w-[48rem] w-full text-left text-sm">
                            <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Action</th>
                                    <th className="px-4 py-3 font-semibold">Details</th>
                                    <th className="px-4 py-3 font-semibold">Actor</th>
                                    <th className="px-4 py-3 font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                {activityLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-edubot-muted">
                                            Loading activity...
                                        </td>
                                    </tr>
                                ) : activityItems.length ? (
                                    activityItems.map((activity) => (
                                        <tr key={activity.id} className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-edubot-ink dark:text-white">
                                                    {ACTIVITY_LABELS[activity.action] || activity.action}
                                                </div>
                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                    {activity.action}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                {formatActivitySummary(activity)}
                                            </td>
                                            <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                {activity.actorFullName || activity.actorEmail || (activity.actorUserId ? `User #${activity.actorUserId}` : 'System')}
                                            </td>
                                            <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                                {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Not set'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-edubot-muted">
                                            No tenant activity recorded yet.
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
            title={confirmation?.title || 'Confirm action'}
            message={confirmation?.message || ''}
            confirmLabel={confirmation?.confirmLabel || 'Confirm'}
            confirmVariant={confirmation?.confirmVariant || 'danger'}
            loading={confirmationLoading}
        />
        </DashboardLayout>
    );
}
