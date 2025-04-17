import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
// import { FaGoogle, FaFacebook } from "react-icons/fa";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await registerUser(formData);
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
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Катталууда..." : "Катталуу"}
                    </button>
                </form>
                {/* <div className="my-4 text-center text-gray-600">ЖЕ</div> */}
                {/* <button className="w-full flex items-center justify-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition mb-2">
                    <FaGoogle className="mr-2" /> Google менен катталуу
                </button>
                <button className="w-full flex items-center justify-center bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition">
                    <FaFacebook className="mr-2" /> Facebook менен катталуу
                </button> */}
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