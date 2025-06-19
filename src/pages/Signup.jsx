import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import PhoneInput from "../components/PhoneInput";
import SignUpImg from "../assets/images/sign-up.png"; // путь к роботу

const SignupPage = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    repeatPassword: "",
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

    if (formData.password !== formData.repeatPassword) {
      setError("Сырсөздөр дал келген жок.");
      setLoading(false);
      return;
    }

    try {
      await registerUser({
        fullName: `${formData.lastName} ${formData.firstName}`,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
      });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Ката чыкты. Кайра аракет кылыңыз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e605e] px-4">
      <div className="flex flex-col md:flex-row items-center max-w-6xl w-full bg-[#1e605e] text-white gap-16">
        {/* Левая часть: изображение */}
        <div className="md:w-1/2 w-full flex justify-center">
          <img
            src={SignUpImg}
            alt="Sign up"
            className="max-w-[420px] w-full object-contain"
          />
        </div>

        {/* Правая часть: форма */}
        <div className="md:w-1/2 w-full flex flex-col items-start px-4">
          <h2 className="text-4xl font-bold mb-6">Регистрация</h2>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3 w-[320px]">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введите Фамилия"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введите Имя"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите Emil"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите Пароль"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="password"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              placeholder="Повторить Пароль"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />

            <div className="flex items-center justify-between text-sm text-white">
              <label className="flex items-center gap-2 bg-[#1e605e]">
                <input
                  type="checkbox"
                  className="w-4 h-4  accent-orange-500 bg-[#1e605e] border border-white rounded"
                />
                Запомнить меня
              </label>
              <Link
                to="/forgot-password"
                className="text-orange-300 hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-lg font-semibold transition"
            >
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-4 text-sm text-white text-center w-[320px]">
            Уже зарегистрированы?{" "}
            <Link to="/login" className="text-orange-300 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
