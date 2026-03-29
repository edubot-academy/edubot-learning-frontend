import { useContext, useMemo, useState } from 'react';
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
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!token) {
            setError('Аккаунтту даярдоо шилтемеси табылган жок.');
            return;
        }

        if (password.length < 8) {
            setError('Сырсөз кеминде 8 белгиден турушу керек.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Сырсөздөр дал келген жок.');
            return;
        }

        setLoading(true);
        try {
            const response = await completeAccountSetup({ token, newPassword: password });
            const { user, access_token } = response.data;

            login(user);
            setStoredToken(access_token);

            toast.success('Аккаунт даяр болду. Эми LMSке кире аласыз.');
            navigate('/', { replace: true });
        } catch (setupError) {
            setError(
                setupError?.response?.data?.message ||
                'Шилтеме жараксыз же мөөнөтү өтүп кеткен. Жаңы шилтеме сураныңыз.',
            );
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

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <LabelPassword
                            label="Жаңы сырсөз"
                            name="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        <LabelPassword
                            label="Сырсөздү кайталаңыз"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required={true}
                            width="w-full"
                            className="py-2"
                        />

                        <button
                            type="submit"
                            disabled={loading || !token}
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
