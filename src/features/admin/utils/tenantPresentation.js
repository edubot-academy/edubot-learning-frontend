export const COMPANY_STATUS_OPTIONS = [
    { value: 'trial', labelKey: 'company.platformTenant.status.trial' },
    { value: 'active', labelKey: 'company.platformTenant.status.active' },
    { value: 'inactive', labelKey: 'company.platformTenant.status.inactive' },
    { value: 'suspended', labelKey: 'company.platformTenant.status.suspended' },
    { value: 'archived', labelKey: 'company.platformTenant.status.archived' },
];

export const COMPANY_STATUS_VALUES = COMPANY_STATUS_OPTIONS.map((status) => status.value);

const COMPANY_STATUS_TONE_CLASSES = {
    trial: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800',
    inactive:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    suspended:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
    archived:
        'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
};

export const getCompanyStatusToneClass = (status) =>
    COMPANY_STATUS_TONE_CLASSES[status] || COMPANY_STATUS_TONE_CLASSES.inactive;

export const getCompanyStatusLabel = (status, t) => {
    const normalizedStatus = String(status || 'active').toLowerCase();
    return t(`company.platformTenant.status.${normalizedStatus}`, {
        defaultValue: normalizedStatus.replace(/_/g, ' '),
    });
};

export const getTenantDomain = (company = {}, fallback = '') => {
    if (company.customDomain) return company.customDomain;
    if (company.subdomain) return `${company.subdomain}.lms.edubot.it.com`;
    return fallback;
};
