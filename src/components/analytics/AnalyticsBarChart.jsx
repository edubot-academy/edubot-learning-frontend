import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * AnalyticsBarChart - Reusable bar chart component for analytics
 * 
 * @param {Object} props
 * @param {Array} props.data - Chart data points
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {string} props.dataKey - Key for data values
 * @param {string} props.labelKey - Key for data labels
 * @param {string} props.color - Chart bar color (edubot, green, blue, etc.)
 * @param {boolean} props.horizontal - Whether to display horizontal bars
 * @param {boolean} props.showGrid - Whether to show grid lines
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {Object} props.options - Additional Chart.js options
 * @param {string} props.height - Chart height (default: '300px')
 * @param {boolean} props.loading - Whether chart is loading
 * @param {boolean} props.error - Whether chart has error
 * @param {string} props.errorText - Error message to display
 */
const AnalyticsBarChart = ({
    data = [],
    title = '',
    subtitle = '',
    dataKey = 'value',
    labelKey = 'label',
    color = 'edubot',
    horizontal = false,
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
            background: 'rgba(251, 146, 60, 0.8)',
            border: 'rgb(251, 146, 60)',
        },
        green: {
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'rgb(34, 197, 94)',
        },
        blue: {
            background: 'rgba(59, 130, 246, 0.8)',
            border: 'rgb(59, 130, 246)',
        },
        purple: {
            background: 'rgba(168, 85, 247, 0.8)',
            border: 'rgb(168, 85, 247)',
        },
        orange: {
            background: 'rgba(251, 146, 60, 0.8)',
            border: 'rgb(251, 146, 60)',
        },
        teal: {
            background: 'rgba(20, 184, 166, 0.8)',
            border: 'rgb(20, 184, 166)',
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
                backgroundColor: selectedColor.background,
                borderColor: selectedColor.border,
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    // Default Chart.js options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
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
                        const value = context.parsed.y || context.parsed.x;
                        const label = context.dataset.label || '';
                        return `${label}: ${value.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: showGrid && !horizontal,
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
                    display: showGrid && horizontal,
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
                beginAtZero: true,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div style={{ height }}>
                <Bar data={chartData} options={defaultOptions} />
            </div>
        </div>
    );
};

AnalyticsBarChart.propTypes = {
    data: PropTypes.array,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    dataKey: PropTypes.string,
    labelKey: PropTypes.string,
    color: PropTypes.oneOf(['edubot', 'green', 'blue', 'purple', 'orange', 'teal']),
    horizontal: PropTypes.bool,
    showGrid: PropTypes.bool,
    showLegend: PropTypes.bool,
    options: PropTypes.object,
    height: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    errorText: PropTypes.string,
};

export default AnalyticsBarChart;
