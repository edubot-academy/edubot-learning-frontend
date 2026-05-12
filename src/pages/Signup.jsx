import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser } from '@services/api';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import SignUpImg from '../assets/images/edubot-signup.png';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import Loader from '@shared/ui/Loader';
import { executePendingAuthAction, getPostLoginPath } from '@features/auth/utils/postLogin';

const getPasswordChecks = (password) => ({
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const PASSWORD_RULES = [
    ['length', 'Кеминде 8 белги'],
    ['lowercase', 'Кичине тамга'],
    ['uppercase', 'Баш тамга'],
    ['number', 'Сан'],
    ['specialChar', 'Атайын белги'],
];

const validateSignupForm = (formData) => {
    const errors = {};
    const passwordChecks = getPasswordChecks(formData.password);

    if (!formData.lastName.trim()) errors.lastName = 'Фамилияңызды жазыңыз.';
    if (!formData.firstName.trim()) errors.firstName = 'Атыңызды жазыңыз.';
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
        errors.email = 'Туура email дарегин жазыңыз.';
    }
    if (!Object.values(passwordChecks).every(Boolean)) {
        errors.password = 'Сырсөз бардык талаптарга жооп бериши керек.';
    }
    if (formData.password !== formData.repeatPassword) {
        errors.repeatPassword = 'Сырсөздөр дал келген жок.';
    }
    if (formData.phoneNumber && !/^\+\d{10,15}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Телефон эл аралык форматта болсун. Мисалы: +996700123456.';
    }

    return errors;
};

const SignupPage = () => {
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

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();

    const passwordValidations = getPasswordChecks(formData.password);

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
        const nextErrors = validateSignupForm(formData);

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            setError('Катталуу үчүн белгиленген талааларды оңдоңуз.');
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
                navigate,
            });

            if (!handledPendingAction) {
                navigate(getPostLoginPath(user, location), { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ката чыкты. Кайра аракет кылыңыз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden md:flex md:w-1/2 bg-[linear-gradient(151.1deg,#FFCBA5_3.26%,#E64D26_96.74%)] flex-col justify-center items-center text-white px-6">
                <img
                    src={SignUpImg}
                    alt="EduBot Learning"
                    className="object-contain mb-6 w-[400px] h-[300px]"
                />
                <h2 className="font-bold text-center text-[50px]">
                    EDUBOT <br /> LEARNING
                </h2>
            </div>

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Катталуу</h2>
                    <p className="mb-5 text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                        Өз алдынча видео курстарды сатып алып окуу үчүн аккаунт түзүңүз. Компаниялык же түз эфир курстары администратор аркылуу дайындалат.
                    </p>

                    {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <DefaultLabel
                            label="Фамилияңызды жазыңыз"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder=""
                            required={true}
                            error={fieldErrors.lastName}
                            autoComplete="family-name"
                            width="w-full"
                            className="py-2"
                        />

                        <DefaultLabel
                            label="Атыңызды жазыңыз"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder=""
                            required={true}
                            error={fieldErrors.firstName}
                            autoComplete="given-name"
                            width="w-full"
                            className="py-2"
                        />

                        <DefaultLabel
                            label="Email почтаңызды жазыңыз"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=""
                            required={true}
                            error={fieldErrors.email}
                            autoComplete="email"
                            width="w-full"
                            className="py-2"
                        />

                        <div className="py-2">
                            <label htmlFor="signup-phone" className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#a6adba]">
                                Телефон номери <span className="font-normal">(милдеттүү эмес)</span>
                            </label>
                            <PhoneInput
                                id="signup-phone"
                                name="phoneNumber"
                                onChange={handlePhoneChange}
                                value={formData.phoneNumber}
                                aria-invalid={Boolean(fieldErrors.phoneNumber)}
                                aria-describedby={fieldErrors.phoneNumber ? 'signup-phone-error' : 'signup-phone-help'}
                                className={fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}
                            />
                            <p id="signup-phone-help" className="mt-1 text-xs text-gray-500 dark:text-[#a6adba]">
                                Эл аралык формат: +996700123456.
                            </p>
                            {fieldErrors.phoneNumber && (
                                <p id="signup-phone-error" className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
                            )}
                        </div>

                        <div className="relative py-2">
                            <LabelPassword
                                label="Сырсөз ойлоп табыңыз"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder=""
                                required={true}
                                error={fieldErrors.password}
                                autoComplete="new-password"
                                describedBy={showPasswordRules ? 'signup-password-rules' : undefined}
                                onFocus={() => setShowPasswordRules(true)}
                                onBlur={() => setShowPasswordRules(false)}
                                width="w-full"
                            />
                            {showPasswordRules && (
                                <div
                                    id="signup-password-rules"
                                    className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-[#2A2E35] dark:bg-[#222222]"
                                    role="status"
                                    aria-label="Сырсөз талаптары"
                                >
                                    <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                        {PASSWORD_RULES.map(([key, label]) => (
                                            <li
                                                key={key}
                                                className={passwordValidations[key] ? 'text-green-600' : 'text-gray-500 dark:text-[#a6adba]'}
                                            >
                                                {passwordValidations[key] ? '✓' : '•'} {label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="py-2">
                            <LabelPassword
                                label="Сырсөздү кайталаңыз"
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
                            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] py-3 text-lg font-semibold text-white shadow-[0px_5px_21.3px_0px_#E14219BF] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {loading ? <Loader fullScreen={false} /> : 'Катталуу'}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-gray-600 dark:text-[#a6adba] text-center">
                        Каттоо эсебиңиз бар?{' '}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Кирүү
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
