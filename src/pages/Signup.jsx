import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import PhoneInput from "../components/PhoneInput";
import SignUpImg from "../assets/images/edubot-signup.png";
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
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        toast.error("Телефон номери кеминде 10 цифра болушу керек.");
        setLoading(false);
        return;
      }

      if (!/^\+\d{10,15}$/.test(phone)) {
        toast.error(
          "Телефон номери эл аралык форматта болсун. Мисалы: +996700123456 же +14155552671"
        );
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
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const EyeIconButton = ({ setShowPassword, showPassword }) => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3"
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );

  return (
    <div className="min-h-screen flex">
      {/* Левая часть с градиентом */}
      <div className="hidden md:flex md:w-1/2 bg-[linear-gradient(151.1deg,#FFCBA5_3.26%,#E64D26_96.74%)] flex-col justify-center items-center text-white px-6">
        <img
          src={SignUpImg}
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
          <h2 className="text-2xl font-bold text-black mb-6">Регистрация</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Фамилия"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Имя"
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded focus:outline-none"
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
                placeholder="Придумайте пароль"
                className="w-full px-4 py-2 border rounded focus:outline-none pr-10"
                required
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setTimeout(() => setShowTooltip(false), 100)}
              />
              <EyeIconButton
                setShowPassword={setShowPassword}
                showPassword={showPassword}
              />
              {showTooltip && (
                <ul className="absolute z-10 top-full right-0 mt-2 bg-white text-black rounded shadow-lg text-xs w-[180px] px-3 py-2">
                  <div className="absolute -top-2 left-20 w-3 h-3 bg-white rotate-45 shadow-sm" />
                  <li className={passwordValidations.length ? "text-green-600" : "text-gray-400"}>✔ Длина 8 знаков</li>
                  <li className={passwordValidations.lowercase ? "text-green-600" : "text-gray-400"}>✔ Строчная буква</li>
                  <li className={passwordValidations.uppercase ? "text-green-600" : "text-gray-400"}>✔ Заглавная буква</li>
                  <li className={passwordValidations.number ? "text-green-600" : "text-gray-400"}>✔ Цифра</li>
                  <li className={passwordValidations.specialChar ? "text-green-600" : "text-gray-400"}>✔ Символ</li>
                </ul>
              )}
            </div>

            {/* Повтор пароля */}
            <div className="relative">
              <input
                type={showRepeatPassword ? "text" : "password"}
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
                className="w-full px-4 py-2 border rounded focus:outline-none pr-10 mb-[40px]"
                required
              />
              <EyeIconButton
                setShowPassword={setShowRepeatPassword}
                showPassword={showRepeatPassword}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-2 rounded text-lg font-semibold shadow-md hover:opacity-90 transition"
            >
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
