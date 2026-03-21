import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactGA4 from 'react-ga4';
import Loader from '@shared/ui/Loader';
import { fetchLeaderboardSharePayload } from '@services/api';

const rarityThemes = {
    common: 'from-slate-100 via-white to-slate-50 border-slate-200 text-slate-700',
    rare: 'from-sky-100 via-white to-cyan-50 border-sky-200 text-sky-700',
    epic: 'from-pink-100 via-white to-rose-50 border-pink-200 text-rose-700',
    legendary: 'from-amber-100 via-white to-orange-50 border-amber-200 text-amber-700',
};

const setMetaTag = (selector, attributes) => {
    let element = document.head.querySelector(selector);
    if (!element) {
        element = document.createElement('meta');
        Object.entries(attributes).forEach(([key, value]) => {
            if (key !== 'content') {
                element.setAttribute(key, value);
            }
        });
        document.head.appendChild(element);
    }
    element.setAttribute('content', attributes.content || '');
};

const applyShareMetadata = (payload) => {
    const title = payload?.title
        ? `${payload.displayName || 'EduBot студенти'} · ${payload.title} | EduBot`
        : 'EduBot жетишкендик барагы';
    const description = payload?.text || 'EduBot жетишкендик бөлүшүү барагы';
    const url = typeof window !== 'undefined' ? window.location.href : '';

    document.title = title;
    setMetaTag('meta[name="description"]', { name: 'description', content: description });
    setMetaTag('meta[property="og:title"]', { property: 'og:title', content: title });
    setMetaTag('meta[property="og:description"]', { property: 'og:description', content: description });
    setMetaTag('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMetaTag('meta[property="og:url"]', { property: 'og:url', content: url });
    setMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
};

const trackSharePageOpen = (payload) => {
    try {
        ReactGA4.event({
            category: 'leaderboard_share',
            action: 'public_share_open',
            label: payload?.title || 'achievement',
        });
    } catch (error) {
        console.warn('Share page analytics skipped', error);
    }
};

const LeaderboardShare = () => {
    const { token } = useParams();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchLeaderboardSharePayload(token);
                if (!cancelled) {
                    setPayload(data || null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Бул бөлүшүү картасы ачылбай калды же мөөнөтү өтүп кеткен.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (token) {
            load();
        } else {
            setLoading(false);
            setError('Бөлүшүү ачкычы табылган жок.');
        }

        return () => {
            cancelled = true;
        };
    }, [token]);

    useEffect(() => {
        applyShareMetadata(payload);
        if (payload) {
            trackSharePageOpen(payload);
        }
    }, [payload]);

    const theme = useMemo(() => {
        const rarity = String(payload?.rarity || 'rare').toLowerCase();
        return rarityThemes[rarity] || rarityThemes.rare;
    }, [payload]);

    const shareHighlights = [
        payload?.rank ? `#${payload.rank} орун` : null,
        payload?.xp ? `${payload.xp} XP` : null,
        payload?.streakDays ? `🔥 ${payload.streakDays} күн серия` : null,
        payload?.trackLabel || null,
    ].filter(Boolean);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader fullScreen={false} />
            </div>
        );
    }

    if (error || !payload) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
                <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_80px_-44px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-[#161b22]">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">Бөлүшүү жеткиликсиз</p>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Бөлүшүү картасы табылган жок</h1>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{error || 'Бул бөлүшүлгөн шилтемени ачууга мүмкүн болгон жок.'}</p>
                    <div className="mt-6">
                        <Link to="/leaderboard" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                            Рейтингге кайтуу
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_18%,_#f8fafc_100%)] px-4 py-12 dark:bg-[#0b1120]">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-orange-500">EduBot бөлүшүү картасы</p>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">Окуй бериңиз. Өсө бериңиз.</h1>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                        Бул карта EduBot'тогу жетишкендикти бөлүшүү үчүн түзүлгөн. Өзүңүздүн жеңишиңизди да рейтинг барагынан бөлүшө аласыз.
                    </p>
                </div>

                <section className={`rounded-[36px] border bg-gradient-to-br ${theme} p-8 shadow-[0_40px_100px_-56px_rgba(15,23,42,0.4)] dark:bg-[#161b22]`}>
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-5">
                            <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] dark:bg-slate-900/70">
                                {String(payload.rarity || 'rare').toUpperCase()}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{payload.displayName || 'EduBot студенти'}</p>
                                <h2 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                                    {payload.title}
                                </h2>
                            </div>
                            <p className="max-w-xl text-base text-slate-700 dark:text-slate-200 sm:text-lg">{payload.text}</p>
                            {shareHighlights.length ? (
                                <div className="flex flex-wrap gap-3">
                                    {shareHighlights.map((entry) => (
                                        <span key={entry} className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
                                            {entry}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        <div className="space-y-4 rounded-[28px] border border-white/60 bg-white/70 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">EduBot платформасы</p>
                                <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{payload.footer || 'edubot-learning.com/leaderboard'}</p>
                            </div>
                            <div className="rounded-[22px] border border-white/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Бул эмнеге маанилүү</p>
                                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                    Туруктуу катышуу, XP өсүшү жана жетишкендиктер студенттин реалдуу прогрессин көрсөтөт. Рейтингдеги жеңиштер курстун ичинде эле калбай, бөлүшүүгө да даяр.
                                </p>
                            </div>
                            <Link
                                to="/leaderboard"
                                className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                            >
                                Өзүңүздүн рейтингди көрүү
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LeaderboardShare;
