const GlassCard = ({ className = '', children }) => {
    return (
        <div
            className={`rounded-2xl border border-white/60 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur shadow-lg shadow-emerald-50/50 dark:shadow-black/30 ${className}`}
        >
            {children}
        </div>
    );
};

export default GlassCard;
