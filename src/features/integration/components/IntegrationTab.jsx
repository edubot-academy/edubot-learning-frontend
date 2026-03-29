import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    if (!studentId) return '/admin?tab=users';
    const params = new URLSearchParams({
        tab: 'users',
        [USERS_QUERY_KEYS.search]: String(studentId),
    });
    return `/admin?${params.toString()}`;
};

const buildIntegrationQuickViewLink = (quickView) => {
    const params = new URLSearchParams({ tab: 'integration' });
    if (quickView && quickView !== QUICK_VIEW.ALL) {
        params.set(FILTER_KEYS.quickView, quickView);
    }
    return `/admin?${params.toString()}`;
};

const copyText = async (value, label) => {
    if (!value || value === '-') return;
    try {
        await navigator.clipboard.writeText(String(value));
        toast.success(`${label} көчүрүлдү`);
    } catch {
        toast.error(`${label} көчүрүү мүмкүн болгон жок`);
    }
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('ky-KG');
};

const getStudentIdentity = (record) => ({
    id: record?.studentId || record?.lmsStudentId || null,
    name: record?.studentName || null,
});

const renderStudentCell = (record) => {
    const { id, name } = getStudentIdentity(record);
    if (!id && !name) return '-';

    return (
        <div className="leading-tight">
            <div className="text-gray-700 dark:text-gray-200">{name || 'Аты белгисиз'}</div>
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

const IntegrationTab = ({ companyId = null }) => {
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
    }, [dateFrom, dateTo, issueTypeFilter, quickView, setSearchParams, severityFilter, statusFilter]);

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
            toast.error(parseApiError(error, 'Интеграция маалыматы жүктөлгөн жок'));
        } finally {
            setLoading(false);
        }
    }, [companyId]);

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
                const parsed = parseApiError(error, 'Окуянын толук маалыматын жүктөө мүмкүн болгон жок');
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
    }, [selectedEnrollmentEvent]);

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
        () => filteredRiskAlerts.filter((alert) => alert?.severity === RISK_SEVERITY.CRITICAL).length,
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
        () =>
            filteredEnrollmentEvents.filter((event) => event?.status === 'failed').length,
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
                eyebrow="CRM and LMS sync"
                title="CRM-LMS Интеграция"
                description="Webhook абалы, тобокелдик жыйынтыгы жана enrollment статус окуялары."
                action={(
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="dashboard-button-secondary disabled:opacity-60"
                    >
                        {loading ? 'Жүктөлүүдө...' : 'Жаңыртуу'}
                    </button>
                )}
            >
                <DashboardFilterBar gridClassName="lg:grid-cols-3">
                    <FilterSelect
                        label="Деңгээл"
                        value={severityFilter}
                        onChange={setSeverityFilter}
                        options={riskSeverityOptions}
                    />
                    <FilterSelect
                        label="Тобокелдик түрү"
                        value={issueTypeFilter}
                        onChange={setIssueTypeFilter}
                        options={riskIssueOptions}
                    />
                    <FilterSelect
                        label="Каттоо статусу"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={enrollmentStatusOptions}
                    />
                    <FilterInput
                        label="Күндөн"
                        value={dateFrom}
                        onChange={setDateFrom}
                        type="datetime-local"
                    />
                    <FilterInput
                        label="Күнгө чейин"
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
                            Фильтрди тазалоо
                        </button>
                    </div>
                </DashboardFilterBar>

                <div className="grid gap-4 mt-5 md:grid-cols-3">
                    <DashboardMetricCard label="Бүгүнкү тобокелдик эскертмеси" value={riskSummary?.todayGenerated ?? 0} />
                    <DashboardMetricCard label="Критикалык эскертме" value={criticalCount} tone={criticalCount ? 'red' : 'default'} />
                    <DashboardMetricCard label="Каттоо окуялары" value={filteredEnrollmentEvents.length} tone={filteredEnrollmentEvents.length ? 'blue' : 'default'} />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-3">
                    <DashboardMetricCard label="Күтүүдөгү вебхук" value={integrationHealth?.pending ?? 0} />
                    <DashboardMetricCard label="Ишке ашпаган вебхук" value={integrationHealth?.failed ?? 0} tone={(integrationHealth?.failed ?? 0) ? 'amber' : 'green'} />
                    <DashboardMetricCard label="Акыркы жөнөтүү" value={formatDateTime(integrationHealth?.lastSentAt)} />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-3">
                    <DashboardMetricCard
                        label="Күтүүдөгү CRM каттоолор"
                        value={pendingEnrollmentEvents.length}
                        tone={pendingEnrollmentEvents.length ? 'amber' : 'default'}
                    />
                    <DashboardMetricCard
                        label="Каттоо жөнөтүү каталары"
                        value={failedEnrollmentDispatchCount}
                        tone={failedEnrollmentDispatchCount ? 'red' : 'green'}
                    />
                    <DashboardMetricCard
                        label="Акыркы pending каттоо"
                        value={formatDateTime(pendingEnrollmentEvents[0]?.createdAt || pendingEnrollmentEvents[0]?.occurredAt)}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <QuickFilterButton
                        label="Баары"
                        active={quickView === QUICK_VIEW.ALL}
                        onClick={() => setQuickView(QUICK_VIEW.ALL)}
                    />
                    <QuickFilterButton
                        label="Pending"
                        active={quickView === QUICK_VIEW.PENDING}
                        onClick={() => setQuickView(QUICK_VIEW.PENDING)}
                    />
                    <QuickFilterButton
                        label="Active"
                        active={quickView === QUICK_VIEW.ACTIVE}
                        onClick={() => setQuickView(QUICK_VIEW.ACTIVE)}
                    />
                    <QuickFilterButton
                        label="Failed Dispatch"
                        active={quickView === QUICK_VIEW.FAILED}
                        onClick={() => setQuickView(QUICK_VIEW.FAILED)}
                    />
                </div>
            </DashboardWorkspaceHero>

            <DashboardInsetPanel
                title="Күтүүдөгү CRM каттоолору"
                description="LMS ичинде pending абалда турган жана CRMге жөнөтүлгөн enrollment окуялары."
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">Убакыт</th>
                                <th className="py-2 pr-3">Каттоо</th>
                                <th className="py-2 pr-3">Студент</th>
                                <th className="py-2 pr-3">CRM лид</th>
                                <th className="py-2 pr-3">Жеткиликтүүлүк</th>
                                <th className="py-2 pr-3">Жөнөтүү</th>
                                <th className="py-2 pr-3">Эскертүү</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingEnrollmentEvents.map((event) => (
                                <tr
                                    key={`pending-${event.eventId || event.id}`}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {formatDateTime(event.createdAt || event.occurredAt)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.enrollmentId || event.lmsEnrollmentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(event)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.crmLeadId || '-'}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.accessStatus)}>
                                            {event.accessStatus || 'locked'}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={deliveryBadgeClass(event.status)}>
                                            {event.status || '-'}
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
                                            Толук көрүү
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="py-8">
                                        <EmptyState
                                            title="Pending CRM каттоолору табылган жок"
                                            subtitle="Учурда CRMден келген күтүүдөгү enrollment көрүнбөйт."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Акыркы критикалык тобокелдик эскертмелери"
                description="LMS жана CRM ортосундагы олуттуу бузулуулар."
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">Убакыт</th>
                                <th className="py-2 pr-3">Деңгээл</th>
                                <th className="py-2 pr-3">LMS студент</th>
                                <th className="py-2 pr-3">Каттоо</th>
                                <th className="py-2 pr-3">CRM лид</th>
                                <th className="py-2 pr-3">Кыскача</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRiskAlerts.map((alert) => (
                                <tr
                                    key={alert.eventId || `${alert.enrollmentId}-${alert.createdAt}`}
                                    className="border-b border-gray-50 dark:border-gray-900"
                                >
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {formatDateTime(alert.createdAt || alert.occurredAt)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={riskBadgeClass(alert.severity)}>
                                            {alert.severity || '-'}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(alert)}
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
                                            title="Критикалык тобокелдик эскертмеси табылган жок"
                                            subtitle="Фильтрлерге туура келген олуттуу эскертмелер жок."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title="Каттоо статус окуялары"
                description="Webhook аркылуу келген enrollment абал тарыхы."
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-edubot-muted dark:text-slate-400 border-b border-edubot-line/80 dark:border-slate-700">
                                <th className="py-2 pr-3">Убакыт</th>
                                <th className="py-2 pr-3">Окуя ID</th>
                                <th className="py-2 pr-3">Каттоо</th>
                                <th className="py-2 pr-3">Студент</th>
                                <th className="py-2 pr-3">Каттоо статусу</th>
                                <th className="py-2 pr-3">Жеткиликтүүлүк</th>
                                <th className="py-2 pr-3">Жөнөтүү</th>
                                <th className="py-2 pr-3">Ката</th>
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
                                        {formatDateTime(event.createdAt || event.occurredAt)}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.eventId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {event.enrollmentId || event.lmsEnrollmentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">
                                        {renderStudentCell(event)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.enrollmentStatus)}>
                                            {event.enrollmentStatus || '-'}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.accessStatus)}>
                                            {event.accessStatus || '-'}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={deliveryBadgeClass(event.status)}>
                                            {event.status || '-'}
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
                                            Толук көрүү
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={9} className="py-8">
                                        <EmptyState
                                            title="Каттоо окуясы табылган жок"
                                            subtitle="Фильтрлерге туура келген enrollment окуялары жок."
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
            />
        </div>
    );
};

const FilterSelect = ({ label, value, onChange, options }) => (
    <label className="text-sm text-edubot-ink dark:text-white">
        <span className="block mb-1">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-select w-full"
        >
            <option value="">Баары</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </label>
);

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

const EnrollmentEventDetailModal = ({ event, detail, loading, error, onClose }) => (
    <BasicModal
        isOpen={Boolean(event)}
        onClose={onClose}
        title="Каттоо окуясынын толук маалыматы"
        size="lg"
    >
        {event ? (
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField label="Окуя убактысы" value={formatDateTime(event.createdAt || event.occurredAt)} />
                    <DetailField label="Окуя ID" value={event.eventId || '-'} />
                    <DetailField
                        label="LMS каттоо"
                        value={event.enrollmentId || event.lmsEnrollmentId || '-'}
                        copyLabel="LMS каттоо ID"
                    />
                    <DetailField
                        label="Студенттин аты"
                        value={event.studentName || detail?.studentName || '-'}
                    />
                    <DetailField
                        label="LMS студент"
                        value={event.studentId || event.lmsStudentId || '-'}
                        copyLabel="LMS студент ID"
                    />
                    <DetailField
                        label="CRM лид"
                        value={event.crmLeadId || '-'}
                        copyLabel="CRM лид ID"
                    />
                    <DetailField label="Каттоо статусу" value={event.enrollmentStatus || '-'} />
                    <DetailField label="Жеткиликтүүлүк" value={event.accessStatus || '-'} />
                    <DetailField label="Жөнөтүү статусу" value={event.status || '-'} />
                    <DetailField label="Ката" value={event.lastError || '-'} />
                    <DetailField label="Эскертүү" value={event.reason || '-'} />
                </div>

                {loading ? (
                    <div className="rounded-xl border border-edubot-line/80 bg-white px-4 py-3 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        Толук payload жүктөлүүдө...
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {detail?.payload ? (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-edubot-ink dark:text-white">Webhook payload</p>
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
                        Колдонуучу картасын ачуу
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
                        Туура фильтр менен ачуу
                    </Link>
                </div>
            </div>
        ) : null}
    </BasicModal>
);

const DetailField = ({ label, value, copyLabel }) => (
    <div className="rounded-xl border border-edubot-line/80 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-edubot-muted dark:text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-medium text-edubot-ink dark:text-white break-all">{value}</p>
            </div>
            {copyLabel && value && value !== '-' ? (
                <button
                    type="button"
                    onClick={() => copyText(value, copyLabel)}
                    className="shrink-0 rounded-lg border border-edubot-line/80 px-2 py-1 text-xs font-medium text-edubot-ink transition-colors hover:bg-orange-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Көчүрүү
                </button>
            ) : null}
        </div>
    </div>
);

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
};

EnrollmentEventDetailModal.defaultProps = {
    event: null,
    detail: null,
    loading: false,
    error: '',
};

DetailField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    copyLabel: PropTypes.string,
};

DetailField.defaultProps = {
    copyLabel: '',
};

export default IntegrationTab;
