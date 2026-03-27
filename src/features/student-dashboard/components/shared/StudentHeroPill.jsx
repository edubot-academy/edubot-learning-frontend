import PropTypes from 'prop-types';

const StudentHeroPill = ({ label, value }) => (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
            {label}
        </div>
        <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
);

StudentHeroPill.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StudentHeroPill;
