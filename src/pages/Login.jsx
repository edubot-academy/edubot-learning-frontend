import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import SignInImg from "../assets/images/sign-in.png";
import Apple from "../assets/images/apple.png";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
        {/* Сол жак: форма */}
        <div className="md:w-1/2 w-full flex flex-col items-start px-4">
          <h2 className="text-4xl font-bold mb-6">Кирүү</h2>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4 w-[340px]">
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
                {showPassword ? EyeOffIcon : EyeIcon}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-white">
              <label className="relative flex items-center gap-2 cursor-pointer select-none bg-[#1e605e]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="peer appearance-none w-5 h-5 border border-white rounded bg-[#1e605e] checked:bg-orange-500 checked:border-orange-500"
                />
                <svg
                  className="absolute left-1 top-1 w-3 h-3 text-white hidden peer-checked:block pointer-events-none"
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
                Эсимде болсун
              </label>
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

          <div className="flex items-center justify-center w-[340px] my-5 text-white">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2">же</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-3 w-[340px]">
            <button className="flex items-center justify-center gap-2 border border-white text-white py-3 rounded-xl w-1/2 hover:bg-white hover:text-[#1e605e] transition">
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                <path
                  fill="#4285f4"
                  d="M533.5 278.4c0-17.8-1.5-35.6-4.5-52.9H272v99.9h146.9c-6.4 34.6-25.9 64-55.1 83.5v69h88.9c52.1-48 81.8-118.9 81.8-199.5z"
                />
                <path
                  fill="#34a853"
                  d="M272 544.3c73.6 0 135.2-24.4 180.3-66.5l-88.9-69c-24.8 16.7-56.4 26.5-91.4 26.5-70 0-129.2-47.2-150.5-110.7H29.6v69.6c45 89.5 137.4 150.1 242.4 150.1z"
                />
                <path
                  fill="#fbbc04"
                  d="M121.5 324.6c-10.4-30.6-10.4-63.9 0-94.5v-69.6H29.6c-36.8 73.8-36.8 160.3 0 234.1z"
                />
                <path
                  fill="#ea4335"
                  d="M272 107.7c39.9-.6 78.4 14.9 107.9 42.6l80.5-80.5C422 24.3 348.7-.4 272 0 166.9 0 74.5 60.6 29.6 150.1l91.9 69.6c21.3-63.6 80.5-110.8 150.5-110.8z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button className="flex items-center justify-center gap-2 border border-white text-white py-3 rounded-xl w-1/2 hover:bg-white hover:text-[#1e605e] transition">
              <img src={Apple} alt="Apple" className="w-5 h-5" />
              <span>Apple</span>
            </button>
          </div>

          <p className="mt-5 text-sm text-white text-center w-[340px]">
            Аккаунтуңуз жокпу?{" "}
            <Link to="/register" className="text-orange-300 hover:underline">
              Катталуу
            </Link>
          </p>
        </div>

        {/* Оң жактагы сүрөт — мобилдикте жок */}
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
