import React, { useState } from "react";
import { sendOtp, resetPassword } from "../services/api";

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState("");
    const [method, setMethod] = useState("email");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordReset, setPasswordReset] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await sendOtp({ identifier, method });
            setOtpSent(true);
        } catch (err) {
            setError(`${err.message}. ${err.response.data.message}`);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Сырсөздөр дал келген жок.");
            setLoading(false);
            return;
        }

        try {
            await resetPassword({ identifier, otp, newPassword, method });
            setPasswordReset(true);
        } catch (err) {
            setError(`${err.response.data.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6">Сырсөздү унуттуңузбу?</h2>
                {!otpSent ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email же WhatsApp номер киргизиңиз</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Методду тандаңыз</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                        {error && <p className="text-red-600 text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                            disabled={loading}
                        >
                            {loading ? "Жөнөтүлүүдө..." : "OTP жөнөтүү"}
                        </button>
                    </form>
                ) : !passwordReset ? (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label className="block text-gray-700">OTP кодду киргизиңиз</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Жаңы сырсөз</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Сырсөздү кайталаңыз</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        {error && <p className="text-red-600 text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                            disabled={loading}
                        >
                            {loading ? "Кайра орнотууда..." : "Сырсөздү кайра орнотуу"}
                        </button>
                    </form>
                ) : (
                    <p className="text-green-600 text-center">Сырсөз ийгиликтүү жаңыртылды! Эми логин кылыңыз.</p>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
