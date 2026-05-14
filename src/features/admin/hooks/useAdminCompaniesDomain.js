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
import { isForbiddenError } from '@shared/api/error';

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
                toast.error('Компанияларды жүктөөдө ката кетти');
            }
        }
    }, [companyPage, companySearch]);

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
                toast.success('Tenant ийгиликтүү кошулду');
                return created;
            } catch {
                toast.error('Tenant кошууда ката кетти');
                return null;
            }
        },
        [newCompanyForm]
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
                        company.id === companyId ? { ...company, ...updated, ...crmUpdate } : company
                    )
                );
                toast.success('Tenant ийгиликтүү жаңыртылды');
            } catch {
                toast.error('Tenant жаңыртууда ката кетти');
            }
        },
        [companies]
    );

    const handleDeleteCompany = useCallback(
        async (companyId) => {
            requestConfirmation({
                title: 'Компанияны өчүрүү',
                message: 'Бул компанияны өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCompany(companyId);
                        setCompanies((prev) => prev.filter((company) => company.id !== companyId));
                        toast.success('Компания ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('Компанияны өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
    );

    const handleAssignCourseToCompany = useCallback(
        async (courseId, companyId) => {
            try {
                await assignCourseToCompany(courseId, companyId);
                toast.success('Курс компанияга ийгиликтүү таанды');
                loadCoursesAndCategories();
            } catch {
                toast.error('Курс таандоодо ката кетти');
            }
        },
        [loadCoursesAndCategories]
    );

    const handleUnassignCourseFromCompany = useCallback(
        async (courseId, companyId) => {
            try {
                await unassignCourseFromCompany(courseId, companyId);
                toast.success('Курс компаниядан ийгиликтүү алынды');
                loadCoursesAndCategories();
            } catch {
                toast.error('Курс алындоодо ката кетти');
            }
        },
        [loadCoursesAndCategories]
    );

    const handleClearCourseCompany = useCallback(
        async (courseId) => {
            requestConfirmation({
                title: 'Компания байланыштарын тазалоо',
                message: 'Бул курстун бардык компания таандоолорун алырга ишенимдүүсүзбү?',
                confirmLabel: 'Тазалоо',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await clearCourseCompany(courseId);
                        toast.success('Курстун компания таандоолору тазаланды');
                        loadCoursesAndCategories();
                    } catch {
                        toast.error('Компания таандоолорду тазалоодо ката кетти');
                    }
                },
            });
        },
        [loadCoursesAndCategories, requestConfirmation]
    );

    const handleUploadCompanyLogo = useCallback(
        async (companyId, file) => {
            if (!file) {
                toast.error('Файл тандаңыз');
                return;
            }

            try {
                await uploadCompanyLogo(companyId, file);
                toast.success('Компания логотипи ийгиликтүү жүктөлдү');
                loadCompanies();
            } catch {
                toast.error('Логотип жүктөөдө ката кетти');
            }
        },
        [loadCompanies]
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
