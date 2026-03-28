import {
    DashboardWorkspaceHero,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBriefcase } from 'react-icons/fi';

const AssistantCompanyState = ({
    assistantNoCompany,
    assistantNeedsSelect,
    companies,
    activeCompanyId,
    setActiveCompanyId,
}) => {
    if (assistantNoCompany) {
        return (
            <DashboardWorkspaceHero
                eyebrow="Assistant access"
                title="Компания дайындалган эмес"
                description="Сиз азырынча эч бир компанияга байланыштырылган жоксуз. Иштей баштоо үчүн администраторго же компания жетекчисине кайрылыңыз."
            >
                <EmptyState
                    title="Компания байланышы керек"
                    subtitle="Ассистент катары курстарды жана студенттерди көрүү үчүн сизге компания дайындалышы керек."
                    icon={<FiBriefcase className="h-8 w-8 text-edubot-orange" />}
                />
            </DashboardWorkspaceHero>
        );
    }

    if (assistantNeedsSelect) {
        return (
            <DashboardWorkspaceHero
                eyebrow="Assistant access"
                title="Компанияны тандаңыз"
                description="Сиз бир нече компанияга байланыштырылгансыз. Кайсы компания менен иштей турганыңызды тандаңыз."
            >
                <div className="max-w-xl">
                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-2 block font-medium">Компания</span>
                        <select
                            className="dashboard-select w-full"
                            value={activeCompanyId ?? ''}
                            onChange={(e) => setActiveCompanyId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">-- Компанияны тандаңыз --</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                    {company.role ? ` · ${company.role}` : ''}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </DashboardWorkspaceHero>
        );
    }

    return null;
};

export default AssistantCompanyState;
