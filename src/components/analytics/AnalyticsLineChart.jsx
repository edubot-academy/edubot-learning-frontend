import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * AnalyticsLineChart - Reusable line chart component for analytics
 * 
 * @param {Object} props
 * @param {Array} props.data - Chart data points
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {string} props.dataKey - Key for data values
 * @param {string} props.labelKey - Key for data labels
 * @param {string} props.color - Chart line color (edubot, green, blue, etc.)
 * @param {boolean} props.fillArea - Whether to fill area under the line
 * @param {boolean} props.showGrid - Whether to show grid lines
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {Object} props.options - Additional Chart.js options
 * @param {string} props.height - Chart height (default: '300px')
 * @param {boolean} props.loading - Whether chart is loading
 * @param {boolean} props.error - Whether chart has error
 * @param {string} props.errorText - Error message to display
 */
const AnalyticsLineChart = ({
    data = [],
    title = '',
    subtitle = '',
    dataKey = 'value',
    labelKey = 'label',
    color = 'edubot',
    fillArea = true,
    showGrid = true,
    showLegend = false,
    options = {},
    height = '300px',
    loading = false,
    error = false,
    errorText = 'Failed to load chart data',
}) => {
    // EduBot color palette
    const colorPalette = {
        edubot: {
            border: 'rgb(251, 146, 60)',
            background: 'rgba(251, 146, 60, 0.1)',
            point: 'rgb(251, 146, 60)',
        },
        green: {
            border: 'rgb(34, 197, 94)',
            background: 'rgba(34, 197, 94, 0.1)',
            point: 'rgb(34, 197, 94)',
        },
        blue: {
            border: 'rgb(59, 130, 246)',
            background: 'rgba(59, 130, 246, 0.1)',
            point: 'rgb(59, 130, 246)',
        },
        purple: {
            border: 'rgb(168, 85, 247)',
            background: 'rgba(168, 85, 247, 0.1)',
            point: 'rgb(168, 85, 247)',
        },
        orange: {
            border: 'rgb(251, 146, 60)',
            background: 'rgba(251, 146, 60, 0.1)',
            point: 'rgb(251, 146, 60)',
        },
        teal: {
            border: 'rgb(20, 184, 166)',
            background: 'rgba(20, 184, 166, 0.1)',
            point: 'rgb(20, 184, 166)',
        },
    };

    const selectedColor = colorPalette[color] || colorPalette.edubot;

    // Transform data for Chart.js
    const chartData = {
        labels: data.map(item => item[labelKey] || item.label || ''),
        datasets: [
            {
                label: title,
                data: data.map(item => item[dataKey] || item.value || 0),
                borderColor: selectedColor.border,
                backgroundColor: fillArea ? selectedColor.background : 'transparent',
                borderWidth: 2,
                pointBackgroundColor: selectedColor.point,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: fillArea,
            },
        ],
    };

    // Default Chart.js options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                    },
                    color: 'rgb(107, 114, 128)', // gray-500
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        const label = context.dataset.label || '';
                        return `${label}: ${value.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: showGrid,
                    color: 'rgba(107, 114, 128, 0.1)', // gray-500/10
                },
                ticks: {
                    color: 'rgb(107, 114, 128)', // gray-500
                    font: {
                        size: 11,
                        family: 'Inter, sans-serif',
                    },
                },
            },
            y: {
                grid: {
                    display: showGrid,
                    color: 'rgba(107, 114, 128, 0.1)', // gray-500/10
                },
                ticks: {
                    color: 'rgb(107, 114, 128)', // gray-500
                    font: {
                        size: 11,
                        family: 'Inter, sans-serif',
                    },
                    callback: (value) => value.toLocaleString(),
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        elements: {
            point: {
                hoverBorderWidth: 3,
            },
        },
        ...options,
    };

    // Loading state
    if (loading) {
        return (
            <div className="w-full" style={{ height }}>
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-edubot-orange w-8 h-8 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Жүктөлүүдө...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full" style={{ height }}>
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{errorText}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="w-full" style={{ height }}>
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Маалымат жок</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-base lg:text-lg">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-xs lg:text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div className="relative" style={{ height }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none sm:hidden">
                    <div className="text-center p-4">
                        <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Мобилдик үчүн жүктөлүүдө...</p>
                    </div>
                </div>
                <div style={{ height }}>
                    <Line data={chartData} options={defaultOptions} />
                </div>
            </div>
        </div>
    );
};

AnalyticsLineChart.propTypes = {
    data: PropTypes.array,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    dataKey: PropTypes.string,
    labelKey: PropTypes.string,
    color: PropTypes.oneOf(['edubot', 'green', 'blue', 'purple', 'orange', 'teal']),
    fillArea: PropTypes.bool,
    showGrid: PropTypes.bool,
    showLegend: PropTypes.bool,
    options: PropTypes.object,
    height: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    errorText: PropTypes.string,
};

export default AnalyticsLineChart;
