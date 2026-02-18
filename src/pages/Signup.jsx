import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser } from '@services/api';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import SignUpImg from '../assets/images/edubot-signup.png';
import toast from 'react-hot-toast';
import DefaultLabel from '@shared-ui/forms/DefaultLabel';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        email: '',
        password: '',
        repeatPassword: '',
        phoneNumber: '',
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
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();

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

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.repeatPassword) {
            setError('Сырсөздөр дал келген жок.');
            setLoading(false);
            return;
        }

        const phone = formData.phoneNumber;
        if (phone) {
            const digitsOnly = phone.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                toast.error('Телефон номери кеминде 10 цифра болушу керек.');
                setLoading(false);
                return;
            }

            if (!/^\+\d{10,15}$/.test(phone)) {
                toast.error(
                    'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456 же +14155552671'
                );
                setLoading(false);
                return;
            }
        }

        try {
            const response = await registerUser({
                fullName: `${formData.lastName} ${formData.firstName}`,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber || undefined,
            });

            const { access_token, user } = response.data;
            login(user, access_token);

            await executePendingAction();

            if (!localStorage.getItem('pendingAction')) {
                navigate('/');
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
                    alt="Sign up"
                    className="object-contain mb-6 w-[400px] h-[300px]"
                />
                <h2 className="font-bold text-center text-[50px]">
                    EDUBOT <br /> LEARNING
                </h2>
            </div>

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Катталуу</h2>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <DefaultLabel
                            label="Фамилияңызды жазыңыз"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder=""
                            required={true}
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
                            width="w-full"
                            className="py-2"
                        />

                        <DefaultLabel
                            label="Email почтаңызды жазыңыз"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=""
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        <div className="py-2">
                            <PhoneInput onChange={handlePhoneChange} value={formData.phoneNumber} />
                        </div>

                        <div className="relative py-2">
                            <LabelPassword
                                label="Сырсөз ойлоп табыңыз"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder=""
                                required={true}
                                width="w-full"
                                onFocus={() => setShowTooltip(true)}
                                onBlur={() => setTimeout(() => setShowTooltip(false), 100)}
                            />

                            {showTooltip && (
                                <ul className="absolute z-10 top-full left-0 mt-1 bg-white text-black rounded shadow-lg text-xs w-full px-3 py-2 border">
                                    <li
                                        className={
                                            passwordValidations.length
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                        }
                                    >
                                        ✔ 8 белгиден турат
                                    </li>
                                    <li
                                        className={
                                            passwordValidations.lowercase
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                        }
                                    >
                                        ✔ Кичине тамга
                                    </li>
                                    <li
                                        className={
                                            passwordValidations.uppercase
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                        }
                                    >
                                        ✔ Баш тамга
                                    </li>
                                    <li
                                        className={
                                            passwordValidations.number
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                        }
                                    >
                                        ✔ Сан түрүндө
                                    </li>
                                    <li
                                        className={
                                            passwordValidations.specialChar
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                        }
                                    >
                                        ✔ Белги
                                    </li>
                                </ul>
                            )}
                        </div>

                        <div className="py-2">
                            <LabelPassword
                                label="Повторите пароль"
                                name="repeatPassword"
                                value={formData.repeatPassword}
                                onChange={handleChange}
                                placeholder=""
                                required={true}
                                width="w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-3 rounded text-lg font-semibold hover:opacity-90 transition"
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
