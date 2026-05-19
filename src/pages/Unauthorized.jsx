import { useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiHelpCircle, FiHome, FiLock, FiLogIn } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { getDashboardPath } from '@shared/utils/navigation';

const ActionLink = ({ to, icon: Icon, children, primary = false }) => (
    <Link
        to={to}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            primary
                ? 'bg-edubot-orange text-white hover:bg-orange-600'
                : 'border border-gray-200 bg-white text-gray-800 hover:border-orange-200 hover:bg-orange-50'
        }`}
    >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {children}
    </Link>
);

const GuidanceItem = ({ title, children }) => (
    <li className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">{children}</p>
    </li>
);

const getReasonText = (searchParams, t) => {
    const reason = searchParams.get('reason');
    return reason
        ? t(`unauthorized.reasons.${reason}`, {
            defaultValue: t('unauthorized.reasons.default'),
        })
        : t('unauthorized.reasons.default');
};

const Unauthorized = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const headingRef = useRef(null);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const reasonText = getReasonText(searchParams, t);
    const roleLabel = user?.role
        ? t(`unauthorized.roles.${user.role}`, { defaultValue: user.role })
        : '';
    const dashboardPath = user ? getDashboardPath(user) : '/login';

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
                <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-edubot-orange">
                            <FiLock className="h-7 w-7" aria-hidden="true" />
                        </div>

                        <p className="text-sm font-semibold uppercase tracking-wide text-edubot-orange">
                            {t('unauthorized.eyebrow')}
                        </p>
                        <h1
                            ref={headingRef}
                            tabIndex="-1"
                            className="mt-3 text-3xl font-bold text-gray-950 outline-none sm:text-4xl"
                        >
                            {t('unauthorized.title')}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                            {reasonText}{' '}
                            {user
                                ? t('unauthorized.signedInAs', {
                                    role: roleLabel || t('unauthorized.roles.account'),
                                })
                                : t('unauthorized.signInPrompt')}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <ActionLink to={dashboardPath} icon={user ? FiHome : FiLogIn} primary>
                                {user ? t('unauthorized.actions.dashboard') : t('unauthorized.actions.login')}
                            </ActionLink>
                            <ActionLink to="/courses" icon={FiBookOpen}>
                                {t('unauthorized.actions.courses')}
                            </ActionLink>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
                                {t('unauthorized.actions.back')}
                            </button>
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-gray-200 bg-gray-950 p-6 text-white shadow-sm sm:p-7">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-orange-200">
                            <FiHelpCircle className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold">{t('unauthorized.guidance.title')}</h2>
                        <ul className="mt-5 space-y-3">
                            <GuidanceItem title={t('unauthorized.guidance.role.title')}>
                                {t('unauthorized.guidance.role.description')}
                            </GuidanceItem>
                            <GuidanceItem title={t('unauthorized.guidance.account.title')}>
                                {t('unauthorized.guidance.account.description')}
                            </GuidanceItem>
                            <GuidanceItem title={t('unauthorized.guidance.access.title')}>
                                {t('unauthorized.guidance.access.description')}
                            </GuidanceItem>
                        </ul>
                        <Link
                            to="/contact"
                            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-gray-950"
                        >
                            {t('unauthorized.actions.support')}
                        </Link>
                    </aside>
                </div>
            </section>
        </main>
    );
};

export default Unauthorized;
