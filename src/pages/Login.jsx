// LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import SignInImg from "../assets/images/sign-in.png";
import EyeIcon from "../assets/icons/EyeIcon";
import EyeOffIcon from "../assets/icons/EyeOffIcon";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-edubot-teal px-4">
      <div className="flex flex-col md:flex-row items-center max-w-6xl w-full text-white gap-10 md:gap-16">
        {/* Форма */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start px-2">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">
            Кирүү
          </h2>

          {error && (
            <p className="text-red-400 mb-4 text-center md:text-left">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email киргизиңиз"
              className="w-full px-4 py-3 rounded-xl bg-white text-black focus:outline-none"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Сырсөздү киргизиңиз"
                className="w-full px-4 py-3 rounded-xl bg-white text-black focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="flex items-center justify-end text-sm text-white">
              <Link
                to="/forgot-password"
                className="text-orange-300 hover:underline"
              >
                Сырсөздү унуттуңузбу?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-lg font-semibold transition"
            >
              {loading ? "Кирүүдө..." : "Кирүү"}
            </button>
          </form>

          <p className="mt-5 text-sm text-white text-center w-full max-w-sm">
            Аккаунтуңуз жокпу?{" "}
            <Link to="/register" className="text-orange-300 hover:underline">
              Катталуу
            </Link>
          </p>
        </div>

        {/* Сүрөт — телефондо жок */}
        <div className="hidden md:flex md:w-1/2 justify-center">
          <img
            src={SignInImg}
            alt="Кирүү сүрөтү"
            className="max-w-[500px] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
