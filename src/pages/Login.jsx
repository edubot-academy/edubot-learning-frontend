import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import SignInImg from '../assets/images/edubot-signup.png';
import { FaBookOpen, FaGraduationCap, FaLock, FaRegCheckCircle } from 'react-icons/fa';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import ForgotPassword from '@features/auth/components/ForgotPassword';
import { getAuthAcquisitionPath, isPublicVideoSignupEnabled } from '@shared/auth-config';
import { executePendingAuthAction, getPostLoginPath } from '@features/auth/utils/postLogin';

const loginBenefits = [
    'Сатып алган курстарыңыз жана сабак прогрессиңиз сакталат.',
    'Ментор менен билдирүүлөр жана тапшырмалар бир жерде ачылат.',
    'Ролуңузга жараша туура окуу же башкаруу панели ачылат.',
];

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
        <div className="h-[calc(100vh-5.5rem)] overflow-hidden bg-[#f7f4ef] px-4 py-4 text-gray-950 dark:bg-[#111111] dark:text-white sm:px-6 lg:h-[calc(100vh-6.5rem)] lg:px-10">
            <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden overflow-hidden rounded-lg border border-white/35 bg-[#111827] text-white shadow-xl shadow-orange-950/10 dark:border-gray-700 lg:block">
                    <div className="relative flex h-full min-h-0 flex-col justify-between p-6 lg:p-8">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FB8A3C_0%,#EA580C_46%,#172033_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,rgba(23,32,51,0)_0%,rgba(17,24,39,0.86)_76%)]" />

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-orange-600 shadow-lg">
                                <FaGraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
                                    EduBot Learning
                                </p>
                                <h1 className="text-2xl font-bold">Окууга кайтуу</h1>
                            </div>
                        </div>

                        <div className="relative z-10 mx-auto flex w-full max-w-md justify-center py-4 lg:py-6">
                            <img
                                src={SignInImg}
                                alt="EduBot Learning"
                                className="h-[210px] w-full object-contain drop-shadow-xl lg:h-[250px]"
                            />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <FaBookOpen className="mb-3 h-5 w-5 text-orange-100" />
                                    <p className="text-xl font-bold">Курстар</p>
                                    <p className="mt-1 text-sm text-orange-50/80">сабактар жана материалдар</p>
                                </div>
                                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <FaLock className="mb-3 h-5 w-5 text-orange-100" />
                                    <p className="text-xl font-bold">Коопсуз</p>
                                    <p className="mt-1 text-sm text-orange-50/80">жеке окуу панели</p>
                                </div>
                            </div>

                            <ul className="space-y-2 text-sm leading-6 text-orange-50/85">
                                {loginBenefits.map((benefit) => (
                                    <li key={benefit} className="flex gap-3">
                                        <FaRegCheckCircle className="mt-1 h-4 w-4 shrink-0 text-orange-100" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center">
                    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/60 dark:border-gray-700 dark:bg-[#1f1f1f] dark:shadow-black/25 sm:p-6">
                        <div className="mb-5 space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50/80 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-amber-500/10 dark:text-amber-200">
                                <FaLock className="h-3.5 w-3.5" />
                                Аккаунтка кирүү
                            </div>
                            <h2 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">Кайра кош келиңиз</h2>
                            <p className="text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                                Окуу панелиңизге, сатып алган курстарыңызга жана билдирүүлөрүңүзгө кирүү үчүн аккаунтуңуз менен кириңиз.
                            </p>
                        </div>

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
                                className="mx-auto mt-2 flex rounded-md px-2 py-1 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1f1f1f]"
                                onClick={() => setForgotPassword(!forgotPassword)}
                                aria-expanded={forgotPassword}
                            >
                                Сырсөздү унуттуңузбу?
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                aria-busy={loading}
                                className="mt-4 min-h-[48px] w-full rounded-lg bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] py-3 text-base font-semibold text-white shadow-[0px_4px_14px_0px_rgba(225,66,25,0.45)] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:shadow-[0px_4px_12px_0px_rgba(225,66,25,0.28)] dark:focus:ring-offset-[#1f1f1f] sm:text-lg"
                            >
                                {loading ? 'Кирүүдө...' : 'Кирүү'}
                            </button>
                        </form>

                        <p className="mt-4 rounded-lg border border-transparent bg-gray-50 px-4 py-3 text-center text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-[#292929] dark:text-[#a6adba]">
                            {isPublicVideoSignupEnabled ? (
                                <>
                                    Аккаунтуңуз жокпу?{' '}
                                    <Link to={getAuthAcquisitionPath()} className="font-semibold text-blue-500 hover:underline">
                                        Катталуу
                                    </Link>
                                </>
                            ) : (
                                'Эсеп CRM аркылуу ачылат. Кирүү же сырсөздү калыбына келтирүү жолун колдонуңуз.'
                            )}
                        </p>
                    </div>
                </section>
            </div>
            {forgotPassword && <ForgotPassword onClose={() => setForgotPassword(false)} />}
        </div>
    );
};

export default LoginPage;
