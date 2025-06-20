import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import PhoneInput from "../components/PhoneInput";
import SignUpImg from "../assets/images/sign-up.png";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    repeatPassword: "",
    phoneNumber: "",
  });

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    setPasswordValidations({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      validatePassword(value);
    }
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

  const EyeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const EyeOffIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.958 9.958 0 012.204-3.494m2.987-2.066A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.955 9.955 0 01-4.293 5.293M3 3l18 18"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e605e] px-4">
      <div className="flex flex-col md:flex-row items-center max-w-6xl w-full bg-[#1e605e] text-white gap-16">
        {/* Левая часть: изображение */}
        <div className="hidden md:flex md:w-1/2 justify-center">
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
              placeholder="Фамилияңызды жазыңыз"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Атыңызды  жазыңыз"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" Email"
              className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
              required
            />

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Сырсөздү жазыңыз "
                className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none pr-10"
                required
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setTimeout(() => setShowTooltip(false), 100)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2"
              >
                {showPassword ? EyeOffIcon : EyeIcon}
              </button>

              {showTooltip && (
                <div className="absolute z-10 top-full right-0 mt-2 bg-white text-black rounded shadow-lg text-sm w-[170px] px-3 py-2">
                  <div className="absolute -top-2 left-20 w-3 h-3 bg-white rotate-45 shadow-sm" />
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        passwordValidations.length
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✔
                    </span>
                    Длина 8 знаков
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        passwordValidations.lowercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✔
                    </span>
                    Строчная буква
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        passwordValidations.uppercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✔
                    </span>
                    Заглавная буква
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        passwordValidations.number
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✔
                    </span>
                    Цифра
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        passwordValidations.specialChar
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✔
                    </span>
                    Символ #*&% и др.
                  </div>
                </div>
              )}
            </div>

            {/* Повтор пароля */}
            <div className="relative">
              <input
                type={showRepeatPassword ? "text" : "password"}
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                placeholder="Сырсөздү кайталаңыз"
                className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-2 top-2"
              >
                {showRepeatPassword ? EyeOffIcon : EyeIcon}
              </button>
            </div>

            {/* Запомнить меня */}
            <div className="flex items-center justify-between text-sm text-white">
              <label className="relative flex items-center gap-2 cursor-pointer select-none bg-[#1e605e]">
                <input
                  type="checkbox"
                  className="peer appearance-none w-4 h-4 border border-white rounded bg-[#1e605e] checked:bg-orange-500 checked:border-orange-500"
                />
                <svg
                  className="absolute left-0.5 top-0.7 w-3 h-3 text-white hidden peer-checked:block pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                мени эсте{" "}
              </label>
              <Link
                to="/forgot-password"
                className="text-orange-300 hover:underline"
              >
                Сырсөздү унуттуңузбу?{" "}
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
            Катталгансызбы?{" "}
            <Link to="/login" className="text-orange-300 hover:underline">
              Кирүү
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
