import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    fetchEnrollmentStatusEvents,
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

const FILTER_KEYS = Object.freeze({
    severity: 'intSeverity',
    issueType: 'intIssueType',
    status: 'intStatus',
    from: 'intFrom',
    to: 'intTo',
});

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('ky-KG');
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

    const [severityFilter, setSeverityFilter] = useState(
        searchParams.get(FILTER_KEYS.severity) || ''
    );
    const [issueTypeFilter, setIssueTypeFilter] = useState(
        searchParams.get(FILTER_KEYS.issueType) || ''
    );
    const [statusFilter, setStatusFilter] = useState(searchParams.get(FILTER_KEYS.status) || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get(FILTER_KEYS.from) || '');
    const [dateTo, setDateTo] = useState(searchParams.get(FILTER_KEYS.to) || '');

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const pairs = [
                [FILTER_KEYS.severity, severityFilter],
                [FILTER_KEYS.issueType, issueTypeFilter],
                [FILTER_KEYS.status, statusFilter],
                [FILTER_KEYS.from, dateFrom],
                [FILTER_KEYS.to, dateTo],
            ];

            pairs.forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });

            return next;
        });
    }, [dateFrom, dateTo, issueTypeFilter, setSearchParams, severityFilter, statusFilter]);

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

            const occurred = parseDate(event?.createdAt || event?.occurredAt);
            if (from && occurred && occurred < from) return false;
            if (to && occurred && occurred > to) return false;
            return true;
        });
    }, [dateFrom, dateTo, enrollmentEvents, statusFilter]);

    const criticalCount = useMemo(
        () => filteredRiskAlerts.filter((alert) => alert?.severity === RISK_SEVERITY.CRITICAL).length,
        [filteredRiskAlerts]
    );

    const clearFilters = () => {
        setSeverityFilter('');
        setIssueTypeFilter('');
        setStatusFilter('');
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
            </DashboardWorkspaceHero>

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
                                        {alert.studentId || alert.lmsStudentId || '-'}
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
                                <th className="py-2 pr-3">Жеткирүү</th>
                                <th className="py-2 pr-3">Ката</th>
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
                                        {event.studentId || event.lmsStudentId || '-'}
                                    </td>
                                    <td className="py-2 pr-3">
                                        <StatusBadge tone={statusBadgeClass(event.status)}>
                                            {event.status || '-'}
                                        </StatusBadge>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {event.lastError || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-8">
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

FilterInput.defaultProps = {
    type: 'text',
};

export default IntegrationTab;
