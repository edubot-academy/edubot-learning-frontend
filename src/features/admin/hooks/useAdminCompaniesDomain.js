import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
    assignCourseToCompany,
    clearCourseCompany,
    createCompany,
    deleteCompany,
    linkCompanyCrmTenant,
    listCompanies,
    unassignCourseFromCompany,
    unlinkCompanyCrmTenant,
    updateCompany,
    uploadCompanyLogo,
} from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { useTranslation } from 'react-i18next';

const defaultCompanyForm = {
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

const CRM_LINK_FIELDS = new Set(['crmTenantId', 'crmTenantSlug', 'crmPrimaryDomain']);

const cleanTenantPayload = (payload = {}) =>
    Object.fromEntries(
        Object.entries(payload)
            .filter(([, value]) => {
                if (typeof value === 'string') return value.trim() !== '';
                return value !== undefined && value !== null;
            })
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );

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

export const useAdminCompaniesDomain = ({ loadCoursesAndCategories, requestConfirmation }) => {
    const { t } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [, setCompaniesTotalPages] = useState(1);
    const [companySearch, setCompanySearch] = useState('');
    const [companyPage] = useState(1);
    const [newCompanyForm, setNewCompanyForm] = useState(() => ({ ...defaultCompanyForm }));

    const loadCompanies = useCallback(async () => {
        try {
            const res = await listCompanies({
                page: companyPage,
                limit: 10,
                q: companySearch,
            });
            setCompanies(res?.items || []);
            setCompaniesTotalPages(res?.totalPages || 1);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('company.list.toasts.loadError')).message);
            }
        }
    }, [companyPage, companySearch, t]);

    const handleCreateCompany = useCallback(
        async (payload) => {
            const companyPayload = payload || newCompanyForm;
            if (!companyPayload.name?.trim()) return null;

            try {
                const { tenantPatch, crmPatch } = splitTenantPayload(companyPayload);
                const created = await createCompany(cleanTenantPayload(tenantPatch));
                const crmTenantId =
                    typeof crmPatch.crmTenantId === 'string' ? crmPatch.crmTenantId.trim() : '';
                const crmResult = crmTenantId
                    ? await linkCompanyCrmTenant(created.id, cleanTenantPayload(crmPatch))
                    : null;
                const crmUpdate = crmResult?.crmLink
                    ? {
                          crmTenantId: crmResult.crmLink.crmTenantId,
                          crmTenantSlug: crmResult.crmLink.crmTenantSlug,
                          crmPrimaryDomain: crmResult.crmLink.crmPrimaryDomain,
                      }
                    : {};
                const nextCompany = { ...created, ...crmUpdate };
                setCompanies((prev) => [...prev, nextCompany]);
                setNewCompanyForm({ ...defaultCompanyForm });
                toast.success(t('company.adminCompanies.toasts.created'));
                return created;
            } catch (error) {
                toast.error(parseApiError(error, t('company.list.toasts.createError')).message);
                return null;
            }
        },
        [newCompanyForm, t]
    );

    const handleUpdateCompany = useCallback(
        async (companyId, patch) => {
            if (!patch?.name?.trim()) return;

            try {
                const current = companies.find((company) => company.id === companyId) ?? {};
                const { tenantPatch, crmPatch } = splitTenantPayload(patch);
                const cleanedTenantPatch = cleanTenantPayload(tenantPatch);
                const updated = Object.keys(cleanedTenantPatch).length
                    ? await updateCompany(companyId, cleanedTenantPatch)
                    : {};
                const crmTenantId =
                    typeof crmPatch.crmTenantId === 'string' ? crmPatch.crmTenantId.trim() : '';
                const hasCrmFields = Object.keys(crmPatch).length > 0;
                const shouldUnlinkCrm = hasCrmFields && !crmTenantId && current.crmTenantId;
                const crmResult =
                    hasCrmFields && crmTenantId
                        ? await linkCompanyCrmTenant(companyId, cleanTenantPayload(crmPatch))
                        : shouldUnlinkCrm
                          ? await unlinkCompanyCrmTenant(companyId)
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
                setCompanies((prev) =>
                    prev.map((company) =>
                        company.id === companyId
                            ? { ...company, ...updated, ...crmUpdate }
                            : company
                    )
                );
                toast.success(t('company.adminCompanies.toasts.updated'));
            } catch (error) {
                toast.error(
                    parseApiError(error, t('company.platformTenant.toasts.saveError')).message
                );
            }
        },
        [companies, t]
    );

    const handleDeleteCompany = useCallback(
        async (companyId) => {
            const company = companies.find((item) => item.id === companyId);
            requestConfirmation({
                title: t('company.settings.deleteTitle'),
                message: t('company.settings.deleteMessage', { name: company?.name || '' }),
                confirmLabel: t('company.settings.deleteCompany'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCompany(companyId);
                        setCompanies((prev) => prev.filter((company) => company.id !== companyId));
                        toast.success(t('company.settings.toasts.deleted'));
                    } catch (error) {
                        toast.error(
                            parseApiError(error, t('company.settings.toasts.deleteError')).message
                        );
                    }
                },
            });
        },
        [companies, requestConfirmation, t]
    );

    const handleAssignCourseToCompany = useCallback(
        async (courseId, companyId) => {
            try {
                await assignCourseToCompany(courseId, companyId);
                toast.success(t('company.courses.toasts.attached'));
                loadCoursesAndCategories();
            } catch (error) {
                toast.error(parseApiError(error, t('company.courses.toasts.attachError')).message);
            }
        },
        [loadCoursesAndCategories, t]
    );

    const handleUnassignCourseFromCompany = useCallback(
        async (courseId, companyId) => {
            try {
                await unassignCourseFromCompany(courseId, companyId);
                toast.success(t('company.courses.toasts.detached'));
                loadCoursesAndCategories();
            } catch (error) {
                toast.error(parseApiError(error, t('company.courses.toasts.detachError')).message);
            }
        },
        [loadCoursesAndCategories, t]
    );

    const handleClearCourseCompany = useCallback(
        async (courseId) => {
            requestConfirmation({
                title: t('company.adminCompanies.confirm.clearCourseTitle'),
                message: t('company.adminCompanies.confirm.clearCourseMessage'),
                confirmLabel: t('company.adminCompanies.confirm.clearCourseConfirm'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await clearCourseCompany(courseId);
                        toast.success(t('company.adminCompanies.toasts.courseLinksCleared'));
                        loadCoursesAndCategories();
                    } catch (error) {
                        toast.error(
                            parseApiError(
                                error,
                                t('company.adminCompanies.toasts.courseLinksClearError')
                            ).message
                        );
                    }
                },
            });
        },
        [loadCoursesAndCategories, requestConfirmation, t]
    );

    const handleUploadCompanyLogo = useCallback(
        async (companyId, file) => {
            if (!file) {
                toast.error(t('company.adminCompanies.toasts.selectFile'));
                return;
            }

            try {
                await uploadCompanyLogo(companyId, file);
                toast.success(t('company.settings.toasts.logoUploaded'));
                loadCompanies();
            } catch (error) {
                toast.error(
                    parseApiError(error, t('company.settings.toasts.logoUploadError')).message
                );
            }
        },
        [loadCompanies, t]
    );

    return {
        companies,
        companySearch,
        handleAssignCourseToCompany,
        handleClearCourseCompany,
        handleCreateCompany,
        handleDeleteCompany,
        handleUnassignCourseFromCompany,
        handleUpdateCompany,
        handleUploadCompanyLogo,
        loadCompanies,
        newCompanyForm,
        setCompanySearch,
        setNewCompanyForm,
    };
};
