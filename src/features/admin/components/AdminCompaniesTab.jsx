import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import {
    FiBriefcase,
    FiEdit3,
    FiGlobe,
    FiImage,
    FiLink,
    FiExternalLink,
    FiPlus,
    FiSave,
    FiTrash2,
    FiX,
} from 'react-icons/fi';
import { fetchUsers } from '@services/api';
import { LOCALE_OPTIONS, normalizeLocale } from '../../../i18n/locale';
import { useTranslation } from 'react-i18next';

const COMPANY_STATUSES = [
    { value: 'trial', labelKey: 'company.platformTenant.status.trial' },
    { value: 'active', labelKey: 'company.platformTenant.status.active' },
    { value: 'inactive', labelKey: 'company.platformTenant.status.inactive' },
    { value: 'suspended', labelKey: 'company.platformTenant.status.suspended' },
    { value: 'archived', labelKey: 'company.platformTenant.status.archived' },
];

const BILLING_STATUSES = [
    { value: '', labelKey: 'company.platformTenant.fields.billingStatus' },
    { value: 'trial', labelKey: 'company.adminCompanies.billingStatuses.trial' },
    { value: 'active', labelKey: 'company.adminCompanies.billingStatuses.active' },
    { value: 'past_due', labelKey: 'company.adminCompanies.billingStatuses.pastDue' },
    { value: 'cancelled', labelKey: 'company.adminCompanies.billingStatuses.cancelled' },
];

const TENANT_FIELDS = [
    'name',
    'subdomain',
    'customDomain',
    'status',
    'plan',
    'billingStatus',
    'crmTenantId',
    'crmTenantSlug',
    'crmPrimaryDomain',
    'timezone',
    'locale',
];

const defaultTenantForm = {
    name: '',
    subdomain: '',
    customDomain: '',
    status: 'active',
    plan: '',
    billingStatus: '',
    crmTenantId: '',
    crmTenantSlug: '',
    crmPrimaryDomain: '',
    timezone: 'Asia/Bishkek',
    locale: 'ky',
};

const statusTone = {
    trial: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800',
    inactive:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    suspended:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
    archived:
        'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
};

const tenantDomain = (company) => {
    if (company.customDomain) return company.customDomain;
    if (company.subdomain) return `${company.subdomain}.lms.edubot.it.com`;
    return '';
};

const companyStatusLabel = (status, t) =>
    t(`company.platformTenant.status.${String(status || 'active').toLowerCase()}`, {
        defaultValue: status || 'active',
    });

const toTenantForm = (company = {}) =>
    TENANT_FIELDS.reduce(
        (form, key) => ({
            ...form,
            [key]:
                key === 'locale'
                    ? normalizeLocale(company[key])
                    : (company[key] ?? defaultTenantForm[key] ?? ''),
        }),
        {}
    );

const updateFormField = (setter, key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
};

const FieldLabel = ({ children }) => (
    <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
        {children}
    </span>
);

const AdminCompaniesTab = ({
    companies,
    companySearch,
    setCompanySearch,
    newCompanyForm,
    setNewCompanyForm,
    courses,
    onCreateCompany,
    onUpdateCompany,
    onDeleteCompany,
    onUploadCompanyLogo,
    onAssignCourseToCompany,
    onClearCourseCompany,
    onUnassignCourseFromCompany,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const [editingCompanyForm, setEditingCompanyForm] = useState(defaultTenantForm);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [ownerQuery, setOwnerQuery] = useState('');
    const [ownerResults, setOwnerResults] = useState([]);
    const [ownerSearching, setOwnerSearching] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [editingSubmitting, setEditingSubmitting] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [courseLinkSearch, setCourseLinkSearch] = useState('');
    const [courseLinksVisible, setCourseLinksVisible] = useState(6);
    const fileInputRefs = useRef({});

    const metrics = useMemo(() => {
        const activeTenants = companies.filter((company) => company.status === 'active').length;
        const configuredDomains = companies.filter(
            (company) => company.subdomain || company.customDomain
        ).length;
        const crmLinked = companies.filter(
            (company) => company.crmTenantId || company.crmTenantSlug
        ).length;
        const linkedCourses = courses.filter((course) => Boolean(course.company?.id)).length;

        return {
            companies: companies.length,
            activeTenants,
            configuredDomains,
            crmLinked,
            linkedCourses,
        };
    }, [companies, courses]);

    const startEditing = (company) => {
        setEditingCompanyId(company.id);
        setEditingCompanyForm(toTenantForm(company));
    };

    const stopEditing = () => {
        setEditingCompanyId(null);
        setEditingCompanyForm(defaultTenantForm);
    };

    const submitEdit = async (companyId) => {
        setEditingSubmitting(true);
        try {
            await onUpdateCompany(companyId, editingCompanyForm);
            stopEditing();
        } finally {
            setEditingSubmitting(false);
        }
    };

    const submitCreate = async () => {
        if (createSubmitting) return;
        setCreateSubmitting(true);
        try {
            const created = await onCreateCompany({
                ...newCompanyForm,
                ownerUserId: selectedOwner?.id,
            });
            if (!created?.id) return;
            setCreateModalOpen(false);
            setOwnerQuery('');
            setOwnerResults([]);
            setSelectedOwner(null);
            navigate(`/admin/tenants/${created.id}`);
        } finally {
            setCreateSubmitting(false);
        }
    };

    const filteredCourseLinks = useMemo(() => {
        const term = courseLinkSearch.trim().toLowerCase();
        if (!term) return courses;
        return courses.filter(
            (course) =>
                course.title?.toLowerCase().includes(term) ||
                course.company?.name?.toLowerCase().includes(term)
        );
    }, [courseLinkSearch, courses]);

    const visibleCourseLinks = filteredCourseLinks.slice(0, courseLinksVisible);

    useEffect(() => {
        setCourseLinksVisible(6);
    }, [courseLinkSearch]);

    const runPendingAction = async (key, action) => {
        if (pendingAction) return;
        setPendingAction(key);
        try {
            await action();
        } finally {
            setPendingAction(null);
        }
    };

    useEffect(() => {
        if (!createModalOpen || selectedOwner || !ownerQuery.trim()) {
            setOwnerResults([]);
            setOwnerSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setOwnerSearching(true);
            try {
                const res = await fetchUsers({ page: 1, limit: 8, search: ownerQuery.trim() });
                const users = Array.isArray(res) ? res : (res?.data ?? []);
                setOwnerResults(
                    users.map((user) => ({
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        avatarUrl: user.avatarUrl,
                    }))
                );
            } catch {
                setOwnerResults([]);
            } finally {
                setOwnerSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [createModalOpen, ownerQuery, selectedOwner]);

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('company.adminCompanies.headerEyebrow')}
                title={t('company.adminCompanies.title')}
                description={t('company.adminCompanies.description')}
                action={
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="dashboard-button-primary"
                    >
                        <FiPlus className="h-4 w-4" />
                        {t('company.adminCompanies.createTenant')}
                    </button>
                }
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label={t('company.adminCompanies.metrics.tenants')}
                    value={metrics.companies}
                    icon={FiBriefcase}
                />
                <DashboardMetricCard
                    label={t('company.adminCompanies.metrics.active')}
                    value={metrics.activeTenants}
                    icon={FiSave}
                    tone={metrics.activeTenants ? 'green' : 'default'}
                />
                <DashboardMetricCard
                    label={t('company.adminCompanies.metrics.domains')}
                    value={metrics.configuredDomains}
                    icon={FiGlobe}
                    tone={metrics.configuredDomains ? 'blue' : 'default'}
                />
                <DashboardMetricCard
                    label={t('company.adminCompanies.metrics.crmLinked')}
                    value={metrics.crmLinked}
                    icon={FiLink}
                    tone={metrics.crmLinked ? 'amber' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title={t('company.adminCompanies.registry.title')}
                description={t('company.adminCompanies.registry.description')}
            >
                <div className="mt-4 space-y-4">
                    <input
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="dashboard-field w-full"
                        placeholder={t('company.adminCompanies.registry.searchPlaceholder')}
                    />

                    {companies.length ? (
                        <div className="space-y-4">
                            {companies.map((company) => {
                                const isEditing = editingCompanyId === company.id;
                                const domain = tenantDomain(company);
                                const companyCourseCount = courses.filter(
                                    (course) => course.company?.id === company.id
                                ).length;
                                return (
                                    <article
                                        key={company.id}
                                        className="rounded-2xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid gap-3 lg:grid-cols-4">
                                                    <label className="space-y-1 lg:col-span-2">
                                                        <FieldLabel>{t('company.fields.name')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.name}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'name',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.status')}</FieldLabel>
                                                        <select
                                                            value={editingCompanyForm.status}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'status',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-select w-full"
                                                        >
                                                            {COMPANY_STATUSES.map((status) => (
                                                                <option
                                                                    key={status.value}
                                                                    value={status.value}
                                                                >
                                                                    {t(status.labelKey)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.plan')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.plan}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'plan',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.subdomain')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.subdomain}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'subdomain',
                                                                    e.target.value.toLowerCase()
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.customDomain')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.customDomain}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'customDomain',
                                                                    e.target.value.toLowerCase()
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.billingStatus')}</FieldLabel>
                                                        <select
                                                            value={editingCompanyForm.billingStatus}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'billingStatus',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-select w-full"
                                                        >
                                                            {BILLING_STATUSES.map((status) => (
                                                                <option
                                                                    key={status.value || 'empty'}
                                                                    value={status.value}
                                                                >
                                                                    {t(status.labelKey)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.timezone')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.timezone}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'timezone',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.crmTenantId')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.crmTenantId}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'crmTenantId',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.crmSlug')}</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.crmTenantSlug}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'crmTenantSlug',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.crmPrimaryDomain')}</FieldLabel>
                                                        <input
                                                            value={
                                                                editingCompanyForm.crmPrimaryDomain
                                                            }
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'crmPrimaryDomain',
                                                                    e.target.value.toLowerCase()
                                                                )
                                                            }
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>{t('company.platformTenant.fields.locale')}</FieldLabel>
                                                        <select
                                                            value={normalizeLocale(
                                                                editingCompanyForm.locale
                                                            )}
                                                            onChange={(e) =>
                                                                updateFormField(
                                                                    setEditingCompanyForm,
                                                                    'locale',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="dashboard-select w-full"
                                                        >
                                                            {LOCALE_OPTIONS.map((locale) => (
                                                                <option
                                                                    key={locale.value}
                                                                    value={locale.value}
                                                                >
                                                                    {locale.nativeLabel} (
                                                                    {locale.value})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => submitEdit(company.id)}
                                                        disabled={editingSubmitting}
                                                        className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FiSave className="h-4 w-4" />
                                                        {editingSubmitting
                                                            ? t('company.settings.saving')
                                                            : t('company.settings.saveChanges')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={stopEditing}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiX className="h-4 w-4" />
                                                        {t('company.settings.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <FiBriefcase className="h-4 w-4 text-edubot-orange" />
                                                        <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                            {company.name}
                                                        </h3>
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[company.status] || statusTone.inactive}`}
                                                        >
                                                            {companyStatusLabel(company.status, t)}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-2 text-sm text-edubot-muted dark:text-slate-400 md:grid-cols-2">
                                                        <p>
                                                            {t('company.platformTenant.snapshot.domain')}:{' '}
                                                            {domain || t('company.platformTenant.notConfigured')}
                                                        </p>
                                                        <p>
                                                            {t('company.platformTenant.fields.plan')}:{' '}
                                                            {company.plan || t('company.detail.notSet')}
                                                        </p>
                                                        <p>
                                                            {t('company.platformTenant.snapshot.billing')}:{' '}
                                                            {company.billingStatus || t('company.detail.notSet')}
                                                        </p>
                                                        <p>
                                                            {t('company.platformTenant.metrics.crm')}:{' '}
                                                            {company.crmTenantSlug ||
                                                                company.crmTenantId ||
                                                                t('company.platformTenant.notLinked')}
                                                        </p>
                                                        <p>
                                                            {t('company.platformTenant.fields.timezone')}:{' '}
                                                            {company.timezone || 'Asia/Bishkek'}
                                                        </p>
                                                        <p>
                                                            {t('company.adminCompanies.registry.coursesLinked', {
                                                                count: companyCourseCount,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(company)}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiEdit3 className="h-4 w-4" />
                                                        {t('company.settings.editProfile')}
                                                    </button>
                                                    <Link
                                                        to={`/admin/tenants/${company.id}`}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiExternalLink className="h-4 w-4" />
                                                        {t('company.adminCompanies.registry.tenantWorkspace')}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            fileInputRefs.current[
                                                                company.id
                                                            ]?.click()
                                                        }
                                                        disabled={!!pendingAction}
                                                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FiImage className="h-4 w-4" />
                                                        {t('company.fields.logo')}
                                                    </button>
                                                    <input
                                                        ref={(node) => {
                                                            fileInputRefs.current[company.id] =
                                                                node;
                                                        }}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                runPendingAction(
                                                                    `logo-${company.id}`,
                                                                    () =>
                                                                        onUploadCompanyLogo(
                                                                            company.id,
                                                                            e.target.files[0]
                                                                        )
                                                                );
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            runPendingAction(
                                                                `delete-${company.id}`,
                                                                () => onDeleteCompany(company.id)
                                                            )
                                                        }
                                                        disabled={!!pendingAction}
                                                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                        {pendingAction === `delete-${company.id}`
                                                            ? t('company.settings.deleting')
                                                            : t('company.settings.deleteCompany')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title={t('company.adminCompanies.registry.emptyTitle')}
                            subtitle={t('company.adminCompanies.registry.emptySubtitle')}
                        />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('company.adminCompanies.courseLinks.title')}
                description={t('company.adminCompanies.courseLinks.description')}
            >
                {courses.length ? (
                    <div className="mt-4 space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <input
                                value={courseLinkSearch}
                                onChange={(event) => setCourseLinkSearch(event.target.value)}
                                className="dashboard-field w-full lg:max-w-md"
                                placeholder={t('company.adminCompanies.courseLinks.searchPlaceholder')}
                            />
                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                {t('company.adminCompanies.courseLinks.showing', {
                                    visible: visibleCourseLinks.length,
                                    total: filteredCourseLinks.length,
                                })}
                            </p>
                        </div>
                        {visibleCourseLinks.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {visibleCourseLinks.map((course) => (
                                    <div
                                        key={course.id}
                                        className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="font-medium text-edubot-ink dark:text-white">
                                                    {course.title}
                                                </p>
                                                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {t('company.adminCompanies.courseLinks.currentTenant')}:{' '}
                                                    {course.company?.name ||
                                                        t('company.adminCompanies.courseLinks.notSelected')}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <select
                                                    value={course.company?.id || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            runPendingAction(
                                                                `course-${course.id}`,
                                                                () =>
                                                                    onAssignCourseToCompany(
                                                                        course.id,
                                                                        e.target.value
                                                                    )
                                                            );
                                                        } else {
                                                            runPendingAction(
                                                                `course-${course.id}`,
                                                                () =>
                                                                    onClearCourseCompany(course.id)
                                                            );
                                                        }
                                                    }}
                                                    disabled={!!pendingAction}
                                                    className="dashboard-select min-w-[12rem] flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <option value="">
                                                        {t('company.adminCompanies.courseLinks.selectTenant')}
                                                    </option>
                                                    {companies.map((company) => (
                                                        <option key={company.id} value={company.id}>
                                                            {company.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {course.company?.id ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            runPendingAction(
                                                                `course-${course.id}`,
                                                                () =>
                                                                    onUnassignCourseFromCompany(
                                                                        course.id,
                                                                        course.company.id
                                                                    )
                                                            )
                                                        }
                                                        disabled={!!pendingAction}
                                                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {pendingAction === `course-${course.id}`
                                                            ? t('company.members.removing')
                                                            : t('company.members.remove')}
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title={t('company.adminCompanies.courseLinks.noMatchingTitle')}
                                subtitle={t('company.adminCompanies.courseLinks.noMatchingSubtitle')}
                            />
                        )}
                        {filteredCourseLinks.length > visibleCourseLinks.length ? (
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setCourseLinksVisible((count) => count + 12)}
                                    className="dashboard-button-secondary"
                                >
                                    {t('company.adminCompanies.courseLinks.showMore')}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            title={t('company.adminCompanies.courseLinks.emptyTitle')}
                            subtitle={t('company.adminCompanies.courseLinks.emptySubtitle')}
                        />
                    </div>
                )}
            </DashboardInsetPanel>

            <BasicModal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    setOwnerQuery('');
                    setOwnerResults([]);
                    setSelectedOwner(null);
                }}
                title={t('company.adminCompanies.createModal.title')}
                subtitle={t('company.adminCompanies.createModal.subtitle')}
                size="xl"
            >
                <div className="grid gap-3 lg:grid-cols-4">
                    <label className="space-y-1 lg:col-span-2">
                        <FieldLabel>{t('company.fields.name')}</FieldLabel>
                        <input
                            value={newCompanyForm.name}
                            onChange={(e) =>
                                updateFormField(setNewCompanyForm, 'name', e.target.value)
                            }
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.subdomain')}</FieldLabel>
                        <input
                            value={newCompanyForm.subdomain}
                            onChange={(e) =>
                                updateFormField(
                                    setNewCompanyForm,
                                    'subdomain',
                                    e.target.value.toLowerCase()
                                )
                            }
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.status')}</FieldLabel>
                        <select
                            value={newCompanyForm.status}
                            onChange={(e) =>
                                updateFormField(setNewCompanyForm, 'status', e.target.value)
                            }
                            className="dashboard-select w-full"
                        >
                            {COMPANY_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {t(status.labelKey)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.customDomain')}</FieldLabel>
                        <input
                            value={newCompanyForm.customDomain}
                            onChange={(e) =>
                                updateFormField(
                                    setNewCompanyForm,
                                    'customDomain',
                                    e.target.value.toLowerCase()
                                )
                            }
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.plan')}</FieldLabel>
                        <input
                            value={newCompanyForm.plan}
                            onChange={(e) =>
                                updateFormField(setNewCompanyForm, 'plan', e.target.value)
                            }
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.billingStatus')}</FieldLabel>
                        <select
                            value={newCompanyForm.billingStatus}
                            onChange={(e) =>
                                updateFormField(setNewCompanyForm, 'billingStatus', e.target.value)
                            }
                            className="dashboard-select w-full"
                        >
                            {BILLING_STATUSES.map((status) => (
                                <option key={status.value || 'empty'} value={status.value}>
                                    {t(status.labelKey)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>{t('company.platformTenant.fields.locale')}</FieldLabel>
                        <select
                            value={normalizeLocale(newCompanyForm.locale)}
                            onChange={(e) =>
                                updateFormField(setNewCompanyForm, 'locale', e.target.value)
                            }
                            className="dashboard-select w-full"
                        >
                            {LOCALE_OPTIONS.map((locale) => (
                                <option key={locale.value} value={locale.value}>
                                    {locale.nativeLabel} ({locale.value})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                        {t('company.members.roles.owner.label')}
                    </p>
                    <div className="relative">
                        <input
                            value={ownerQuery}
                            onChange={(event) => {
                                setOwnerQuery(event.target.value);
                                setSelectedOwner(null);
                            }}
                            className="dashboard-field w-full"
                            placeholder={t('company.adminCompanies.createModal.ownerSearchPlaceholder')}
                        />
                        {!selectedOwner &&
                            (ownerResults.length > 0 || ownerSearching || ownerQuery.trim()) && (
                                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900">
                                    {ownerSearching ? (
                                        <div className="px-3 py-2 text-sm text-edubot-muted">
                                            {t('common.searching')}
                                        </div>
                                    ) : ownerResults.length ? (
                                        ownerResults.map((owner) => (
                                            <button
                                                type="button"
                                                key={owner.id}
                                                onClick={() => {
                                                    setSelectedOwner(owner);
                                                    setOwnerQuery(
                                                        owner.fullName ||
                                                            owner.email ||
                                                            `#${owner.id}`
                                                    );
                                                    setOwnerResults([]);
                                                }}
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-edubot-surfaceAlt/70 dark:hover:bg-slate-800"
                                            >
                                                {owner.avatarUrl ? (
                                                    <img
                                                        src={owner.avatarUrl}
                                                        alt=""
                                                        className="h-7 w-7 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-full bg-edubot-surfaceAlt dark:bg-slate-700" />
                                                )}
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-medium text-edubot-ink dark:text-white">
                                                        {owner.fullName || `#${owner.id}`}
                                                    </span>
                                                    <span className="block truncate text-xs text-edubot-muted dark:text-slate-400">
                                                        {owner.email || '-'}
                                                    </span>
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-edubot-muted">
                                            {t('company.adminCompanies.createModal.noMatchingOwners')}
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                    {selectedOwner ? (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedOwner(null);
                                setOwnerQuery('');
                            }}
                            className="dashboard-button-secondary"
                        >
                            {t('company.adminCompanies.createModal.clearOwner')}
                        </button>
                    ) : null}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        disabled={createSubmitting}
                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t('company.settings.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={submitCreate}
                        disabled={createSubmitting || !newCompanyForm.name.trim()}
                        className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiPlus className="h-4 w-4" />
                        {createSubmitting
                            ? t('company.list.creating')
                            : t('company.adminCompanies.createTenant')}
                    </button>
                </div>
            </BasicModal>
        </div>
    );
};

export default AdminCompaniesTab;
