import React from 'react';

const PhoneInput = ({ value, onChange, className = '', required = false }) => {
    const handleInput = (e) => {
        const raw = e.target.value;
        if (/^[+\d]*$/.test(raw) && raw.length <= 16) {
            onChange(raw);
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('Text');
        if (!/^[+\d]*$/.test(pasted)) {
            e.preventDefault();
        } else {
            onChange(pasted);
        }
    };

    return (
        <input
            type="tel"
            name="phoneNumber"
            value={value}
            onChange={handleInput}
            onPaste={handlePaste}
            placeholder="+996700123456"
            className={`w-full border p-2 rounded ${className}`}
            required={required}
        />
    );
};

export default PhoneInput;
