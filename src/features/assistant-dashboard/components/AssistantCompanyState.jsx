import { useTranslation } from 'react-i18next';
import { DashboardWorkspaceHero, EmptyState } from '@components/ui/dashboard';
import { FiBookOpen, FiBriefcase, FiCheckCircle, FiUsers } from 'react-icons/fi';

const companyContextItems = (t) => [
    {
        icon: FiUsers,
        title: t('assistantCompanyState.context.roster.title'),
        text: t('assistantCompanyState.context.roster.text'),
    },
    {
        icon: FiBookOpen,
        title: t('assistantCompanyState.context.courses.title'),
        text: t('assistantCompanyState.context.courses.text'),
    },
    {
        icon: FiCheckCircle,
        title: t('assistantCompanyState.context.operations.title'),
        text: t('assistantCompanyState.context.operations.text'),
    },
];

const AssistantCompanyState = ({
    assistantNoCompany,
    assistantNeedsSelect,
    companies,
    activeCompanyId,
    setActiveCompanyId,
}) => {
    const { t } = useTranslation();

    if (assistantNoCompany) {
        return (
            <DashboardWorkspaceHero
                eyebrow={t('assistantCompanyState.eyebrow')}
                title={t('assistantCompanyState.noCompany.title')}
                description={t('assistantCompanyState.noCompany.description')}
            >
                <EmptyState
                    title={t('assistantCompanyState.noCompany.emptyTitle')}
                    subtitle={t('assistantCompanyState.noCompany.emptySubtitle')}
                    icon={<FiBriefcase className="h-8 w-8 text-edubot-orange" />}
                />
            </DashboardWorkspaceHero>
        );
    }

    if (assistantNeedsSelect) {
        return (
            <DashboardWorkspaceHero
                eyebrow={t('assistantCompanyState.eyebrow')}
                title={t('assistantCompanyState.select.title')}
                description={t('assistantCompanyState.select.description')}
            >
                <div className="max-w-3xl space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        {companyContextItems(t).map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-edubot-line/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-950/70"
                                >
                                    <Icon
                                        className="h-5 w-5 text-edubot-orange"
                                        aria-hidden="true"
                                    />
                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                        {item.title}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                        {item.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <label className="text-sm text-edubot-ink dark:text-white">
                        <span className="mb-2 block font-medium">
                            {t('assistantCompanyState.select.label')}
                        </span>
                        <select
                            className="dashboard-select w-full"
                            value={activeCompanyId ?? ''}
                            onChange={(e) =>
                                setActiveCompanyId(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="">{t('assistantCompanyState.select.placeholder')}</option>
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
