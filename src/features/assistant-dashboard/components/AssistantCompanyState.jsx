
import { DashboardWorkspaceHero, EmptyState } from '@components/ui/dashboard';
import { FiBookOpen, FiBriefcase, FiCheckCircle, FiUsers } from 'react-icons/fi';

const companyContextItems = [
    {
        icon: FiUsers,
        title: 'Student roster',
        text: 'Student search, enrollment actions, and attendance context are scoped to the selected tenant.',
    },
    {
        icon: FiBookOpen,
        title: 'Course access',
        text: 'Course load and assignment tools use the tenant selection to avoid cross-company changes.',
    },
    {
        icon: FiCheckCircle,
        title: 'Daily operations',
        text: 'Pick the tenant you are helping today before changing enrollments or checking attendance.',
    },
];

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
                title="No tenant assigned"
                description="Your assistant account is not connected to a tenant yet. Ask a platform admin or tenant admin to add you before working with students and courses."
            >
                <EmptyState
                    title="Tenant access is required"
                    subtitle="Assistant tools are tenant-scoped so student, course, and attendance actions stay inside the right company workspace."
                    icon={<FiBriefcase className="h-8 w-8 text-edubot-orange" />}
                />
            </DashboardWorkspaceHero>
        );
    }

    if (assistantNeedsSelect) {
        return (
            <DashboardWorkspaceHero
                eyebrow="Assistant access"
                title="Choose a tenant workspace"
                description="You are connected to multiple tenants. Select the company context before reviewing students, attendance, or enrollments."
            >
                <div className="max-w-3xl space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        {companyContextItems.map((item) => {
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
                        <span className="mb-2 block font-medium">Tenant workspace</span>
                        <select
                            className="dashboard-select w-full"
                            value={activeCompanyId ?? ''}
                            onChange={(e) =>
                                setActiveCompanyId(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="">Select a tenant</option>
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
