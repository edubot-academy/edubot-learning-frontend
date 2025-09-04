import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import PhoneInput from "../components/PhoneInput";
import SignUpImg from "../assets/images/sign-up.png";
import EyeIcon from "../assets/icons/EyeIcon";
import EyeOffIcon from "../assets/icons/EyeOffIcon";
import toast from "react-hot-toast";

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

  const EyeIconButton = ({ setShowPassword, showPassword }) => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-2 top-2"
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )

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

            <PhoneInput onChange={handlePhoneChange} value={formData.phoneNumber} />

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
              <EyeIconButton setShowPassword={setShowPassword} showPassword={showPassword} />

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
              <EyeIconButton setShowPassword={setShowRepeatPassword} showPassword={showRepeatPassword} />
            </div>

            {/* Запомнить меня */}
            {/* <div className="flex items-center justify-between text-sm text-white">
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
            </div> */}

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
