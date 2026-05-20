
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DashboardHeader = ({
  user,
  role = 'instructor',
  subtitle,
  actions = [],
  className = '',
}) => {
  const { t } = useTranslation();
  const userName = user?.fullName || user?.email || t('common.userFallback');
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const getRoleLabel = () => {
    const label = t(`dashboardHeader.roles.${role}`, { defaultValue: '' });
    return label || t('dashboardHeader.roles.default');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-slate-800/70 bg-edubot-hero p-6 text-white shadow-edubot-glow md:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(241,126,34,0.18),transparent_30%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="dashboard-pill">
            {getRoleLabel()}
          </p>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-bold shadow-lg shadow-black/10 backdrop-blur-sm">
              {userInitials || 'E'}
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[2rem]">
                {userName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-100/80 md:text-base">
                {subtitle || getRoleDescription(role, t)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-white/80">
              {t('dashboardHeader.chips.workspace')}
            </span>
            <span className="rounded-full border border-white/12 bg-black/10 px-3 py-1 text-xs font-medium text-white/75">
              {t('dashboardHeader.chips.liveShell')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:max-w-[45%] lg:justify-end">
          {actions.map((action, index) =>
            action.to ? (
              <Link
                key={index}
                to={action.to}
                className={`${getButtonClasses(action.variant)} ${action.className || ''}`}
                onClick={action.onClick}
              >
                {action.icon && <span className="shrink-0">{action.icon}</span>}
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={`${getButtonClasses(action.variant)} ${action.className || ''}`}
                disabled={action.disabled}
                type={action.type || 'button'}
              >
                {action.icon && <span className="shrink-0">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const getButtonClasses = (variant = 'primary') => {
  const base =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 touch-manipulation';

  const variants = {
    primary: `${base} bg-white text-edubot-dark shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-edubot-surface`,
    secondary: `${base} border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/16`,
    ghost: `${base} bg-transparent text-white/85 hover:bg-white/10 hover:text-white`,
  };
  return variants[variant] || variants.primary;
};

const getRoleDescription = (role, t) => {
  const description = t(`dashboardHeader.descriptions.${role}`, { defaultValue: '' });
  return description || t('dashboardHeader.descriptions.default');
};

export default DashboardHeader;
