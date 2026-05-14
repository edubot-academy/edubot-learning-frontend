import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { myCompanies } from "@services/api";

export const useAssistantCompanyState = (user) => {
    const isAssistant = user?.role === "assistant";
    const [companies, setCompanies] = useState([]);
    const [companiesLoaded, setCompaniesLoaded] = useState(false);
    const [activeCompanyId, setActiveCompanyId] = useState(null);

    const loadCompanies = useCallback(async () => {
        if (!isAssistant) {
            setCompanies([]);
            setCompaniesLoaded(true);
            setActiveCompanyId(null);
            return;
        }

        setCompaniesLoaded(false);
        try {
            const res = await myCompanies({ page: 1, limit: 50, q: "" });
            const items = res?.items ?? [];
            setCompanies(items);
            setActiveCompanyId((currentCompanyId) => {
                if (items.length === 1) return items[0].id;
                if (items.some((company) => company.id === currentCompanyId)) return currentCompanyId;
                return null;
            });
        } catch {
            toast.error("Компанияларды жүктөөдө ката кетти");
        } finally {
            setCompaniesLoaded(true);
        }
    }, [isAssistant]);

    const activeCompany = useMemo(
        () => companies.find((company) => company.id === activeCompanyId) || null,
        [companies, activeCompanyId]
    );

    const assistantCompanyPending = isAssistant && !companiesLoaded;
    const assistantNoCompany = isAssistant && companiesLoaded && companies.length === 0;
    const assistantNeedsSelect = isAssistant && companiesLoaded && companies.length > 1 && !activeCompanyId;

    return {
        activeCompany,
        activeCompanyId,
        assistantCompanyPending,
        assistantNeedsSelect,
        assistantNoCompany,
        companies,
        companiesLoaded,
        isAssistant,
        loadCompanies,
        setActiveCompanyId,
    };
};
