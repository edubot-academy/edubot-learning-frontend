const Sparkline = ({ series, color = '#2563EB' }) => {
    const width = 100;
    const height = 40;
    const maxVal = Math.max(...series.map((p) => Number(p.count) || 0), 1);

    const points = series
        .map((point, idx) => {
            const x = (idx / Math.max(series.length - 1, 1)) * width;
            const y = height - ((Number(point.count) || 0) / maxVal) * (height - 6) - 3;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 text-blue-600">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points || `0,${height / 2} ${width},${height / 2}`}
            />
        </svg>
    );
};

export default Sparkline;
