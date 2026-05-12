import PropTypes from 'prop-types';

const PhoneInput = ({
    id,
    name = 'phoneNumber',
    value,
    onChange,
    required = false,
    className = '',
    placeholder = 'Телефон номер',
    autoComplete = 'tel',
    allowPlus = true,
    maxLength = 16,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props
}) => {
    const allowedPattern = allowPlus ? /^[+\d]*$/ : /^\d*$/;

    const handleInput = (e) => {
        const raw = e.target.value;
        if (allowedPattern.test(raw) && raw.length <= maxLength) {
            onChange(raw);
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('Text');
        if (!allowedPattern.test(pasted) || pasted.length > maxLength) {
            e.preventDefault();
        } else {
            onChange(pasted);
        }
    };

    return (
        <input
            id={id}
            type="tel"
            name={name}
            value={value}
            onChange={handleInput}
            onPaste={handlePaste}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode="tel"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={`w-full px-4 py-2 rounded text-black dark:text-white bg-white dark:bg-[#222222] focus:outline-none border ${className}`}
            required={required}
            {...props}
        />
    );
};

PhoneInput.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
    allowPlus: PropTypes.bool,
    maxLength: PropTypes.number,
    'aria-invalid': PropTypes.bool,
    'aria-describedby': PropTypes.string,
};

export default PhoneInput;
