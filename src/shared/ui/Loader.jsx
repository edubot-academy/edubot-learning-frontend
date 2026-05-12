import PropTypes from 'prop-types';

const Loader = ({
  size = 40,
  fullScreen = false,
  label = 'Жүктөлүүдө',
  className = '',
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`flex items-center justify-center ${
        fullScreen ? 'w-full h-screen' : 'w-full h-full'
      } ${className}`}
    >
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"
        style={{
          width: dimension,
          height: dimension,
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fullScreen: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default Loader;
