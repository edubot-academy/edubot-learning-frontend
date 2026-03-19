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
            return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        case RISK_SEVERITY.HIGH:
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
        case RISK_SEVERITY.MEDIUM:
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        default:
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    }
};

const statusBadgeClass = (status) => {
    switch (status) {
        case ENROLLMENT_STATUS.ACTIVE:
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
        case ENROLLMENT_STATUS.PENDING:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        case ENROLLMENT_STATUS.CANCELLED:
            return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        case ENROLLMENT_STATUS.COMPLETED:
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
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
            <div className="bg-white dark:bg-[#111111] shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                            CRM-LMS Интеграция
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                            LMSтин webhook абалы, тобокелдик жыйынтыгы жана enrollment статус окуялары.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-[#E8ECF3] disabled:opacity-60"
                    >
                        {loading ? 'Жүктөлүүдө...' : 'Жаңыртуу'}
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-[#E8ECF3]"
                        >
                            Фильтрди тазалоо
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-4">
                    <StatCard label="Бүгүнкү тобокелдик alert" value={riskSummary?.todayGenerated ?? 0} />
                    <StatCard label="Критикалык alert" value={criticalCount} />
                    <StatCard label="Каттоо окуялары" value={filteredEnrollmentEvents.length} />
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-3">
                    <StatCard label="Күтүүдөгү webhook" value={integrationHealth?.pending ?? 0} />
                    <StatCard label="Ишке ашпаган webhook" value={integrationHealth?.failed ?? 0} />
                    <StatCard label="Акыркы жөнөтүү" value={formatDateTime(integrationHealth?.lastSentAt)} />
                </div>
            </div>

            <section className="bg-white dark:bg-[#111111] shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3] mb-3">
                    Акыркы критикалык Risk Alert'тар
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-[#a6adba] border-b border-gray-100 dark:border-gray-800">
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
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs rounded-full ${riskBadgeClass(alert.severity)}`}
                                        >
                                            {alert.severity || '-'}
                                        </span>
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
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-[#a6adba]">
                                        Критикалык risk alert табылган жок.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-white dark:bg-[#111111] shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3] mb-3">
                    Каттоо статус окуялары
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-[#a6adba] border-b border-gray-100 dark:border-gray-800">
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
                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusBadgeClass(event.status)}`}>
                                            {event.status || '-'}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {event.lastError || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredEnrollmentEvents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-[#a6adba]">
                                        Каттоо окуясы табылган жок.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const FilterSelect = ({ label, value, onChange, options }) => (
    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
        <span className="block mb-1">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0E0E0E] px-3 py-2"
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
    <label className="text-sm text-gray-700 dark:text-[#E8ECF3]">
        <span className="block mb-1">{label}</span>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0E0E0E] px-3 py-2"
        />
    </label>
);

const StatCard = ({ label, value }) => (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1114] p-4">
        <div className="text-xs text-gray-500 dark:text-[#a6adba]">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">{value}</div>
    </div>
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

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default IntegrationTab;
