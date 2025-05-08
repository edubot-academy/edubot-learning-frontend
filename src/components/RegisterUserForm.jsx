import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaRegCopy } from 'react-icons/fa';
import PhoneInput from './PhoneInput';

const RegisterUserForm = ({ onRegister, onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        passwordManuallyChanged: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleAutoPassword = (name) => {
        const year = new Date().getFullYear();
        const safeName = name.trim().replace(/\s+/g, '').toLowerCase();
        return `${safeName}${year}`;
    };

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (key === 'fullName' && !formData.passwordManuallyChanged) {
            setFormData((prev) => ({ ...prev, password: handleAutoPassword(value) }));
        }
    };

    const handleSubmit = () => {
        const phone = formData.phoneNumber;
        if (phone) {
            const digitsOnly = phone.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                return toast.error('Телефон номери кеминде 10 цифра болушу керек.');
            }
            if (!/^\+\d{10,15}$/.test(phone)) {
                return toast.error('Телефон номери эл аралык форматта болсун.');
            }
        }
        if (!formData.fullName || !formData.email || !formData.password) {
            return toast.error('Бардык талааларды толтуруңуз.');
        }
        onRegister(formData);
    };

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Жаңы колдонуучу кошуу</h3>
            <input
                type="text"
                placeholder="Толук аты"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full border p-2 rounded mb-2"
            />
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border p-2 rounded mb-2"
            />
            <PhoneInput
                value={formData.phoneNumber}
                onChange={(val) => handleInputChange('phoneNumber', val)}
                className="mb-2"
            />
            <div className="relative mb-4">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => setFormData((prev) => ({ ...prev, passwordManuallyChanged: true }))}
                    placeholder="Сырсөз"
                    className="w-full border p-2 rounded pr-20"
                />
                <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(formData.password) && toast.success('Сырсөз көчүрүлдү!')}
                    className="absolute right-10 top-2 text-gray-600 hover:text-blue-600"
                    title="Көчүрүү"
                >
                    <FaRegCopy size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-600"
                >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
            </div>
            <div className="flex justify-end space-x-2">
                <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>
                    Жокко чыгаруу
                </button>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleSubmit}
                >
                    Каттоо
                </button>
            </div>
        </div>
    );
};

export default RegisterUserForm;