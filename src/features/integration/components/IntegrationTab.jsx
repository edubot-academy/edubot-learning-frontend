import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    fetchEnrollmentStatusEvents,
    fetchIntegrationEventDetail,
    fetchIntegrationHealth,
    fetchIntegrationRiskSummary,
} from '@features/integration/api';
import { ENROLLMENT_STATUS, RISK_ISSUE_TYPE, RISK_SEVERITY } from '@shared/contracts';
import { parseApiError } from '@shared/api/error';
import {
    DashboardFilterBar,
    DashboardInsetPanel,
    DashboardMetricCard,
    EmptyState,
    StatusBadge,
    DashboardWorkspaceHero,
} from '@components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import { USERS_QUERY_KEYS } from '@features/admin/utils/adminPanel.constants';
import { getDashboardPath } from '@shared/utils/navigation';

const FILTER_KEYS = Object.freeze({
    severity: 'intSeverity',
    issueType: 'intIssueType',
    status: 'intStatus',
    quickView: 'intQuickView',
    from: 'intFrom',
    to: 'intTo',
});

const QUICK_VIEW = Object.freeze({
    ALL: 'all',
    PENDING: 'pending',
    ACTIVE: 'active',
    FAILED: 'failed',
});

const buildAdminUsersLink = (studentId) => {
    return getDashboardPath('admin', 'users', {
        [USERS_QUERY_KEYS.search]: studentId,
    });
};

const buildIntegrationQuickViewLink = (quickView) => {
    return getDashboardPath('admin', 'integration', {
        [FILTER_KEYS.quickView]: quickView && quickView !== QUICK_VIEW.ALL ? quickView : undefined,
    });
};

const copyText = async (value, label, t) => {
    if (!value || value === '-') return;
    try {
        await navigator.clipboard.writeText(String(value));
        toast.success(t('integrationTab.toasts.copied', { label }));
    } catch {
        toast.error(t('integrationTab.toasts.copyFailed', { label }));
    }
};

const formatDateTime = (value, locale = 'ky') => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ky-KG';
    return date.toLocaleString(dateLocale);
};

const getStudentIdentity = (record) => ({
    id: record?.studentId || record?.lmsStudentId || null,
    name: record?.studentName || null,
});

const renderStudentCell = (record, t) => {
    const { id, name } = getStudentIdentity(record);
    if (!id && !name) return '-';

    return (
        <div className="leading-tight">
            <div className="text-gray-700 dark:text-gray-200">
                {name || t('integrationTab.fallbacks.unknownName')}
            </div>
            {id ? (
                <div className="text-xs text-edubot-muted dark:text-slate-400">ID: {id}</div>
            ) : null}
        </div>
    );
};

const riskBadgeClass = (severity) => {
    switch (severity) {
        case RISK_SEVERITY.CRITICAL:
            return 'red';
        case RISK_SEVERITY.HIGH:
            return 'orange';
        case RISK_SEVERITY.MEDIUM:
            return 'amber';
        default:
            return 'green';
    }
};

const statusBadgeClass = (status) => {
    switch (status) {
        case ENROLLMENT_STATUS.ACTIVE:
            return 'green';
        case ENROLLMENT_STATUS.PENDING:
            return 'default';
        case ENROLLMENT_STATUS.CANCELLED:
            return 'red';
        case ENROLLMENT_STATUS.COMPLETED:
            return 'indigo';
        default:
            return 'default';
    }
};

const deliveryBadgeClass = (status) => {
    switch (status) {
        case 'sent':
            return 'green';
        case 'failed':
            return 'red';
        case 'pending':
            return 'amber';
        default:
            return 'default';
    }
};

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const riskSeverityOptions = Object.values(RISK_SEVERITY);
const riskIssueOptions = Object.values(RISK_ISSUE_TYPE);
const enrollmentStatusOptions = Object.values(ENROLLMENT_STATUS);

const translateOptionLabel = (t, namespace, value) =>
    value ? t(`integrationTab.${namespace}.${value}`, { defaultValue: value }) : '-';

const IntegrationTab = ({ companyId = null }) => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [riskAlerts, setRiskAlerts] = useState([]);
    const [enrollmentEvents, setEnrollmentEvents] = useState([]);
    const [riskSummary, setRiskSummary] = useState(null);
    const [integrationHealth, setIntegrationHealth] = useState(null);
    const [selectedEnrollmentEvent, setSelectedEnrollmentEvent] = useState(null);
    const [selectedEnrollmentEventDetail, setSelectedEnrollmentEventDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    const [severityFilter, setSeverityFilter] = useState(
        searchParams.get(FILTER_KEYS.severity) || ''
    );
    const [issueTypeFilter, setIssueTypeFilter] = useState(
        searchParams.get(FILTER_KEYS.issueType) || ''
    );
    const [statusFilter, setStatusFilter] = useState(searchParams.get(FILTER_KEYS.status) || '');
    const [quickView, setQuickView] = useState(
        searchParams.get(FILTER_KEYS.quickView) || QUICK_VIEW.ALL
    );
    const [dateFrom, setDateFrom] = useState(searchParams.get(FILTER_KEYS.from) || '');
    const [dateTo, setDateTo] = useState(searchParams.get(FILTER_KEYS.to) || '');

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const pairs = [
                [FILTER_KEYS.severity, severityFilter],
                [FILTER_KEYS.issueType, issueTypeFilter],
                [FILTER_KEYS.status, statusFilter],
                [FILTER_KEYS.quickView, quickView !== QUICK_VIEW.ALL ? quickView : ''],
                [FILTER_KEYS.from, dateFrom],
                [FILTER_KEYS.to, dateTo],
            ];

            pairs.forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });

            return next;
        });
    }, [
        dateFrom,
        dateTo,
        issueTypeFilter,
        quickView,
        setSearchParams,
        severityFilter,
        statusFilter,
    ]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [riskSummaryResponse, eventResponse, healthResponse] = await Promise.all([
                fetchIntegrationRiskSummary(),
                fetchEnrollmentStatusEvents({ page: 1, limit: 100, companyId }),
                fetchIntegrationHealth(),
            ]);

            setRiskSummary(riskSummaryResponse || null);
            setRiskAlerts(riskSummaryResponse?.recentCriticalAlerts || []);
            setEnrollmentEvents(eventResponse?.items || []);
            setIntegrationHealth(healthResponse?.queue || null);
        } catch (error) {
            toast.error(
                parseApiError(error, t('integrationTab.toasts.loadFailed')).message
            );
        } finally {
            setLoading(false);
        }
    }, [companyId, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        let mounted = true;

        if (!selectedEnrollmentEvent?.id) {
            setSelectedEnrollmentEventDetail(null);
            setDetailLoading(false);
            setDetailError('');
            return () => {
                mounted = false;
            };
        }

        setDetailLoading(true);
        setDetailError('');
        fetchIntegrationEventDetail(selectedEnrollmentEvent.id)
            .then((detail) => {
                if (!mounted) return;
                setSelectedEnrollmentEventDetail(detail || null);
            })
            .catch((error) => {
                if (!mounted) return;
                const parsed = parseApiError(
                    error,
                    t('integrationTab.toasts.detailLoadFailed')
                );
                setDetailError(parsed.message);
                setSelectedEnrollmentEventDetail(null);
            })
            .finally(() => {
                if (mounted) {
                    setDetailLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [selectedEnrollmentEvent, t]);

    const filteredRiskAlerts = useMemo(() => {
        const from = parseDate(dateFrom);
        const to = parseDate(dateTo);

        return riskAlerts.filter((alert) => {
            if (severityFilter && alert?.severity !== severityFilter) return false;
            if (issueTypeFilter && alert?.issueType !== issueTypeFilter) return false;

            const occurred = parseDate(alert?.createdAt || alert?.occurredAt);
            if (from && occurred && occurred < from) return false;
            if (to && occurred && occurred > to) return false;
            return true;
        });
    }, [dateFrom, dateTo, issueTypeFilter, riskAlerts, severityFilter]);

    const filteredEnrollmentEvents = useMemo(() => {
        const from = parseDate(dateFrom);
        const to = parseDate(dateTo);

        return enrollmentEvents.filter((event) => {
            if (statusFilter && event?.enrollmentStatus !== statusFilter) return false;
            if (
                quickView === QUICK_VIEW.PENDING &&
                event?.enrollmentStatus !== ENROLLMENT_STATUS.PENDING
            ) {
                return false;
            }
            if (
                quickView === QUICK_VIEW.ACTIVE &&
                event?.enrollmentStatus !== ENROLLMENT_STATUS.ACTIVE
            ) {
                return false;
            }
            if (quickView === QUICK_VIEW.FAILED && event?.status !== 'failed') {
                return false;
            }

            const occurred = parseDate(event?.createdAt || event?.occurredAt);
            if (from && occurred && occurred < from) return false;
            if (to && occurred && occurred > to) return false;
            return true;
        });
    }, [dateFrom, dateTo, enrollmentEvents, quickView, statusFilter]);

    const criticalCount = useMemo(
        () =>
            filteredRiskAlerts.filter((alert) => alert?.severity === RISK_SEVERITY.CRITICAL).length,
        [filteredRiskAlerts]
    );

    const pendingEnrollmentEvents = useMemo(
        () =>
            filteredEnrollmentEvents.filter(
                (event) => event?.enrollmentStatus === ENROLLMENT_STATUS.PENDING
            ),
        [filteredEnrollmentEvents]
    );

    const failedEnrollmentDispatchCount = useMemo(
        () => filteredEnrollmentEvents.filter((event) => event?.status === 'failed').length,
        [filteredEnrollmentEvents]
    );

    const clearFilters = () => {
        setSeverityFilter('');
        setIssueTypeFilter('');
        setStatusFilter('');
        setQuickView(QUICK_VIEW.ALL);
        setDateFrom('');
        setDateTo('');
    };

    return (
        <div className="space-y-6">
                <DashboardWorkspaceHero
                eyebrow={t('integrationTab.hero.eyebrow')}
                title={t('integrationTab.hero.title')}
                description={t('integrationTab.hero.description')}
                action={
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="dashboard-button-secondary disabled:opacity-60"
                    >
                        {loading ? t('common.loading') : t('common.refresh')}
                    </button>
                }
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-3">
                    <FilterSelect
                        label={t('integrationTab.filters.severity')}
                        value={severityFilter}
                        onChange={setSeverityFilter}
                        options={riskSeverityOptions}
                        labelForOption={(option) => translateOptionLabel(t, 'riskSeverity', option)}
                    />
                    <FilterSelect
                        label={t('integrationTab.filters.issueType')}
                        value={issueTypeFilter}
                        onChange={setIssueTypeFilter}
                        options={riskIssueOptions}
                        labelForOption={(option) => translateOptionLabel(t, 'riskIssueType', option)}
                    />
                    <FilterSelect
                        label={t('integrationTab.filters.enrollmentStatus')}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={enrollmentStatusOptions}
                        labelForOption={(option) => translateOptionLabel(t, 'enrollmentStatus', option)}
                    />
                    <FilterInput
                        label={t('integrationTab.filters.from')}
                        value={dateFrom}
                        onChange={setDateFrom}
                        type="datetime-local"
                    />
                    <FilterInput
                        label={t('integrationTab.filters.to')}
                        value={dateTo}
                        onChange={setDateTo}
                        type="datetime-local"
                    />
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="dashboard-button-secondary w-full justify-center"
                        >
                            {t('common.clearFilters')}
                        </button>
                    </div>
                </DashboardFilterBar>

                <div className="grid gap-4 mt-5 md:grid-cols-3">
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.riskToday')}
                        value={riskSummary?.todayGenerated ?? 0}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.criticalAlerts')}
                        value={criticalCount}
                        tone={criticalCount ? 'red' : 'default'}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.enrollmentEvents')}
                        value={filteredEnrollmentEvents.length}
                        tone={filteredEnrollmentEvents.length ? 'blue' : 'default'}
                    />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-3">
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.pendingWebhook')}
                        value={integrationHealth?.pending ?? 0}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.failedWebhook')}
                        value={integrationHealth?.failed ?? 0}
                        tone={(integrationHealth?.failed ?? 0) ? 'amber' : 'green'}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.lastSent')}
                        value={formatDateTime(integrationHealth?.lastSentAt, i18n.language)}
                    />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-3">
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.pendingCrmEnrollments')}
                        value={pendingEnrollmentEvents.length}
                        tone={pendingEnrollmentEvents.length ? 'amber' : 'default'}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.dispatchErrors')}
                        value={failedEnrollmentDispatchCount}
                        tone={failedEnrollmentDispatchCount ? 'red' : 'green'}
                    />
                    <DashboardMetricCard
                        label={t('integrationTab.metrics.lastPendingEnrollment')}
                        value={formatDateTime(
                            pendingEnrollmentEvents[0]?.createdAt ||
                                pendingEnrollmentEvents[0]?.occurredAt,
                            i18n.language
                        )}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <QuickFilterButton
                        label={t('common.all')}
                        active={quickView === QUICK_VIEW.ALL}
                        onClick={() => setQuickView(QUICK_VIEW.ALL)}
                    />
                    <QuickFilterButton
                        label={t('integrationTab.quickViews.pending')}
                        active={quickView === QUICK_VIEW.PENDING}
                        onClick={() => setQuickView(QUICK_VIEW.PENDING)}
                    />
                    <QuickFilterButton
                        label={t('integrationTab.quickViews.active')}
                        active={quickView === QUICK_VIEW.ACTIVE}
                        onClick={() => setQuickView(QUICK_VIEW.ACTIVE)}
                    />
                    <QuickFilterButton
                        label={t('integrationTab.quickViews.failedDispatch')}
                        active={quickView === QUICK_VIEW.FAILED}
                        onClick={() => setQuickView(QUICK_VIEW.FAILED)}
                    />
                </div>
            </DashboardWorkspaceHero>

            <DashboardInsetPanel
                title={t('integrationTab.sections.pending.title')}
                description={t('integrationTab.sections.pending.description')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">{t('integrationTab.table.time')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.enrollment')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.student')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.crmLead')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.access')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.dispatch')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.note')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingEnrollmentEvents.map((event) => (
                                <tr
                                    key={`pending-${event.eventId || event.id}`}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {formatDateTime(event.createdAt || event.occurredAt, i18n.language)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.enrollmentId || event.lmsEnrollmentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(event, t)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.crmLeadId || '-'}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.accessStatus)}>
                                            {translateOptionLabel(t, 'accessStatus', event.accessStatus || 'locked')}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={deliveryBadgeClass(event.status)}>
                                            {translateOptionLabel(t, 'dispatchStatus', event.status)}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {event.reason || event.lastError || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEnrollmentEvent(event)}
                                            className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                        >
                                            {t('integrationTab.actions.viewDetails')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState
                                            title={t('integrationTab.empty.pending.title')}
                                            subtitle={t('integrationTab.empty.pending.subtitle')}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('integrationTab.sections.risk.title')}
                description={t('integrationTab.sections.risk.description')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">{t('integrationTab.table.time')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.severity')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.lmsStudent')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.enrollment')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.crmLead')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.summary')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRiskAlerts.map((alert) => (
                                <tr
                                    key={
                                        alert.eventId || `${alert.enrollmentId}-${alert.createdAt}`
                                    }
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {formatDateTime(alert.createdAt || alert.occurredAt, i18n.language)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={riskBadgeClass(alert.severity)}>
                                            {translateOptionLabel(t, 'riskSeverity', alert.severity)}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(alert, t)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {alert.enrollmentId || alert.lmsEnrollmentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {alert.crmLeadId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {alert.summary || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredRiskAlerts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-8">
                                        <EmptyState
                                            title={t('integrationTab.empty.risk.title')}
                                            subtitle={t('integrationTab.empty.risk.subtitle')}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('integrationTab.sections.events.title')}
                description={t('integrationTab.sections.events.description')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">{t('integrationTab.table.time')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.eventId')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.enrollment')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.student')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.enrollmentStatus')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.access')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.dispatch')}</th>
                                <th className="py-2 pr-3">{t('integrationTab.table.error')}</th>
                                <th className="py-2 pr-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEnrollmentEvents.map((event) => (
                                <tr
                                    key={event.eventId || `${event.id}-${event.createdAt}`}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {formatDateTime(event.createdAt || event.occurredAt, i18n.language)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.eventId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.enrollmentId || event.lmsEnrollmentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(event, t)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge
                                            tone={statusBadgeClass(event.enrollmentStatus)}
                                        >
                                            {translateOptionLabel(t, 'enrollmentStatus', event.enrollmentStatus)}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.accessStatus)}>
                                            {translateOptionLabel(t, 'accessStatus', event.accessStatus)}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={deliveryBadgeClass(event.status)}>
                                            {translateOptionLabel(t, 'dispatchStatus', event.status)}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {event.lastError || event.reason || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEnrollmentEvent(event)}
                                            className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                        >
                                            {t('integrationTab.actions.viewDetails')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={9} className="py-8">
                                        <EmptyState
                                            title={t('integrationTab.empty.events.title')}
                                            subtitle={t('integrationTab.empty.events.subtitle')}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardInsetPanel>

            <EnrollmentEventDetailModal
                event={selectedEnrollmentEvent}
                detail={selectedEnrollmentEventDetail}
                loading={detailLoading}
                error={detailError}
                onClose={() => setSelectedEnrollmentEvent(null)}
                locale={i18n.language}
            />
        </div>
    );
};

const FilterSelect = ({ label, value, onChange, options, labelForOption }) => {
    const { t } = useTranslation();
    return (
    <label className="text-sm text-edubot-ink dark:text-white">
        <span className="block mb-1">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-select w-full"
        >
            <option value="">{t('common.all')}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {labelForOption(option)}
                </option>
            ))}
        </select>
    </label>
    );
};

const FilterInput = ({ label, value, onChange, type }) => (
    <label className="text-sm text-edubot-ink dark:text-white">
        <span className="block mb-1">{label}</span>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-field w-full"
        />
    </label>
);

const QuickFilterButton = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            active
                ? 'bg-orange-500 text-white'
                : 'border border-edubot-line/80 bg-white text-edubot-ink hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
    >
        {label}
    </button>
);

IntegrationTab.propTypes = {
    companyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

FilterSelect.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    labelForOption: PropTypes.func,
};

FilterInput.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
};

QuickFilterButton.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};

FilterInput.defaultProps = {
    type: 'text',
};

QuickFilterButton.defaultProps = {
    active: false,
};

const EnrollmentEventDetailModal = ({ event, detail, loading, error, onClose, locale }) => {
    const { t } = useTranslation();
    return (
    <BasicModal
        isOpen={Boolean(event)}
        onClose={onClose}
        title={t('integrationTab.detail.title')}
        size="lg"
    >
        {event ? (
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField
                        label={t('integrationTab.detail.eventTime')}
                        value={formatDateTime(event.createdAt || event.occurredAt, locale)}
                    />
                    <DetailField label={t('integrationTab.table.eventId')} value={event.eventId || '-'} />
                    <DetailField
                        label={t('integrationTab.detail.lmsEnrollment')}
                        value={event.enrollmentId || event.lmsEnrollmentId || '-'}
                        copyLabel={t('integrationTab.detail.lmsEnrollmentId')}
                    />
                    <DetailField
                        label={t('integrationTab.detail.studentName')}
                        value={event.studentName || detail?.studentName || '-'}
                    />
                    <DetailField
                        label={t('integrationTab.table.lmsStudent')}
                        value={event.studentId || event.lmsStudentId || '-'}
                        copyLabel={t('integrationTab.detail.lmsStudentId')}
                    />
                    <DetailField
                        label={t('integrationTab.table.crmLead')}
                        value={event.crmLeadId || '-'}
                        copyLabel={t('integrationTab.detail.crmLeadId')}
                    />
                    <DetailField
                        label={t('integrationTab.table.enrollmentStatus')}
                        value={translateOptionLabel(t, 'enrollmentStatus', event.enrollmentStatus)}
                    />
                    <DetailField
                        label={t('integrationTab.table.access')}
                        value={translateOptionLabel(t, 'accessStatus', event.accessStatus)}
                    />
                    <DetailField
                        label={t('integrationTab.detail.dispatchStatus')}
                        value={translateOptionLabel(t, 'dispatchStatus', event.status)}
                    />
                    <DetailField label={t('integrationTab.table.error')} value={event.lastError || '-'} />
                    <DetailField label={t('integrationTab.table.note')} value={event.reason || '-'} />
                </div>

                {loading ? (
                    <div className="rounded-xl border border-edubot-line/80 bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {t('integrationTab.detail.loadingPayload')}
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {detail?.payload ? (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                            {t('integrationTab.detail.webhookPayload')}
                        </p>
                        <pre className="max-h-72 overflow-auto rounded-xl border border-edubot-line/80 bg-slate-950 px-4 py-3 text-xs text-slate-100">
                            {JSON.stringify(detail.payload, null, 2)}
                        </pre>
                    </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                    <Link
                        to={buildAdminUsersLink(event.studentId || event.lmsStudentId)}
                        className="dashboard-button-secondary"
                    >
                        {t('integrationTab.actions.openUserCard')}
                    </Link>
                    <Link
                        to={buildIntegrationQuickViewLink(
                            event.enrollmentStatus === ENROLLMENT_STATUS.PENDING
                                ? QUICK_VIEW.PENDING
                                : event.enrollmentStatus === ENROLLMENT_STATUS.ACTIVE
                                  ? QUICK_VIEW.ACTIVE
                                  : event.status === 'failed'
                                    ? QUICK_VIEW.FAILED
                                    : QUICK_VIEW.ALL
                        )}
                        className="dashboard-button-secondary"
                    >
                        {t('integrationTab.actions.openWithFilter')}
                    </Link>
                </div>
            </div>
        ) : null}
    </BasicModal>
    );
};

const DetailField = ({ label, value, copyLabel }) => {
    const { t } = useTranslation();
    return (
    <div className="rounded-xl border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                    {label}
                </p>
                <p className="mt-1 text-sm font-medium text-edubot-ink dark:text-white break-all">
                    {value}
                </p>
            </div>
            {copyLabel && value && value !== '-' ? (
                <button
                    type="button"
                    onClick={() => copyText(value, copyLabel, t)}
                    className="shrink-0 rounded-lg border border-edubot-line/80 px-2 py-1 text-xs font-medium text-edubot-ink transition-colors hover:bg-orange-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    {t('common.copy')}
                </button>
            ) : null}
        </div>
    </div>
    );
};

EnrollmentEventDetailModal.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        createdAt: PropTypes.string,
        occurredAt: PropTypes.string,
        eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        enrollmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lmsEnrollmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lmsStudentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        studentName: PropTypes.string,
        crmLeadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        enrollmentStatus: PropTypes.string,
        accessStatus: PropTypes.string,
        status: PropTypes.string,
        lastError: PropTypes.string,
        reason: PropTypes.string,
    }),
    detail: PropTypes.shape({
        studentName: PropTypes.string,
        payload: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    }),
    loading: PropTypes.bool,
    error: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    locale: PropTypes.string,
};

EnrollmentEventDetailModal.defaultProps = {
    event: null,
    detail: null,
    loading: false,
    error: '',
    locale: 'ky',
};

DetailField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    copyLabel: PropTypes.string,
};

DetailField.defaultProps = {
    copyLabel: '',
};

FilterSelect.defaultProps = {
    labelForOption: (option) => option,
};

export default IntegrationTab;
