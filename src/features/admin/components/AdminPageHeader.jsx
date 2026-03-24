const AdminPageHeader = ({ title, subtitle, actions }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
            <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
                Admin Panel
            </p>
            <h1 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                {title}
            </h1>
            {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {subtitle}
                </p>
            )}
        </div>
        
        {actions && (
            <div className="flex flex-wrap gap-3">
                {actions}
            </div>
        )}
    </div>
);

export default AdminPageHeader;
