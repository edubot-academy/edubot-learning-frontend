import student from '@assets/images/RightLittleMan.png';
import Background from '@assets/images/background.png';
import BackgroundDark from '@assets/images/background-dark.png';
import LogoStudies from '@assets/images/logoEduBot.png';
import Button from '@shared/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@app/providers';
import { FiBookOpen, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';

const proofPoints = [
    'Видео курстарды өзүңүзгө ыңгайлуу темпте баштаңыз',
    'Прогресс, тесттер жана сертификаттар бир аккаунтта сакталат',
    'Суроолор болсо команда менен түз байланышууга болот',
];

function Apply() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const primaryPath = user ? '/courses' : '/login';

    return (
        <section className="bg-white px-4 py-16 text-[#141619] dark:bg-[#1A1A1A] dark:text-[#E8ECF3] sm:px-6 lg:px-12 lg:py-20">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="relative order-2 min-h-[320px] overflow-hidden rounded-[28px] border border-gray-200 bg-[#f7f8fb] dark:border-[#2A2E35] dark:bg-[#141619] lg:order-1 lg:min-h-[440px]">
                    <img
                        src={Background}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover opacity-90 dark:hidden"
                    />
                    <img
                        src={BackgroundDark}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 hidden h-full w-full object-cover opacity-90 dark:block"
                    />
                    <img
                        src={student}
                        alt="EduBot окуучусу"
                        className="absolute bottom-0 left-1/2 h-[88%] max-h-[430px] w-auto -translate-x-1/2 object-contain"
                    />
                    <div className="absolute left-5 top-5 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1f2430]/90">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">EduBot Learning</p>
                        <p className="mt-1 text-sm font-medium text-[#3E424A] dark:text-[#c8ced8]">Окуу темпиңиз дайыма көрүнүп турат</p>
                    </div>
                </div>

                <div className="order-1 rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.55)] dark:border-[#2A2E35] dark:bg-[#141619] sm:p-8 lg:order-2">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10">
                            <img
                                src={LogoStudies}
                                alt=""
                                aria-hidden="true"
                                className="h-12 w-12 object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
                                Кийинки кадам
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#141619] dark:text-[#E8ECF3] sm:text-3xl">
                                Окууну бүгүн баштап, прогрессти бир жерде сактаңыз
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3E424A] dark:text-[#a6adba] sm:text-base">
                                Курстарды көрүп, өзүңүзгө туура багытты тандаңыз. Киргенден кийин сабактар, тесттер жана сертификаттар жеке кабинетиңизде уланат.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        {proofPoints.map((point) => (
                            <div key={point} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-[#2A2E35] dark:bg-[#1A1A1A]">
                                <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                                <p className="text-sm leading-6 text-[#3E424A] dark:text-[#c8ced8]">{point}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button
                            className="w-full sm:w-auto"
                            icon={<FiBookOpen aria-hidden="true" />}
                            onClick={() => navigate(primaryPath)}
                        >
                            {user ? 'Курстарды көрүү' : 'Кирип, окууну баштоо'}
                        </Button>
                        <Link
                            to="/contact"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-[#141619] transition hover:border-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-[#3A3F49] dark:text-[#E8ECF3] dark:hover:border-orange-400 dark:hover:text-orange-300 sm:w-auto md:text-base"
                        >
                            <FiMessageCircle aria-hidden="true" />
                            Кеңеш алуу
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Apply;
