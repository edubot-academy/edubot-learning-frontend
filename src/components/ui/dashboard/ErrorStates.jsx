import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiWifiOff, FiLock, FiRefreshCw, FiHome, FiSettings } from 'react-icons/fi';

/**
 * DashboardErrorState - General error state for dashboard sections
 * Used across all dashboards for various error scenarios
 */
const DashboardErrorState = ({
    title,
    message,
    onRetry = null,
    retryText,
    showHomeButton = false,
    onHome = null
}) => {
    const { t } = useTranslation();
    const resolvedTitle = title || t('dashboardErrorStates.general.title');
    const resolvedMessage = message || t('dashboardErrorStates.general.message');
    const resolvedRetryText = retryText || t('dashboardErrorStates.actions.retry');

    return (
        <div className="text-center py-12">
            {/* Error icon container */}
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
                <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            {/* Error content */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {resolvedTitle}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {resolvedMessage}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        {resolvedRetryText}
                    </button>
                )}

                {showHomeButton && onHome && (
                    <button
                        onClick={onHome}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiHome className="w-4 h-4" />
                        {t('dashboardErrorStates.actions.home')}
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * NetworkErrorState - Specific error state for network connectivity issues
 */
const NetworkErrorState = ({ onRetry = null }) => {
    const { t } = useTranslation();

    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center shadow-lg">
                <FiWifiOff className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('dashboardErrorStates.network.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('dashboardErrorStates.network.message')}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    {t('dashboardErrorStates.actions.retry')}
                </button>
            )}
        </div>
    );
};

/**
 * PermissionErrorState - Specific error state for access permission issues
 */
const PermissionErrorState = ({
    requiredRole = null,
    contactAdmin = false,
    onContactAdmin = null
}) => {
    const { t } = useTranslation();

    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center shadow-lg">
                <FiLock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('dashboardErrorStates.permission.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {requiredRole
                    ? t('dashboardErrorStates.permission.roleRequired', { role: requiredRole })
                    : t('dashboardErrorStates.permission.message')
                }
                {contactAdmin && ` ${t('dashboardErrorStates.permission.contactAdmin')}`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {contactAdmin && onContactAdmin && (
                    <button
                        onClick={onContactAdmin}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiSettings className="w-4 h-4" />
                        {t('dashboardErrorStates.actions.contactAdmin')}
                    </button>
                )}

                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiHome className="w-4 h-4" />
                    {t('dashboardErrorStates.actions.back')}
                </button>
            </div>
        </div>
    );
};

/**
 * NotFoundErrorState - Specific error state for 404/not found scenarios
 */
const NotFoundErrorState = ({
    resource,
    onBack = null,
    showSearch = false,
    onSearch = null
}) => {
    const { t } = useTranslation();
    const resolvedResource = resource || t('dashboardErrorStates.notFound.resource');

    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">404</div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('dashboardErrorStates.notFound.title', { resource: resolvedResource })}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('dashboardErrorStates.notFound.message', {
                    resource: resolvedResource.toLowerCase(),
                })}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {showSearch && onSearch && (
                    <button
                        onClick={onSearch}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiSettings className="w-4 h-4" />
                        {t('common.search')}
                    </button>
                )}

                {onBack && (
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiHome className="w-4 h-4" />
                        {t('dashboardErrorStates.actions.back')}
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * ServerErrorState - Specific error state for server-side errors (5xx)
 */
const ServerErrorState = ({ onRetry = null, reportError = false, onReport = null }) => {
    const { t } = useTranslation();

    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">500</div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('dashboardErrorStates.server.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('dashboardErrorStates.server.message')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        {t('dashboardErrorStates.actions.retry')}
                    </button>
                )}

                {reportError && onReport && (
                    <button
                        onClick={onReport}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                    >
                        <FiSettings className="w-4 h-4" />
                        {t('dashboardErrorStates.actions.report')}
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * LoadingErrorState - Combined loading and error state with retry logic
 */
const LoadingErrorState = ({
    isLoading = false,
    error = null,
    onRetry = null,
    children
}) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 w-12 h-12"></div>
            </div>
        );
    }

    if (error) {
        return (
            <DashboardErrorState
                message={error.message || t('dashboardErrorStates.general.unknown')}
                onRetry={onRetry}
            />
        );
    }

    return children;
};

/**
 * ErrorBoundaryFallback - Fallback component for React Error Boundary
 */
const ErrorBoundaryFallback = ({ error, resetError }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
                    <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t('dashboardErrorStates.boundary.title')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t('dashboardErrorStates.boundary.message')}
                </p>

                {import.meta.env.DEV && error && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('dashboardErrorStates.boundary.details')}
                        </summary>
                        <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-auto">
                            {error.stack}
                        </pre>
                    </details>
                )}

                <button
                    onClick={resetError}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    {t('dashboardErrorStates.actions.refreshPage')}
                </button>
            </div>
        </div>
    );
};

export {
    DashboardErrorState,
    NetworkErrorState,
    PermissionErrorState,
    NotFoundErrorState,
    ServerErrorState,
    LoadingErrorState,
    ErrorBoundaryFallback
};
