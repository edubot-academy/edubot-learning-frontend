import React, { useState } from 'react';
import { sendOtp, resetPassword } from '@services/api';
import { IoClose } from 'react-icons/io5';

const ForgotPassword = ({ onClose }) => {
    const [identifier, setIdentifier] = useState('');
    const [method, setMethod] = useState('method');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendOtp({ identifier, method });
            setOtpSent(true);
        } catch (err) {
            setError(`${err.message}. ${err.response?.data?.message}`);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Сырсөздөр дал келген жок.');
            setLoading(false);
            return;
        }

        try {
            await resetPassword({ identifier, otp, newPassword, method });
            setPasswordReset(true);
        } catch (err) {
            setError(`${err.response?.data?.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="relative bg-white rounded-lg shadow-lg w-[600px] p-[50px]">
                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black"
                >
                    <IoClose size={28} />
                </button>

                {/* Заголовок */}
                <h2 className="text-2xl font-bold text-left mb-6">Сырсөздү унуттуңузбу?</h2>

                {/* Шаг 1 */}
                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="method">Методду тандаңыз</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Введите данные"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-[50px] mt-[10px]"
                            required
                        />

                        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className=" w-full shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white font-semibold py-3 rounded-md hover:opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? 'Жөнөтүлүүдө...' : 'OTP жөнөтүү'}
                        </button>
                    </form>
                ) : !passwordReset ? (
                    /* Шаг 2 */
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="text"
                            placeholder="OTP кодду киргизиңиз"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Жаңы сырсөз"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Сырсөздү кайталаңыз"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />

                        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white font-semibold py-3 rounded-md hover:opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? 'Кайра орнотууда...' : 'Сырсөздү кайра орнотуу'}
                        </button>
                    </form>
                ) : (
                    /* Шаг 3 */
                    <p className="text-green-600 text-center">
                        Сырсөз ийгиликтүү жаңыртылды! Эми логин кылыңыз.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
