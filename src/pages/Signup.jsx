import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import PhoneInput from "../components/PhoneInput";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const phone = formData.phoneNumber;
        if (phone) {
            const digitsOnly = phone.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                toast.error("Телефон номери кеминде 10 цифра болушу керек.");
                setLoading(false);
                return;
            }

            if (!/^\+\d{10,15}$/.test(phone)) {
                toast.error("Телефон номери эл аралык форматта болсун. Мисалы: +996700123456 же +14155552671");
                setLoading(false);
                return;
            }
        }

        try {
            await registerUser({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phoneNumber: phone || undefined,
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Ката чыкты. Кайра аракет кылыңыз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6">Каттоо</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Толук аты</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Сырсөз</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">
                            Телефон номери <span className="text-sm text-gray-500">(милдеттүү эмес)</span>
                        </label>
                        <PhoneInput
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            className="focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Катталууда..." : "Катталуу"}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Аккаунтуңуз барбы?
                    <Link to="/login" className="text-[#1e605e] hover:underline inline-flex items-center gap-1 ml-1">
                        <span>Логин</span>
                        <span className="text-sm">→</span>
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;