import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser } from '@services/api';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import SignUpImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import { FaBookOpen, FaCheckCircle, FaCreditCard, FaUserPlus } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import Loader from '@shared/ui/Loader';
import { executePendingAuthAction, getPostLoginPath } from '@features/auth/utils/postLogin';
import useResourceProgress from '@features/externalResources/hooks/useResourceProgress';
import { useTranslation } from 'react-i18next';
import { parseApiError } from '@shared/api/error';
import { isCareerIntent } from '@features/career/utils/careerIntent';

const getPasswordChecks = (password) => ({
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const PASSWORD_RULE_KEYS = ['length', 'lowercase', 'uppercase', 'number', 'specialChar'];
const SIGNUP_STEP_ICONS = [FaUserPlus, FaCreditCard, FaBookOpen];

const validateSignupForm = (formData, t) => {
    const errors = {};
    const passwordChecks = getPasswordChecks(formData.password);

    if (!formData.lastName.trim()) errors.lastName = t('public.auth.signup.validation.lastName');
    if (!formData.firstName.trim()) errors.firstName = t('public.auth.signup.validation.firstName');
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
        errors.email = t('public.auth.signup.validation.email');
    }
    if (!Object.values(passwordChecks).every(Boolean)) {
        errors.password = t('public.auth.signup.validation.password');
    }
    if (formData.password !== formData.repeatPassword) {
        errors.repeatPassword = t('public.auth.signup.validation.repeatPassword');
    }
    if (formData.phoneNumber && !/^\+\d{10,15}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = t('public.auth.signup.validation.phone');
    }

    return errors;
};

const SignupPage = () => {
    const { t } = useTranslation();
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, login } = useContext(AuthContext);

    // Already-authenticated user visiting /register?intent=... → skip signup, go process intent
    useEffect(() => {
        if (user && isCareerIntent(location.search)) {
            const params = new URLSearchParams(location.search);
            navigate(`/career?${params.toString()}`, { replace: true });
        }
    }, [user, location.search, navigate]);

    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        email: '',
        password: '',
        repeatPassword: '',
        phoneNumber: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPasswordRules, setShowPasswordRules] = useState(false);

    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();
    const { saveResource } = useResourceProgress();

    const passwordValidations = getPasswordChecks(formData.password);
    const signupSteps = t('public.auth.signup.steps', { returnObjects: true }).map(
        (step, index) => ({
            ...step,
            icon: SIGNUP_STEP_ICONS[index],
        })
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
        setFieldErrors((prev) => {
            if (!prev.phoneNumber) return prev;
            const next = { ...prev };
            delete next.phoneNumber;
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const nextErrors = validateSignupForm(formData, t);

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            setError(t('public.auth.signup.validation.form'));
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            const response = await registerUser({
                fullName: `${formData.lastName} ${formData.firstName}`,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber || undefined,
            });

            const { user } = response.data;
            login(user);

            const handledPendingAction = await executePendingAuthAction({
                addToCart,
                toggleFavourite,
                saveResource,
                navigate,
            });

            if (!handledPendingAction) {
                navigate(getPostLoginPath(user, location), { replace: true });
            }
        } catch (err) {
            setError(parseApiError(err, t('public.auth.signup.errorFallback')).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5.5rem)] bg-[#f7f4ef] px-4 py-4 text-gray-950 dark:bg-[#111111] dark:text-white sm:px-6 lg:h-[calc(100vh-6.5rem)] lg:min-h-0 lg:overflow-hidden lg:px-10">
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:h-full lg:grid-cols-[1fr_1.05fr]">
                <section className="hidden overflow-hidden rounded-lg border border-white/35 bg-[#111827] text-white shadow-xl shadow-orange-950/10 dark:border-gray-700 lg:block">
                    <div className="relative flex h-full min-h-0 flex-col justify-between p-5 lg:p-6">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FB8A3C_0%,#EA580C_44%,#172033_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,rgba(23,32,51,0)_0%,rgba(17,24,39,0.88)_76%)]" />

                        <div className="relative z-10">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-orange-600 shadow-lg">
                                <FaUserPlus className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
                                EduBot Learning
                            </p>
                            <h1 className="mt-2 text-2xl font-bold leading-tight">
                                {t('public.auth.signup.sideTitle')}
                            </h1>
                            <p className="mt-2 max-w-md text-sm leading-5 text-orange-50/85">
                                {t('public.auth.signup.sideIntro')}
                            </p>
                        </div>

                        <div className="relative z-10 mx-auto flex w-full max-w-sm justify-center py-2">
                            <img
                                src={SignUpImg}
                                alt={t('public.auth.signup.imageAlt')}
                                className="h-[145px] w-full object-contain drop-shadow-xl lg:h-[170px]"
                                width="384"
                                height="170"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                        </div>

                        <div className="relative z-10 space-y-2">
                            {signupSteps.map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="flex gap-3 rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur"
                                >
                                    <Icon className="mt-1 h-4 w-4 shrink-0 text-orange-100" />
                                    <div>
                                        <p className="text-sm font-semibold">{title}</p>
                                        <p className="mt-0.5 text-xs leading-4 text-orange-50/80 sm:text-sm sm:leading-5">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center">
                    <div className="w-full rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/60 dark:border-gray-700 dark:bg-[#1f1f1f] dark:shadow-black/25 sm:p-6">
                        <div className="mb-4 space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50/80 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-amber-500/10 dark:text-amber-200">
                                <FaCheckCircle className="h-3.5 w-3.5" />
                                {t('public.auth.signup.badge')}
                            </div>
                            <h2 className="text-2xl font-bold text-black dark:text-white">
                                {t('public.auth.signup.title')}
                            </h2>
                            <p className="text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                                {t('public.auth.signup.intro')}
                            </p>
                        </div>

                        {error && (
                            <p
                                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-x-4 gap-y-1 md:grid-cols-2"
                        >
                            <DefaultLabel
                                label={t('public.auth.signup.fields.lastName')}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder=""
                                required={true}
                                error={fieldErrors.lastName}
                                autoComplete="family-name"
                                width="w-full"
                                className="py-1.5"
                            />

                            <DefaultLabel
                                label={t('public.auth.signup.fields.firstName')}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder=""
                                required={true}
                                error={fieldErrors.firstName}
                                autoComplete="given-name"
                                width="w-full"
                                className="py-1.5"
                            />

                            <div className="md:col-span-2">
                                <DefaultLabel
                                    label={t('public.auth.signup.fields.email')}
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder=""
                                    required={true}
                                    error={fieldErrors.email}
                                    autoComplete="email"
                                    width="w-full"
                                    className="py-1.5"
                                />
                            </div>

                            <div className="py-1.5 md:col-span-2">
                                <PhoneInput
                                    id="signup-phone"
                                    name="phoneNumber"
                                    onChange={handlePhoneChange}
                                    value={formData.phoneNumber}
                                    label={t('public.auth.signup.fields.phone')}
                                    helperText={t('public.auth.signup.phoneHelper')}
                                    error={fieldErrors.phoneNumber}
                                    floatingLabel
                                />
                            </div>

                            <div className="relative py-1.5 md:col-span-2">
                                <LabelPassword
                                    label={t('public.auth.signup.fields.password')}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder=""
                                    required={true}
                                    error={fieldErrors.password}
                                    autoComplete="new-password"
                                    describedBy={
                                        showPasswordRules ? 'signup-password-rules' : undefined
                                    }
                                    onFocus={() => setShowPasswordRules(true)}
                                    onBlur={() => setShowPasswordRules(false)}
                                    width="w-full"
                                />
                                {showPasswordRules && (
                                    <div
                                        id="signup-password-rules"
                                        className="mt-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-[#2A2E35] dark:bg-[#222222] lg:absolute lg:left-0 lg:right-0 lg:top-full lg:z-20 lg:shadow-lg"
                                        role="status"
                                        aria-label={t('public.auth.signup.passwordRulesLabel')}
                                    >
                                        <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                            {PASSWORD_RULE_KEYS.map((key) => (
                                                <li
                                                    key={key}
                                                    className={
                                                        passwordValidations[key]
                                                            ? 'text-green-600'
                                                            : 'text-gray-500 dark:text-[#a6adba]'
                                                    }
                                                >
                                                    {passwordValidations[key] ? '✓' : '•'}{' '}
                                                    {t(`public.auth.signup.passwordRules.${key}`)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="py-1.5 md:col-span-2">
                                <LabelPassword
                                    label={t('public.auth.signup.fields.repeatPassword')}
                                    name="repeatPassword"
                                    value={formData.repeatPassword}
                                    onChange={handleChange}
                                    placeholder=""
                                    required={true}
                                    error={fieldErrors.repeatPassword}
                                    autoComplete="new-password"
                                    width="w-full"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                aria-busy={loading}
                                className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] py-3 text-base font-semibold text-white shadow-[0px_4px_14px_0px_rgba(225,66,25,0.45)] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:shadow-[0px_4px_12px_0px_rgba(225,66,25,0.28)] dark:focus:ring-offset-[#1f1f1f] md:col-span-2"
                            >
                                {loading ? (
                                    <Loader fullScreen={false} />
                                ) : (
                                    t('public.auth.signup.submit')
                                )}
                            </button>
                        </form>

                        <p className="mt-3 rounded-lg border border-transparent bg-gray-50 px-4 py-2.5 text-center text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-[#292929] dark:text-[#a6adba]">
                            {t('public.auth.signup.haveAccount')}{' '}
                            <Link to="/login" className="text-blue-500 hover:underline">
                                {t('public.auth.signup.login')}
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SignupPage;
