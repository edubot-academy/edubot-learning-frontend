/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';

const DashboardHeader = ({
  user,
  role = 'instructor',
  subtitle,
  actions = [],
  className = '',
}) => {
  const getRoleLabel = () => {
    const labels = {
      instructor: 'Инструктор Панели',
      student: 'Окуучу Панели',
      admin: 'Админ Панели',
      assistant: 'Ассистент Панели',
    };
    return labels[role] || 'Панель';
  };

  return (
    <div className={`bg-gradient-to-r from-edubot-dark to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
            {getRoleLabel()}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1 truncate">
            {user?.fullName || user?.email || 'Колдонуучу'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 line-clamp-2">
            {subtitle || getRoleDescription(role)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {actions.map((action, index) =>
            action.to ? (
              <Link
                key={index}
                to={action.to}
                className={`${getButtonClasses(action.variant)} ${action.className || ''}`}
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={`${getButtonClasses(action.variant)} ${action.className || ''}`}
                disabled={action.disabled}
                type={action.type || 'button'}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const getButtonClasses = (variant = 'primary') => {
  const variants = {
    primary: 'inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-edubot-orange to-edubot-soft hover:from-edubot-soft hover:to-edubot-orange text-white text-sm font-medium transform transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] min-w-[100px]',
    secondary: 'hidden md:inline-flex px-4 py-2 rounded-xl border border-slate-600 text-sm text-slate-300 hover:bg-slate-700 hover:border-edubot-orange hover:text-edubot-orange transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-edubot-orange/20 group',
    ghost: 'text-edubot-orange hover:bg-edubot-orange/10 rounded-xl px-4 py-2 text-sm font-medium transform transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]',
  };
  return variants[variant] || variants.primary;
};

const getRoleDescription = (role) => {
  const descriptions = {
    instructor: 'Курстарыңызды жана студенттерди толук көзөмөлдөңүз',
    student: 'Окуу прогрессиңизди көзөмөлдөңүз жана жаңы билим алыңыз',
    admin: 'Платформаны башкаруу жана көзөмөлдөө',
    assistant: 'Инструкторлорго жардам берүү жана колдоо',
  };
  return descriptions[role] || 'Панель функциялары';
};

export default DashboardHeader;
