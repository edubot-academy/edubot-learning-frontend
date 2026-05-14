import PropTypes from 'prop-types';

const PhoneInput = ({
    id,
    name = 'phoneNumber',
    value,
    onChange,
    label,
    helperText,
    error,
    required = false,
    className = '',
    inputClassName = '',
    wrapperClassName = '',
    placeholder = 'Телефон номер',
    autoComplete = 'tel',
    allowPlus = true,
    maxLength = 16,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props
}) => {
    const allowedPattern = allowPlus ? /^[+\d]*$/ : /^\d*$/;
    const needsGeneratedId = !id && Boolean(label || helperText || error);
    const inputId = id || (needsGeneratedId ? name : undefined);
    const helperId = helperText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

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

    const input = (
        <input
            id={inputId}
            type="tel"
            name={name}
            value={value}
            onChange={handleInput}
            onPaste={handlePaste}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode="tel"
            aria-invalid={ariaInvalid ?? Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full px-4 py-2 rounded text-black dark:text-white bg-white dark:bg-[#222222] focus:outline-none border ${className} ${inputClassName}`}
            required={required}
            {...props}
        />
    );

    if (!label && !helperText && !error) return input;

    return (
        <div className={wrapperClassName}>
            {label ? (
                <label htmlFor={inputId} className="text-sm font-medium text-edubot-muted dark:text-slate-400">
                    {label}
                </label>
            ) : null}
            <div className={label ? 'mt-1' : undefined}>{input}</div>
            {helperText ? (
                <p id={helperId} className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                    {helperText}
                </p>
            ) : null}
            {error ? (
                <p id={errorId} className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">
                    {error}
                </p>
            ) : null}
        </div>
    );
};

PhoneInput.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    helperText: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
    allowPlus: PropTypes.bool,
    maxLength: PropTypes.number,
    'aria-invalid': PropTypes.bool,
    'aria-describedby': PropTypes.string,
};

export default PhoneInput;
