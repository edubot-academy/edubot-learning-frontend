import PropTypes from 'prop-types';

const StudentPanelEmpty = ({ icon: Icon, title, description, className = '' }) => (
    <div className={`dashboard-panel-muted p-10 text-center ${className}`}>
        {Icon ? (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-edubot-orange shadow-sm dark:bg-slate-900">
                <Icon className="h-6 w-6" />
            </div>
        ) : null}
        <h3 className="mt-4 text-lg font-semibold text-edubot-ink dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">{description}</p>
    </div>
);

StudentPanelEmpty.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default StudentPanelEmpty;
