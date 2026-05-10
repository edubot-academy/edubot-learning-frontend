/* eslint-disable react/prop-types */
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
import {
    fetchUsers,
} from '@services/api';

const COMPANY_STATUSES = [
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'archived', label: 'Archived' },
];

const BILLING_STATUSES = [
    { value: '', label: 'Billing status' },
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Active' },
    { value: 'past_due', label: 'Past due' },
    { value: 'cancelled', label: 'Cancelled' },
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
    inactive: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    suspended: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
    archived: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
};

const tenantDomain = (company) => {
    if (company.customDomain) return company.customDomain;
    if (company.subdomain) return `${company.subdomain}.edubot.it.com`;
    return '';
};

const toTenantForm = (company = {}) => TENANT_FIELDS.reduce((form, key) => ({
    ...form,
    [key]: company[key] ?? defaultTenantForm[key] ?? '',
}), {});

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
        const configuredDomains = companies.filter((company) => company.subdomain || company.customDomain).length;
        const crmLinked = companies.filter((company) => company.crmTenantId || company.crmTenantSlug).length;
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
        return courses.filter((course) => (
            course.title?.toLowerCase().includes(term)
            || course.company?.name?.toLowerCase().includes(term)
        ));
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
                setOwnerResults(users.map((user) => ({
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                })));
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
                eyebrow="Tenant workspace"
                title="Platform tenants"
                description="Manage LMS tenants, domains, plan state, and CRM links from one platform-admin surface."
                action={(
                    <button type="button" onClick={() => setCreateModalOpen(true)} className="dashboard-button-primary">
                        <FiPlus className="h-4 w-4" />
                        Create tenant
                    </button>
                )}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard label="Tenants" value={metrics.companies} icon={FiBriefcase} />
                <DashboardMetricCard label="Active" value={metrics.activeTenants} icon={FiSave} tone={metrics.activeTenants ? 'green' : 'default'} />
                <DashboardMetricCard label="Domains" value={metrics.configuredDomains} icon={FiGlobe} tone={metrics.configuredDomains ? 'blue' : 'default'} />
                <DashboardMetricCard label="CRM linked" value={metrics.crmLinked} icon={FiLink} tone={metrics.crmLinked ? 'amber' : 'default'} />
            </div>

            <DashboardInsetPanel
                title="Tenant registry"
                description="Search, update tenant configuration, upload logo, and keep CRM references aligned."
            >
                <div className="mt-4 space-y-4">
                    <input
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="dashboard-field w-full"
                        placeholder="Search tenants"
                    />

                    {companies.length ? (
                        <div className="space-y-4">
                            {companies.map((company) => {
                                const isEditing = editingCompanyId === company.id;
                                const domain = tenantDomain(company);
                                const companyCourseCount = courses.filter((course) => course.company?.id === company.id).length;
                                return (
                                    <article
                                        key={company.id}
                                        className="rounded-2xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid gap-3 lg:grid-cols-4">
                                                    <label className="space-y-1 lg:col-span-2">
                                                        <FieldLabel>Tenant name</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.name}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'name', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Status</FieldLabel>
                                                        <select
                                                            value={editingCompanyForm.status}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'status', e.target.value)}
                                                            className="dashboard-select w-full"
                                                        >
                                                            {COMPANY_STATUSES.map((status) => (
                                                                <option key={status.value} value={status.value}>{status.label}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Plan</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.plan}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'plan', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Subdomain</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.subdomain}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'subdomain', e.target.value.toLowerCase())}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Custom domain</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.customDomain}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'customDomain', e.target.value.toLowerCase())}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Billing status</FieldLabel>
                                                        <select
                                                            value={editingCompanyForm.billingStatus}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'billingStatus', e.target.value)}
                                                            className="dashboard-select w-full"
                                                        >
                                                            {BILLING_STATUSES.map((status) => (
                                                                <option key={status.value || 'empty'} value={status.value}>{status.label}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Timezone</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.timezone}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'timezone', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>CRM tenant ID</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.crmTenantId}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'crmTenantId', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>CRM slug</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.crmTenantSlug}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'crmTenantSlug', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>CRM primary domain</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.crmPrimaryDomain}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'crmPrimaryDomain', e.target.value.toLowerCase())}
                                                            className="dashboard-field w-full"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <FieldLabel>Locale</FieldLabel>
                                                        <input
                                                            value={editingCompanyForm.locale}
                                                            onChange={(e) => updateFormField(setEditingCompanyForm, 'locale', e.target.value)}
                                                            className="dashboard-field w-full"
                                                        />
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
                                                        {editingSubmitting ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button type="button" onClick={stopEditing} className="dashboard-button-secondary">
                                                        <FiX className="h-4 w-4" />
                                                        Cancel
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
                                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[company.status] || statusTone.inactive}`}>
                                                            {company.status || 'active'}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-2 text-sm text-edubot-muted dark:text-slate-400 md:grid-cols-2">
                                                        <p>Domain: {domain || 'Not configured'}</p>
                                                        <p>Plan: {company.plan || 'Not set'}</p>
                                                        <p>Billing: {company.billingStatus || 'Not set'}</p>
                                                        <p>CRM: {company.crmTenantSlug || company.crmTenantId || 'Not linked'}</p>
                                                        <p>Timezone: {company.timezone || 'Asia/Bishkek'}</p>
                                                        <p>Courses linked: {companyCourseCount}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(company)}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiEdit3 className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <Link
                                                        to={`/admin/tenants/${company.id}`}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiExternalLink className="h-4 w-4" />
                                                        Detail
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRefs.current[company.id]?.click()}
                                                        disabled={!!pendingAction}
                                                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FiImage className="h-4 w-4" />
                                                        Logo
                                                    </button>
                                                    <input
                                                        ref={(node) => {
                                                            fileInputRefs.current[company.id] = node;
                                                        }}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                runPendingAction(`logo-${company.id}`, () => onUploadCompanyLogo(company.id, e.target.files[0]));
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => runPendingAction(`delete-${company.id}`, () => onDeleteCompany(company.id))}
                                                        disabled={!!pendingAction}
                                                        className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                        {pendingAction === `delete-${company.id}` ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState title="No tenants found" subtitle="Create a tenant or adjust the search filter." />
                    )}
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Course links"
                description="Attach existing courses to tenants while runtime tenant routing remains unchanged."
            >
                {courses.length ? (
                    <div className="mt-4 space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <input
                                value={courseLinkSearch}
                                onChange={(event) => setCourseLinkSearch(event.target.value)}
                                className="dashboard-field w-full lg:max-w-md"
                                placeholder="Search courses or tenant names"
                            />
                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                Showing {visibleCourseLinks.length} of {filteredCourseLinks.length} courses
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
                                        <p className="font-medium text-edubot-ink dark:text-white">{course.title}</p>
                                        <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                            Current tenant: {course.company?.name || 'Not selected'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <select
                                            value={course.company?.id || ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    runPendingAction(`course-${course.id}`, () => onAssignCourseToCompany(course.id, e.target.value));
                                                } else {
                                                    runPendingAction(`course-${course.id}`, () => onClearCourseCompany(course.id));
                                                }
                                            }}
                                            disabled={!!pendingAction}
                                            className="dashboard-select min-w-[12rem] flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="">Select tenant</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        {course.company?.id ? (
                                            <button
                                                type="button"
                                                onClick={() => runPendingAction(`course-${course.id}`, () => onUnassignCourseFromCompany(course.id, course.company.id))}
                                                disabled={!!pendingAction}
                                                className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {pendingAction === `course-${course.id}` ? 'Removing...' : 'Remove'}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="No matching courses" subtitle="Try a different course or tenant search." />
                        )}
                        {filteredCourseLinks.length > visibleCourseLinks.length ? (
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setCourseLinksVisible((count) => count + 12)}
                                    className="dashboard-button-secondary"
                                >
                                    Show more courses
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState title="No courses found" subtitle="There are no courses available for tenant linking yet." />
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
                title="Create tenant"
                subtitle="Create the LMS tenant shell first. Owner/member cleanup is handled from tenant detail."
                size="xl"
            >
                <div className="grid gap-3 lg:grid-cols-4">
                    <label className="space-y-1 lg:col-span-2">
                        <FieldLabel>Tenant name</FieldLabel>
                        <input
                            value={newCompanyForm.name}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'name', e.target.value)}
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>Subdomain</FieldLabel>
                        <input
                            value={newCompanyForm.subdomain}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'subdomain', e.target.value.toLowerCase())}
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>Status</FieldLabel>
                        <select
                            value={newCompanyForm.status}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'status', e.target.value)}
                            className="dashboard-select w-full"
                        >
                            {COMPANY_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>Custom domain</FieldLabel>
                        <input
                            value={newCompanyForm.customDomain}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'customDomain', e.target.value.toLowerCase())}
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>Plan</FieldLabel>
                        <input
                            value={newCompanyForm.plan}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'plan', e.target.value)}
                            className="dashboard-field w-full"
                        />
                    </label>
                    <label className="space-y-1">
                        <FieldLabel>Billing status</FieldLabel>
                        <select
                            value={newCompanyForm.billingStatus}
                            onChange={(e) => updateFormField(setNewCompanyForm, 'billingStatus', e.target.value)}
                            className="dashboard-select w-full"
                        >
                            {BILLING_STATUSES.map((status) => (
                                <option key={status.value || 'empty'} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                        Owner
                    </p>
                    <div className="relative">
                        <input
                            value={ownerQuery}
                            onChange={(event) => {
                                setOwnerQuery(event.target.value);
                                setSelectedOwner(null);
                            }}
                            className="dashboard-field w-full"
                            placeholder="Search existing user by name or email"
                        />
                        {!selectedOwner && (ownerResults.length > 0 || ownerSearching || ownerQuery.trim()) && (
                            <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900">
                                {ownerSearching ? (
                                    <div className="px-3 py-2 text-sm text-edubot-muted">Searching...</div>
                                ) : ownerResults.length ? ownerResults.map((owner) => (
                                    <button
                                        type="button"
                                        key={owner.id}
                                        onClick={() => {
                                            setSelectedOwner(owner);
                                            setOwnerQuery(owner.fullName || owner.email || `#${owner.id}`);
                                            setOwnerResults([]);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-edubot-surfaceAlt/70 dark:hover:bg-slate-800"
                                    >
                                        {owner.avatarUrl ? (
                                            <img src={owner.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
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
                                )) : (
                                    <div className="px-3 py-2 text-sm text-edubot-muted">
                                        No matching users found.
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
                            Clear owner
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
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submitCreate}
                        disabled={createSubmitting || !newCompanyForm.name.trim()}
                        className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiPlus className="h-4 w-4" />
                        {createSubmitting ? 'Creating...' : 'Create tenant'}
                    </button>
                </div>
            </BasicModal>
        </div>
    );
};

export default AdminCompaniesTab;
