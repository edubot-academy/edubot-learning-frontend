import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import SignInImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import ForgotPassword from '@features/auth/components/ForgotPassword';
import { getAuthAcquisitionPath, isPublicVideoSignupEnabled } from '@shared/auth-config';
import { executePendingAuthAction, getPostLoginPath } from '@features/auth/utils/postLogin';

const validateLoginForm = ({ email, password }) => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        errors.email = 'Email дарегиңизди жазыңыз.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(trimmedEmail)) {
        errors.email = 'Туура email дарегин жазыңыз.';
    }

    if (!password) {
        errors.password = 'Сырсөздү жазыңыз.';
    }

    return errors;
};

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        const nextFieldErrors = validateLoginForm({ email, password });

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError('Кирүү үчүн email жана сырсөздү туура толтуруңуз.');
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const response = await loginUser({ email, password });
            const { user, access_token } = response.data;

            login(user);

            // Token is automatically stored by the API client interceptor
            // but we can ensure it's stored here as well
            if (access_token) {
                localStorage.setItem('auth_token', access_token);
            }

            const handledPendingAction = await executePendingAuthAction({
                addToCart,
                toggleFavourite,
                navigate,
            });

            if (!handledPendingAction) {
                navigate(getPostLoginPath(user, location), { replace: true });
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
        setFieldErrors((prev) => {
            if (!prev.email) return prev;
            const next = { ...prev };
            delete next.email;
            return next;
        });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setFieldErrors((prev) => {
            if (!prev.password) return prev;
            const next = { ...prev };
            delete next.password;
            return next;
        });
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

                    <p className="mb-5 text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                        Окуу панелиңизге, сатып алган курстарыңызга жана билдирүүлөрүңүзгө кирүү үчүн аккаунтуңуз менен кириңиз.
                    </p>

                    {error && (
                        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleLogin} className="space-y-2">
                        <DefaultLabel
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder=""
                            required={true}
                            error={fieldErrors.email}
                            autoComplete="email"
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
                            error={fieldErrors.password}
                            autoComplete="current-password"
                            width="w-full"
                            className="py-2"
                        />

                        <button
                            type="button"
                            className="mx-auto mt-2 flex rounded-md px-2 py-1 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            onClick={() => setForgotPassword(!forgotPassword)}
                        >
                            Сырсөздү унуттуңузбу?
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full mt-4 shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-3 rounded text-lg font-semibold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-75"
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
