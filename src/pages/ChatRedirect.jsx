import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiArrowRight, FiHome, FiMessageCircle } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { getCommunicationPath, getDashboardPath } from '@shared/utils/navigation';

const ChatRedirectFallback = ({ dashboardPath }) => (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-edubot-orange">
                    <FiMessageCircle className="h-7 w-7" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold text-gray-950">Чат бөлүмү табылган жок</h1>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                    Учурдагы аккаунт үчүн түз чат багыты аныкталган эмес. Панелиңизге кайтып, жеткиликтүү билдирүү же колдоо бөлүмүн тандаңыз.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        to={dashboardPath}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-edubot-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        <FiHome className="h-4 w-4" aria-hidden="true" />
                        Панелге кайтуу
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        Колдоо
                        <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    </main>
);

const ChatRedirect = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const communicationPath = getCommunicationPath(user);

    if (communicationPath) {
        return <Navigate to={communicationPath} replace />;
    }

    return <ChatRedirectFallback dashboardPath={getDashboardPath(user)} />;
};

export default ChatRedirect;
