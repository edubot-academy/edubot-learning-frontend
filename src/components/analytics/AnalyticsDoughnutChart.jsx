import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

/**
 * AnalyticsDoughnutChart - Reusable doughnut chart component for analytics
 * 
 * @param {Object} props
 * @param {Array} props.data - Chart data points
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {string} props.dataKey - Key for data values
 * @param {string} props.labelKey - Key for data labels
 * @param {Array} props.colors - Custom colors for each segment
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {boolean} props.showLabels - Whether to show labels on chart
 * @param {Object} props.options - Additional Chart.js options
 * @param {string} props.height - Chart height (default: '300px')
 * @param {boolean} props.loading - Whether chart is loading
 * @param {boolean} props.error - Whether chart has error
 * @param {string} props.errorText - Error message to display
 * @param {string} props.centerText - Text to display in center of doughnut
 */
const AnalyticsDoughnutChart = ({
    data = [],
    title = '',
    subtitle = '',
    dataKey = 'value',
    labelKey = 'label',
    colors = [],
    showLegend = true,
    showLabels = false,
    options = {},
    height = '300px',
    loading = false,
    error = false,
    errorText = 'Failed to load chart data',
    centerText = '',
}) => {
    // EduBot color palette
    const defaultColors = [
        'rgb(251, 146, 60)',   // edubot-orange
        'rgb(34, 197, 94)',     // green
        'rgb(59, 130, 246)',    // blue
        'rgb(168, 85, 247)',    // purple
        'rgb(20, 184, 166)',    // teal
        'rgb(251, 191, 36)',    // yellow
        'rgb(239, 68, 68)',     // red
        'rgb(107, 114, 128)',   // gray
    ];

    const chartColors = colors.length > 0 ? colors : defaultColors;

    // Transform data for Chart.js
    const chartData = {
        labels: data.map(item => item[labelKey] || item.label || ''),
        datasets: [
            {
                data: data.map(item => item[dataKey] || item.value || 0),
                backgroundColor: chartColors.slice(0, data.length),
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 4,
            },
        ],
    };

    // Custom plugin for center text
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart) => {
            if (centerText) {
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;

                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `bold ${fontSize}em Inter, sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgb(55, 65, 81)'; // gray-700

                const text = centerText;
                const textX = Math.round(width / 2);
                const textY = height / 2;

                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        },
    };

    // Default Chart.js options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: showLabels ? 'bottom' : 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                    },
                    color: 'rgb(107, 114, 128)', // gray-500
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const value = dataset.data[i];

                                return {
                                    text: `${label}: ${value.toLocaleString()}`,
                                    fillStyle: dataset.backgroundColor[i],
                                    hidden: false,
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed;
                        const label = context.label || '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
            datalabels: showLabels ? {
                display: true,
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12,
                },
                formatter: (value, ctx) => {
                    const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / sum) * 100).toFixed(1);
                    return percentage > 5 ? `${percentage}%` : '';
                },
            } : {
                display: false,
            },
        },
        cutout: '65%',
        animation: {
            animateRotate: true,
            animateScale: false,
        },
        ...options,
    };

    // Add center text plugin if needed
    if (centerText) {
        defaultOptions.plugins = { ...defaultOptions.plugins, centerTextPlugin };
    }

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
                    <Doughnut data={chartData} options={defaultOptions} plugins={[centerTextPlugin]} />
                </div>
            </div>
        </div>
    );
};

AnalyticsDoughnutChart.propTypes = {
    data: PropTypes.array,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    dataKey: PropTypes.string,
    labelKey: PropTypes.string,
    colors: PropTypes.array,
    showLegend: PropTypes.bool,
    showLabels: PropTypes.bool,
    options: PropTypes.object,
    height: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    errorText: PropTypes.string,
    centerText: PropTypes.string,
};

export default AnalyticsDoughnutChart;
