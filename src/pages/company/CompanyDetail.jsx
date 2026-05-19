
import React, { useContext } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getCompany } from '@services/api';
import toast from 'react-hot-toast';
import CompanyMembers from './CompanyMembers';
import CompanySettings from './CompanySettings';
import CompanyCourses from './CompanyCourses';
import { AuthContext } from '../../context/AuthContext';
import Loader from '@shared/ui/Loader';
import { isPlatformAdmin } from '@shared/utils/roles';
import { EmptyState } from '@components/ui/dashboard';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';

const TABS = [
    {
        id: 'settings',
        labelKey: 'company.detail.tabs.settings.label',
        descriptionKey: 'company.detail.tabs.settings.description',
    },
    {
        id: 'members',
        labelKey: 'company.detail.tabs.members.label',
        descriptionKey: 'company.detail.tabs.members.description',
    },
    {
        id: 'courses',
        labelKey: 'company.detail.tabs.courses.label',
        descriptionKey: 'company.detail.tabs.courses.description',
    },
];

const formatValue = (value, t) => {
    if (value === null || value === undefined || value === '') return t('company.detail.notSet');
    return value;
};

export default function CompanyDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = Number(id);
    const requestedTab = searchParams.get('tab');
    const tab = TABS.some((item) => item.id === requestedTab) ? requestedTab : 'settings';
    const [company, setCompany] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState(false);
    const { user } = useContext(AuthContext);
    const canManageCompany =
        ['owner', 'company_admin'].includes(company?.role) || isPlatformAdmin(user);

    const loadCompany = React.useCallback(async () => {
        if (!Number.isFinite(companyId)) {
            setLoadError(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError(false);
        try {
            setCompany(await getCompany(companyId));
        } catch (error) {
            setLoadError(true);
            toast.error(parseApiError(error, t('company.detail.toasts.loadError')).message);
        } finally {
            setLoading(false);
        }
    }, [companyId, t]);

    React.useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    const updateTab = (nextTab) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (nextTab === 'settings') {
                next.delete('tab');
            } else {
                next.set('tab', nextTab);
            }
            return next;
        });
    };

    if (loading) return <Loader fullScreen={true} />;

    if (loadError || !company) {
        return (
            <div className="mx-auto max-w-4xl p-4">
                <EmptyState
                    variant="error"
                    title={t('company.detail.loadErrorTitle')}
                    subtitle={t('company.detail.loadErrorSubtitle')}
                    action={{ label: t('company.detail.retry'), onClick: loadCompany }}
                />
                <div className="mt-4 text-center">
                    <Link
                        to="/companies"
                        className="text-sm font-semibold text-edubot-orange hover:underline"
                    >
                        {t('company.detail.backToCompanies')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4">
            <div className="rounded-2xl border border-edubot-line bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <Link
                            to="/companies"
                            className="text-sm font-semibold text-edubot-orange hover:underline"
                        >
                            {t('company.detail.backToCompanies')}
                        </Link>
                        <h1 className="mt-2 break-words text-2xl font-bold text-edubot-ink dark:text-white">
                            {company.name}
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-edubot-muted dark:text-slate-400">
                            {t('company.detail.subtitle')}
                        </p>
                    </div>
                    <div className="inline-flex self-start rounded-full border border-edubot-line bg-edubot-surfaceAlt px-3 py-1 text-xs font-semibold text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {canManageCompany
                            ? t('company.detail.managementAccess')
                            : t('company.detail.readOnlyAccess')}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryItem
                        label={t('company.detail.summary.role')}
                        value={formatValue(company.role, t)}
                    />
                    <SummaryItem
                        label={t('company.detail.summary.email')}
                        value={formatValue(company.email, t)}
                    />
                    <SummaryItem
                        label={t('company.detail.summary.phone')}
                        value={formatValue(company.phone, t)}
                    />
                    <SummaryItem
                        label={t('company.detail.summary.city')}
                        value={formatValue(company.city, t)}
                    />
                </div>
            </div>

            <nav aria-label={t('company.detail.tabsLabel')} className="grid gap-2 md:grid-cols-3">
                {TABS.map((item) => (
                    <Tab
                        key={item.id}
                        active={tab === item.id}
                        onClick={() => updateTab(item.id)}
                        label={t(item.labelKey)}
                        description={t(item.descriptionKey)}
                    />
                ))}
            </nav>

            {tab === 'settings' && (
                <CompanySettings
                    company={company}
                    onSaved={setCompany}
                    allowDelete={canManageCompany}
                />
            )}
            {tab === 'members' && <CompanyMembers companyId={companyId} currentUser={user} />}
            {tab === 'courses' && (
                <CompanyCourses
                    company={company}
                    companyId={companyId}
                    canManage={canManageCompany}
                />
            )}
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="rounded-xl border border-edubot-line/70 bg-edubot-surfaceAlt/50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                {label}
            </div>
            <div
                className="mt-1 truncate text-sm font-semibold text-edubot-ink dark:text-white"
                title={String(value)}
            >
                {value}
            </div>
        </div>
    );
}

function Tab({ active, onClick, label, description }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={`rounded-2xl border p-4 text-left transition ${
                active
                    ? 'border-edubot-orange bg-orange-50 text-edubot-ink shadow-sm dark:border-edubot-soft dark:bg-orange-950/20 dark:text-white'
                    : 'border-edubot-line bg-white text-edubot-ink hover:border-edubot-orange/50 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
            }`}
        >
            <span className="block text-sm font-semibold">{label}</span>
            <span className="mt-1 block text-xs text-edubot-muted dark:text-slate-400">
                {description}
            </span>
        </button>
    );
}
