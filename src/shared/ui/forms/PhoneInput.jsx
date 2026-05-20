import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    placeholder,
    autoComplete = 'tel',
    allowPlus = true,
    maxLength = 16,
    floatingLabel = false,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props
}) => {
    const { t } = useTranslation();
    const [focused, setFocused] = useState(false);
    const allowedPattern = allowPlus ? /^[+\d]*$/ : /^\d*$/;
    const needsGeneratedId = !id && Boolean(label || helperText || error);
    const inputId = id || (needsGeneratedId ? name : undefined);
    const helperId = helperText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;
    const hasError = Boolean(error) || ariaInvalid === true;
    const isActive = focused || Boolean(value);

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
            placeholder={placeholder || t('formControls.phonePlaceholder')}
            autoComplete={autoComplete}
            inputMode="tel"
            aria-invalid={ariaInvalid ?? Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full rounded-md border px-2 py-1.5 text-sm text-gray-900 transition-colors duration-200 focus:outline-none sm:px-3 sm:py-2 sm:text-base md:px-4 md:py-2.5 dark:text-[#E8ECF3] ${
                hasError
                    ? 'border-red-600 bg-red-50/60 dark:border-red-500 dark:bg-red-950/20'
                    : 'border-gray-300 bg-white focus:border-amber-600 dark:border-gray-700 dark:bg-[#222222] dark:focus:border-amber-500'
            } ${className} ${inputClassName}`}
            required={required}
            {...props}
        />
    );

    if (!floatingLabel) {
        if (!label && !helperText && !error) return input;

        return (
            <div className={wrapperClassName}>
                {label ? (
                    <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#a6adba]">
                        {label}
                        {required && (
                            <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>
                ) : null}
                <div>{input}</div>
                {helperText ? (
                    <p id={helperId} className="mt-1 text-xs text-gray-500 dark:text-[#a6adba]">
                        {helperText}
                    </p>
                ) : null}
                {error ? (
                    <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {error}
                    </p>
                ) : null}
            </div>
        );
    }

    return (
        <div className={wrapperClassName}>
            <div
                className={`relative rounded-md border px-2 py-1.5 transition-colors duration-200 sm:px-3 sm:py-2 md:px-4 md:py-2.5 ${
                    hasError
                        ? 'border-red-600 bg-red-50/60 dark:border-red-500 dark:bg-red-950/20'
                        : focused
                          ? 'border-amber-600 bg-white dark:border-amber-500 dark:bg-[#222222]'
                          : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-[#222222]'
                }`}
            >
                {label ? (
                    <label
                        htmlFor={inputId}
                        className={`pointer-events-none absolute left-2 px-1 transition-all duration-200 ease-in-out sm:left-3 ${
                            isActive
                                ? '-top-2 text-xs sm:-top-3 sm:text-sm'
                                : 'top-2 text-sm sm:top-3 sm:text-base'
                        } ${
                            hasError
                                ? 'bg-red-50 text-red-600 dark:bg-[#251b1b]'
                                : focused
                                  ? 'bg-white text-amber-600 dark:bg-[#222222] dark:text-amber-500'
                                  : 'bg-white text-gray-500 dark:bg-[#222222] dark:text-[#a6adba]'
                        }`}
                    >
                        {label}
                        {required && (
                            <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>
                ) : null}
                <input
                    id={inputId}
                    type="tel"
                    name={name}
                    value={value}
                    onChange={handleInput}
                    onPaste={handlePaste}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={label ? '' : placeholder || t('formControls.phonePlaceholder')}
                    autoComplete={autoComplete}
                    inputMode="tel"
                    aria-invalid={ariaInvalid ?? Boolean(error)}
                    aria-describedby={describedBy}
                    className={`w-full bg-transparent text-sm text-gray-900 outline-none sm:text-base dark:text-[#E8ECF3] ${className} ${inputClassName}`}
                    required={required}
                    {...props}
                />
            </div>
            {helperText ? (
                <p id={helperId} className="mt-1 text-xs text-gray-500 dark:text-[#a6adba]">
                    {helperText}
                </p>
            ) : null}
            {error ? (
                <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
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
    floatingLabel: PropTypes.bool,
    'aria-invalid': PropTypes.bool,
    'aria-describedby': PropTypes.string,
};

export default PhoneInput;
