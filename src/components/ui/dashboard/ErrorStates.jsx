/* eslint-disable react/prop-types */
import { FiAlertCircle, FiWifiOff, FiLock, FiRefreshCw, FiHome, FiSettings } from 'react-icons/fi';

/**
 * DashboardErrorState - General error state for dashboard sections
 * Used across all dashboards for various error scenarios
 */
const DashboardErrorState = ({ 
    title = 'Ката кетти', 
    message = 'Деректерди жүктөөдө ката кетти. Кайта аракет кылып көрүңүз.',
    onRetry = null,
    retryText = 'Кайта аракет кылуу',
    showHomeButton = false,
    onHome = null
}) => (
    <div className="text-center py-12">
        {/* Error icon container */}
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
            <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        {/* Error content */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {message}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    {retryText}
                </button>
            )}
            
            {showHomeButton && onHome && (
                <button
                    onClick={onHome}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiHome className="w-4 h-4" />
                    Башкы бетке
                </button>
            )}
        </div>
    </div>
);

/**
 * NetworkErrorState - Specific error state for network connectivity issues
 */
const NetworkErrorState = ({ onRetry = null }) => (
    <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center shadow-lg">
            <FiWifiOff className="w-12 h-12 text-orange-600 dark:text-orange-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Туташуу катасы
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Интернет туташуусу жок же серверге жетүү мүмкүн эмес. Туташууңузду теккериңиз жана кайта аракет кылыңыз.
        </p>

        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
                <FiRefreshCw className="w-4 h-4" />
                Кайта аракет кылуу
            </button>
        )}
    </div>
);

/**
 * PermissionErrorState - Specific error state for access permission issues
 */
const PermissionErrorState = ({ 
    requiredRole = null,
    contactAdmin = false,
    onContactAdmin = null
}) => (
    <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center shadow-lg">
            <FiLock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Кирүүгө тыюу салынган
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {requiredRole 
                ? `Бул бөлүккө кирүү үчүн "${requiredRole}" ролу керек.`
                : 'Бул бөлүккө кирүү үчүн укуктар жетишсиз.'
            }
            {contactAdmin && ' Администраторго кайрылыңыз.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {contactAdmin && onContactAdmin && (
                <button
                    onClick={onContactAdmin}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiSettings className="w-4 h-4" />
                    Администраторго кайруу
                </button>
            )}
            
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
                <FiHome className="w-4 h-4" />
                Артка кайтуу
            </button>
        </div>
    </div>
);

/**
 * NotFoundErrorState - Specific error state for 404/not found scenarios
 */
const NotFoundErrorState = ({ 
    resource = 'Маалымат',
    onBack = null,
    showSearch = false,
    onSearch = null
}) => (
    <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">404</div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {resource} табылган жок
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Сиз издеген {resource.toLowerCase()} системада жок же жок кылынган. Издөө критерийларын теккериңиз же башка бөлүккө өтүңүз.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {showSearch && onSearch && (
                <button
                    onClick={onSearch}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiSettings className="w-4 h-4" />
                    Издөө
                </button>
            )}
            
            {onBack && (
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiHome className="w-4 h-4" />
                    Артка кайтуу
                </button>
            )}
        </div>
    </div>
);

/**
 * ServerErrorState - Specific error state for server-side errors (5xx)
 */
const ServerErrorState = ({ onRetry = null, reportError = false, onReport = null }) => (
    <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-4xl font-bold text-red-600 dark:text-red-400">500</div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Сервер катасы
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Серверде күтүлбөгөн ката кетти. Биз бул масалени билдик жана тез арада чечүүгө аракет кылып жатабыз. Көптөгөн кайра аракет кылыңыз.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Кайта аракет кылуу
                </button>
            )}
            
            {reportError && onReport && (
                <button
                    onClick={onReport}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                    <FiSettings className="w-4 h-4" />
                    Катаны жөнөтүү
                </button>
            )}
        </div>
    </div>
);

/**
 * LoadingErrorState - Combined loading and error state with retry logic
 */
const LoadingErrorState = ({ 
    isLoading = false, 
    error = null, 
    onRetry = null,
    children 
}) => {
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
                message={error.message || 'Белгисиз ката кетти'}
                onRetry={onRetry}
            />
        );
    }

    return children;
};

/**
 * ErrorBoundaryFallback - Fallback component for React Error Boundary
 */
const ErrorBoundaryFallback = ({ error, resetError }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
                <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Колдонмо катасы
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                Колдонмодо күтүлбөгөн ката кетти. Баракты жаңыртып көрүңүз.
            </p>

            {import.meta.env.DEV && error && (
                <details className="mb-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Катанын чоңдурбасы (текшерүү режиминде гана)
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
                Баракты жаңыртуу
            </button>
        </div>
    </div>
);

export {
    DashboardErrorState,
    NetworkErrorState,
    PermissionErrorState,
    NotFoundErrorState,
    ServerErrorState,
    LoadingErrorState,
    ErrorBoundaryFallback
};
