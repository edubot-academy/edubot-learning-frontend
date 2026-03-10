import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomepageLeaderboard } from '@services/api';
import Loader from '@shared/ui/Loader';

const badges = ['🚀 Fast Progress', '🏆 Quiz Champion', '⚡ JavaScript Master', '⚛ React Leader'];

const pickBadge = (item, index) => {
    if (item?.progressPercent >= 100) return '⭐ Course Finisher';
    if (item?.streakDays >= 5) return '🔥 Learning Streak';
    if (item?.streakDays >= 3) return '🔥 3+ Day Streak';
    if ((item?.quizzesPassed || 0) >= 10) return '🏆 Quiz Champion';
    return badges[index % badges.length];
};

const Avatar = ({ src, name }) => {
    if (src) {
        return <img src={src} alt={name} className="w-12 h-12 rounded-full object-cover" />;
    }
    const initials = name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold">
            {initials || 'ED'}
        </div>
    );
};

const HighlightCard = ({ item, index }) => {
    const badge = pickBadge(item, index);
    const gradient =
        index === 0
            ? 'from-[#FFE8D6] via-white to-[#FFF4EC] dark:from-[#1f242c] dark:via-[#161a22] dark:to-[#1f242c]'
            : index === 1
            ? 'from-[#E0F2FE] via-white to-[#EBF8FF] dark:from-[#1f262f] dark:via-[#161a22] dark:to-[#1b212b]'
            : 'from-[#EEF2FF] via-white to-[#F5F3FF] dark:from-[#1e2330] dark:via-[#151a23] dark:to-[#1c2230]';

    return (
        <div
            className={`
                relative rounded-2xl border border-gray-100 dark:border-gray-800
                bg-white/95 dark:bg-[#0f1118]/90 backdrop-blur-sm
                bg-gradient-to-br ${gradient} p-5
                shadow-lg md:shadow-xl shadow-orange-100/60 dark:shadow-black/60
                ring-1 ring-orange-100/70 dark:ring-white/10
                ring-offset-2 ring-offset-white dark:ring-offset-[#0c0f16]
            `}
        >
            <div className="flex items-center gap-4">
                <Avatar src={item?.avatarUrl} name={item?.fullName} />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{item?.fullName || 'Студент'}</p>
                        <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
                            #{index + 1}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {item?.progressPercent ? `${item.progressPercent}% прогресс` : `${item?.xp || 0} XP`}
                    </p>
                    {item?.streakDays ? (
                        <p className="text-xs text-amber-600 mt-1">🔥 {item.streakDays}-күн катары менен</p>
                    ) : null}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <span className="text-lg">🏅</span>
                    {badge}
                </div>
                <div className="text-sm text-orange-700 font-semibold">
                    {item?.quizzesPassed ? `${item.quizzesPassed} тест` : `${item?.lessonsCompleted || 0} сабак`}
                </div>
            </div>
        </div>
    );
};

const TopLearnersHome = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetchHomepageLeaderboard();
                setItems(res?.items || res || []);
            } catch (error) {
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <section className="bg-white dark:bg-[#141619] py-12 px-4 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
                        Бул жуманын мыктылары
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        Top Learners This Week
                    </h2>
                    <p className="text-gray-500 dark:text-gray-300 mt-1 max-w-xl">
                        Эң активдүү студенттер, ырааттуу прогресс жана тесттердеги жеңиштер.
                    </p>
                </div>
                <Link
                    to="/leaderboard"
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 bg-orange-500 text-white font-semibold shadow-md hover:shadow-lg hover:translate-y-[-1px] transition"
                >
                    View Full Leaderboard →
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader fullScreen={false} />
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-500">Лидерборд маалыматтары азырынча жок.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item, idx) => (
                        <HighlightCard key={item.studentId || idx} item={item} index={idx} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default TopLearnersHome;
