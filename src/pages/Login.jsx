import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
// import { FaGoogle, FaFacebook } from "react-icons/fa";

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await loginUser({ email, password });
            const { access_token, user } = response.data;
            login(user, access_token);
            navigate("/");
        } catch (err) {
            setError("Email же сырсөз туура эмес. Кайра аракет кылыңыз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6">Логин</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Сырсөз</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div className="mb-4 text-right">
                        <Link to="/forgot-password" className="text-[#1e605e] hover:underline inline-flex items-center gap-1">
                            <span>Сырсөздү унуттуңузбу?</span>
                            <span className="text-sm">→</span>
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Кирүүдө..." : "Логин"}
                    </button>
                </form>
                {/* <div className="my-4 text-center text-gray-600">ЖЕ</div> */}
                {/* <button className="w-full flex items-center justify-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition mb-2">
                    <FaGoogle className="mr-2" /> Google аркылуу кирүү
                </button>
                <button className="w-full flex items-center justify-center bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition">
                    <FaFacebook className="mr-2" /> Facebook аркылуу кирүү
                </button> */}
                <p className="mt-4 text-center">
                    Аккаунтуңуз жокпу?
                    <Link to="/register" className="text-[#1e605e] hover:underline inline-flex items-center gap-1 ml-1">
                        <span>Катталуу</span>
                        <span className="text-sm">→</span>
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;