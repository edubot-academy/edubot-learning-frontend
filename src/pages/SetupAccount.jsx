import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { completeAccountSetup } from '@services/api';
import { setStoredToken } from '@shared/api/client';
import { AuthContext } from '../context/AuthContext';
import LabelPassword from '@shared-ui/forms/LabelPassword';
import SignUpImg from '../assets/images/edubot-signup.png';

const SetupAccountPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const redirectTimerRef = useRef(null);
    const hasToken = Boolean(token);
    const setupComplete = status.type === 'success';
    const passwordRules = useMemo(() => [
        {
            id: 'length',
            label: 'Кеминде 8 белги',
            isMet: formData.password.length >= 8,
        },
        {
            id: 'match',
            label: 'Кайталоо сырсөз менен дал келет',
            isMet: Boolean(formData.confirmPassword) && formData.password === formData.confirmPassword,
        },
    ], [formData.confirmPassword, formData.password]);
    const hasPasswordMismatch =
        Boolean(formData.confirmPassword) && formData.password !== formData.confirmPassword;

    useEffect(() => () => {
        if (redirectTimerRef.current) {
            window.clearTimeout(redirectTimerRef.current);
        }
    }, []);

    const updateField = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        setStatus((prev) => (prev.type === 'error' ? { type: '', message: '' } : prev));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus({ type: '', message: '' });

        if (!hasToken) {
            setStatus({ type: 'error', message: 'Аккаунтту даярдоо шилтемеси табылган жок.' });
            return;
        }

        if (formData.password.length < 8) {
            setStatus({ type: 'error', message: 'Сырсөз кеминде 8 белгиден турушу керек.' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Сырсөздөр дал келген жок.' });
            return;
        }

        setLoading(true);
        try {
            const response = await completeAccountSetup({ token, newPassword: formData.password });
            const { user, access_token } = response.data;

            login(user);
            setStoredToken(access_token);

            setStatus({
                type: 'success',
                message: 'Аккаунт даяр болду. LMSке өткөрүлүп жатасыз.',
            });
            toast.success('Аккаунт даяр болду. Эми LMSке кире аласыз.');
            if (redirectTimerRef.current) {
                window.clearTimeout(redirectTimerRef.current);
            }
            redirectTimerRef.current = window.setTimeout(() => navigate('/', { replace: true }), 900);
        } catch (setupError) {
            setStatus({
                type: 'error',
                message:
                    setupError?.response?.data?.message ||
                    'Шилтеме жараксыз же мөөнөтү өтүп кеткен. Жаңы шилтеме сураныңыз.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative">
            <div className="hidden md:flex md:w-1/2 bg-[linear-gradient(151.1deg,#FFCBA5_3.26%,#E64D26_96.74%)] flex-col justify-center items-center text-white px-6">
                <img
                    src={SignUpImg}
                    alt="Account setup"
                    className="object-contain mb-6 w-[400px] h-[300px]"
                />
                <h2 className="font-bold text-center text-[50px]">
                    EDUBOT <br /> LEARNING
                </h2>
            </div>

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-3">Аккаунтту даярдоо</h2>
                    <p className="text-sm text-gray-600 dark:text-[#a6adba] mb-6">
                        Бир жолу сырсөз коюңуз. Кийинки кирүүлөрдө email жана ушул сырсөз менен киресиз.
                    </p>

                    {!hasToken && (
                        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                            <p className="font-semibold">Аккаунт даярдоо шилтемеси жок.</p>
                            <p className="mt-1">
                                Бул барак бир жолку чакыруу шилтемеси менен иштейт. CRM менеджерден жаңы чакыруу сураңыз же кирүү барагына кайтыңыз.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                    to="/login"
                                    className="rounded bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"
                                >
                                    Кирүү барагына өтүү
                                </Link>
                                <Link
                                    to="/contact"
                                    className="rounded border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/40"
                                >
                                    Жардам суроо
                                </Link>
                            </div>
                        </div>
                    )}

                    {status.message && (
                        <div
                            className={`mb-4 rounded-lg border p-3 text-sm ${
                                status.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
                            }`}
                            role={status.type === 'error' ? 'alert' : 'status'}
                        >
                            <p>{status.message}</p>
                            {hasToken && status.type === 'error' && (
                                <p className="mt-2">
                                    Эгер шилтеменин мөөнөтү өтсө, CRM менеджерден жаңы чакыруу сураңыз.
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <LabelPassword
                            label="Жаңы сырсөз"
                            name="password"
                            value={formData.password}
                            onChange={updateField('password')}
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                            <p className="font-semibold">Сырсөз эрежелери</p>
                            <ul className="mt-2 space-y-1">
                                {passwordRules.map((rule) => (
                                    <li
                                        key={rule.id}
                                        className={rule.isMet ? 'text-emerald-700 dark:text-emerald-300' : ''}
                                    >
                                        {rule.isMet ? '✓' : '•'} {rule.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <LabelPassword
                            label="Сырсөздү кайталаңыз"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={updateField('confirmPassword')}
                            required={true}
                            width="w-full"
                            className="py-2"
                        />
                        {hasPasswordMismatch && (
                            <p className="text-xs font-medium text-red-600 dark:text-red-300">
                                Сырсөздөр азырынча дал келген жок.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !hasToken || setupComplete}
                            className="w-full mt-4 shadow-[0px_5px_21.3px_0px_#E14219BF] bg-[linear-gradient(180deg,#FF8C6E_0%,#E14219_100%)] text-white py-3 rounded text-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                        >
                            {loading ? 'Даярдалууда...' : 'Аккаунтту иштетүү'}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-gray-600 dark:text-[#a6adba] text-center">
                        Шилтеме иштебей калса, CRM менеджерден жаңысың сураңыз же{' '}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            кирүү барагына өтүңүз
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupAccountPage;
