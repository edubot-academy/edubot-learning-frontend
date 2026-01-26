import React, { useState, useContext, useEffect } from 'react'; // Добавили useEffect
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Добавили useLocation
import { loginUser } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Добавили useCart
import { useFavourites } from '../context/FavouritesContext'; // Добавили useFavourites
import SignInImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import ForgotPassword from '@features/auth/components/ForgotPassword';
import { toast } from 'react-hot-toast'; // Добавили toast

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const { addToCart } = useCart(); // Добавили addToCart
    const { toggleFavourite } = useFavourites(); // Добавили toggleFavourite
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // Добавили location

    // Функция для выполнения отложенного действия
    const executePendingAction = async () => {
        const pendingActionStr = localStorage.getItem('pendingAction');
        if (!pendingActionStr) return;

        try {
            const pendingAction = JSON.parse(pendingActionStr);
            
            // Проверяем, не устарело ли действие (больше 24 часов)
            const now = Date.now();
            const actionAge = now - pendingAction.timestamp;
            const MAX_ACTION_AGE = 24 * 60 * 60 * 1000; // 24 часа
            
            if (actionAge > MAX_ACTION_AGE) {
                localStorage.removeItem('pendingAction');
                return;
            }

            // Выполняем действие в зависимости от типа
            if (pendingAction.type === 'favourite') {
                const courseData = {
                    id: pendingAction.courseId,
                    title: pendingAction.courseTitle || `Курс ${pendingAction.courseId}`,
                    // Добавьте остальные необходимые поля, если есть
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
                    // Добавьте остальные необходимые поля, если есть
                };
                const result = await addToCart(courseData);
                if (result.success) {
                    toast.success('Курс добавлен в корзину!');
                    navigate('/cart');
                }
            }
            
            // Удаляем выполненное действие
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
            const { access_token, user } = response.data;
            login(user, access_token);
            
            // Выполняем отложенное действие после успешного входа
            await executePendingAction();
            
            // Если нет отложенного действия, перенаправляем на главную
            if (!localStorage.getItem('pendingAction')) {
                navigate('/');
            }
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
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Кирүү</h2>

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
                        Аккаунтуңуз жокпу?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Катталуу
                        </Link>
                    </p>
                </div>
            </div>
            {forgotPassword && <ForgotPassword onClose={() => setForgotPassword(false)} />}
        </div>
    );
};

export default LoginPage;