import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import SignInImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import ForgotPassword from '@features/auth/components/ForgotPassword';
import { toast } from 'react-hot-toast';
import { getAuthAcquisitionPath, isPublicVideoSignupEnabled } from '@shared/auth-config';
import { getAuthDebugInfo } from '@shared/utils/auth';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const executePendingAction = async () => {
        const pendingActionStr = localStorage.getItem('pendingAction');
        if (!pendingActionStr) return;

        try {
            const pendingAction = JSON.parse(pendingActionStr);

            const now = Date.now();
            const actionAge = now - pendingAction.timestamp;
            const MAX_ACTION_AGE = 24 * 60 * 60 * 1000;

            if (actionAge > MAX_ACTION_AGE) {
                localStorage.removeItem('pendingAction');
                return;
            }

            if (pendingAction.type === 'favourite') {
                const courseData = {
                    id: pendingAction.courseId,
                    title: pendingAction.courseTitle || `Курс ${pendingAction.courseId}`,
                };
                const result = await toggleFavourite(courseData);
                if (result.success) {
                    toast.success('Курс добавлен в избранное!');
                    navigate('/favourite');
                }
            } else if (pendingAction.type === 'cart') {
                const courseData = {
                    id: pendingAction.courseId,
                    title: pendingAction.courseTitle,
                };
                const result = await addToCart(courseData);
                if (result.success) {
                    toast.success('Курс добавлен в корзину!');
                    navigate('/cart');
                }
            }

            localStorage.removeItem('pendingAction');

        } catch (error) {
            console.error('Failed to execute pending action:', error);
            localStorage.removeItem('pendingAction');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await loginUser({ email, password });
            const { user, access_token } = response.data;

            // Debug logging for cross-domain development
            const debugInfo = getAuthDebugInfo();

            login(user);

            // Token is automatically stored by the API client interceptor
            // but we can ensure it's stored here as well
            if (access_token) {
                localStorage.setItem('auth_token', access_token);
            }

            await executePendingAction();

            if (!localStorage.getItem('pendingAction')) {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
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

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Кирүү</h2>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <form onSubmit={handleLogin} className="space-y-2">
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
                            Сырсөздү унуттуңузбу?
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-3 rounded text-lg font-semibold hover:opacity-90 transition"
                        >
                            {loading ? 'Кирүүдө...' : 'Кирүү'}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-gray-600 dark:text-[#a6adba] text-center">
                        {isPublicVideoSignupEnabled ? (
                            <>
                                Аккаунтуңуз жокпу?{' '}
                                <Link to={getAuthAcquisitionPath()} className="text-blue-500 hover:underline">
                                    Катталуу
                                </Link>
                            </>
                        ) : (
                            'Эсеп CRM аркылуу ачылат. Кирүү же сырсөздү калыбына келтирүү жолун колдонуңуз.'
                        )}
                    </p>
                </div>
            </div>
            {forgotPassword && <ForgotPassword onClose={() => setForgotPassword(false)} />}
        </div>
    );
};

export default LoginPage;
