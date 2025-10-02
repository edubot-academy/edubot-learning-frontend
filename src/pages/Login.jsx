// LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import SignInImg from "../assets/images/edubot-signup.png";
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
    <div className="min-h-screen flex">
      {/* Левая часть с градиентом */}
      <div className="hidden md:flex md:w-1/2 bg-[linear-gradient(151.1deg,#FFCBA5_3.26%,#E64D26_96.74%)] flex-col justify-center items-center text-white px-6">
        <img
          src={SignInImg}
          alt="Sign up"
          className="object-contain mb-6 w-[400px] h-[300px]"
        />
        <h2 className="font-bold text-center text-[50px]">
          EDUBOT <br /> LEARNING
        </h2>
      </div>

      {/* Правая часть с формой */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-black mb-6">Вход</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-2 border rounded focus:outline-none pr-10"
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

            <div className="flex justify-center text-sm ">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline mb-[40px]"
              >
                Забыли пароль?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-2 rounded text-lg font-semibold shadow-md hover:opacity-90 transition"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
