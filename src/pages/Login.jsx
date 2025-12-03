import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import SignInImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/UI/forms/DefaultLabel';
import LabelPassword from '@shared-ui/UI/forms/LabelPassword';
import ForgotPassword from '@features/auth/components/ForgotPassword';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
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
            navigate('/');
        } catch (err) {
            setError('Email же сырсөз туура эмес. Кайра аракет кылыңыз.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
        <div className="min-h-screen flex relative">
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

                    <form onSubmit={handleLogin} className="space-y-2">
                        {/* Email */}
                        <DefaultLabel
                            label="Email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder=""
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        {/* Пароль */}
                        <LabelPassword
                            label="Пароль"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder=""
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        <div
                            className="flex justify-center text-sm text-blue-500 hover:underline cursor-pointer mt-2"
                            onClick={() => setForgotPassword(!forgotPassword)}
                        >
                            Забыли пароль?
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-3 rounded text-lg font-semibold shadow-md hover:opacity-90 transition"
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-gray-600 text-center">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
            {forgotPassword && <ForgotPassword onClose={() => setForgotPassword(false)} />}
        </div>
    );
};

export default LoginPage;
