import PropTypes from 'prop-types';

export const filterOptionShape = PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
});

export const instructorCourseDisplayItemShape = PropTypes.shape({
    display: PropTypes.shape({
        courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        coverImageUrl: PropTypes.string,
        instructorName: PropTypes.string.isRequired,
        lifecycle: PropTypes.shape({
            badgeClass: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            primaryActionLabel: PropTypes.string.isRequired,
        }).isRequired,
        priceLabel: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        typeLabel: PropTypes.string.isRequired,
    }).isRequired,
});
