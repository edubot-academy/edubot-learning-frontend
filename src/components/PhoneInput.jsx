import React from 'react';

const PhoneInput = ({ value, onChange, required = false }) => {
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
            placeholder="+996700123456 (милдеттүү эмес)"
            className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
            required={required}
        />
    );
};

export default PhoneInput;
