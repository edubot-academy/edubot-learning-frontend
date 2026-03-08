import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@shared/ui/Loader';
import {
    fetchFastProgressLeaderboard,
    fetchSkillLeaderboard,
    fetchStudentOfWeek,
    fetchWeeklyLeaderboard,
    fetchSkills,
} from '@services/api';

const defaultSkillBoards = [
    { slug: 'html', label: 'HTML' },
    { slug: 'css', label: 'CSS' },
    { slug: 'javascript', label: 'JavaScript' },
    { slug: 'react', label: 'React' },
    { slug: 'node', label: 'Node.js' },
    { slug: 'vocab', label: 'Vocabulary' },
    { slug: 'grammar', label: 'Grammar' },
];

const Avatar = ({ src, name }) => {
    if (src) {
        return <img src={src} alt={name} className="w-11 h-11 rounded-full object-cover" />;
    }
    const initials = name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold">
            {initials || 'ED'}
        </div>
    );
};

const rankStyles = {
    1: 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 text-white shadow-lg shadow-amber-200',
    2: 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 shadow',
    3: 'bg-gradient-to-r from-orange-200 to-amber-100 text-gray-900 shadow',
};

const RankChip = ({ rank }) => {
    const style = rankStyles[rank] || 'bg-gray-100 text-gray-800';
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
            {medal}
        </span>
    );
};

const ProgressBar = ({ value }) => (
    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
        <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
            style={{ width: `${Math.min(value || 0, 100)}%` }}
        />
    </div>
);

const LeaderRow = ({ item, rank }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1c1f24] shadow-sm">
        <RankChip rank={rank} />
        <Avatar src={item?.avatarUrl} name={item?.fullName} />
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{item?.fullName}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{item?.xp} XP</span>
                {item?.progressPercent ? <span>{item.progressPercent}%</span> : null}
                {item?.streakDays >= 3 ? (
                    <span className="text-amber-600">🔥 {item.streakDays} күн</span>
                ) : null}
            </div>
            {item?.progressPercent ? (
                <div className="mt-2">
                    <ProgressBar value={item.progressPercent} />
                </div>
            ) : null}
        </div>
        {item?.quizzesPassed ? (
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                {item.quizzesPassed} тест
            </span>
        ) : null}
    </div>
);

const SectionShell = ({ title, description, action, children }) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                {description ? (
                    <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
                ) : null}
            </div>
            {action}
        </div>
        {children}
    </section>
);

const LeaderboardPage = () => {
    const [weekly, setWeekly] = useState({ items: [], total: 0, page: 1, limit: 10 });
    const [weeklyLoading, setWeeklyLoading] = useState(true);
    const [fast, setFast] = useState({ items: [], total: 0, page: 1, limit: 10 });
    const [fastLoading, setFastLoading] = useState(true);
    const [studentOfWeek, setStudentOfWeek] = useState(null);
    const [skills, setSkills] = useState({});
    const [skillBoards, setSkillBoards] = useState(defaultSkillBoards);
    const [skillBoardsLoading, setSkillBoardsLoading] = useState(true);
    const [skillCatalogLoading, setSkillCatalogLoading] = useState(false);
    const [weeklyPage, setWeeklyPage] = useState(1);
    const [fastPage, setFastPage] = useState(1);

    useEffect(() => {
        const loadStudent = async () => {
            const data = await fetchStudentOfWeek();
            setStudentOfWeek(data || null);
        };
        loadStudent();
    }, []);

    const loadSkillLeaderboards = useCallback(
        async (boards) => {
            try {
                setSkillBoardsLoading(true);
                const entries = await Promise.all(
                    boards.map(async (board) => {
                        const data = await fetchSkillLeaderboard(board.slug, { page: 1, limit: 5 });
                        return [board.slug, data?.items || data || []];
                    })
                );
                setSkills(Object.fromEntries(entries));
            } finally {
                setSkillBoardsLoading(false);
            }
        },
        []
    );

    const refreshSkillCatalog = useCallback(async () => {
        setSkillCatalogLoading(true);
        try {
            const catalog = await fetchSkills();
            const mapped =
                Array.isArray(catalog) && catalog.length
                    ? catalog
                          .filter((s) => s.slug || s.id)
                          .map((s) => ({
                              slug: s.slug || String(s.id),
                              label: s.name || s.slug || `Skill ${s.id}`,
                          }))
                    : [];
            const merged = [
                ...defaultSkillBoards,
                ...mapped.filter(
                    (m) => !defaultSkillBoards.some((d) => d.slug === m.slug)
                ),
            ];
            setSkillBoards(merged);
        } catch (error) {
            console.warn('Skills catalog refresh failed', error);
        } finally {
            setSkillCatalogLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSkillLeaderboards(skillBoards);
    }, [skillBoards, loadSkillLeaderboards]);

    useEffect(() => {
        refreshSkillCatalog();
    }, [refreshSkillCatalog]);

    useEffect(() => {
        const loadWeekly = async () => {
            try {
                setWeeklyLoading(true);
                const data = await fetchWeeklyLeaderboard({ page: weeklyPage, limit: 10 });
                setWeekly(data);
            } finally {
                setWeeklyLoading(false);
            }
        };
        loadWeekly();
    }, [weeklyPage]);

    useEffect(() => {
        const loadFast = async () => {
            try {
                setFastLoading(true);
                const data = await fetchFastProgressLeaderboard({ page: fastPage, limit: 10 });
                setFast(data);
            } finally {
                setFastLoading(false);
            }
        };
        loadFast();
    }, [fastPage]);

    const maxSkillItems = useMemo(() => Math.max(...Object.values(skills).map((v) => v?.length || 0), 0), [skills]);

    const xpLegend = [
        { label: 'Сабак бүтүрүү', value: '+20 XP' },
        { label: 'Квиз тапшыруу (өткөн)', value: '+40 XP' },
        { label: 'Квиз идеалдуу (perfect)', value: '+80 XP' },
        { label: 'Күн сайын ырааттуу окуу', value: '🔥 +10 XP/күн, үзүлсө — 0' },
        { label: 'Жуманын терезеси', value: 'Акыркы 7 күн' },
        { label: 'Курс бүтүрүү', value: 'Badge гана (XP азырынча жок)' },
    ];

    return (
        <div className="bg-white dark:bg-[#111418] text-gray-900 dark:text-white min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#1b1f26] dark:via-[#111418] dark:to-[#1b1f26]" />
                <div className="relative px-4 md:px-10 py-12 space-y-6">
                    <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
                        EduBot Learning
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-3xl">
                        Leaderboard & Skill Highlights
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                        Белгелер, ырааттуу прогресс жана тесттердеги жеңиштерди баса белгилеген замандын лидерборду.
                    </p>
                    <div className="flex gap-3">
                        <Link
                            to="/courses"
                            className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition"
                        >
                            Курстарды изилдөө
                        </Link>
                        <Link
                            to="/dashboard"
                            className="border border-orange-200 text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition"
                        >
                            Жеке прогресс
                        </Link>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-10 py-10 space-y-10">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1c1f24] p-5 shadow-sm">
                        <p className="font-semibold mb-2">How XP works</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {xpLegend.map((item) => (
                                <div key={item.label} className="flex items-start justify-between text-sm bg-gray-50 dark:bg-[#232936] rounded-xl px-3 py-2.5">
                                    <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
                                    <span className="font-semibold text-orange-600 whitespace-nowrap ml-3">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Стрик күн сайынкы окуу менен сакталат; бир күн калтырсаңыз, стрик үзүлөт.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#1f242c] dark:via-[#161a22] dark:to-[#1f242c] p-5 shadow-sm">
                        <p className="font-semibold mb-2">Badge legend</p>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                            <li>🔥 3+ күн стрик</li>
                            <li>🚀 Fast Progress (ылдам сабак бүтүрүү)</li>
                            <li>🏆 Quiz Champion (көп тест)</li>
                            <li>⭐ Course Finisher (100% прогресс)</li>
                        </ul>
                    </div>
                </div>

                <SectionShell
                    title="Student of the Week"
                    description="Эң көп упай, ырааттуу күндөр жана тесттердеги жогорку көрсөткүчтөр."
                >
                    {studentOfWeek ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-[#1f242c] dark:via-[#161a22] dark:to-[#1f242c] p-6 shadow-sm">
                            <Avatar src={studentOfWeek.avatarUrl} name={studentOfWeek.fullName} />
                            <div className="flex-1">
                                <p className="text-lg font-semibold">{studentOfWeek.fullName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {studentOfWeek.xp} XP · {studentOfWeek.lessonsCompleted || 0} сабак ·{' '}
                                    {studentOfWeek.quizzesPassed || 0} тест
                                </p>
                                {studentOfWeek.progressPercent ? (
                                    <div className="mt-3">
                                        <ProgressBar value={studentOfWeek.progressPercent} />
                                    </div>
                                ) : null}
                            </div>
                            <div className="text-amber-600 font-semibold text-sm">
                                {studentOfWeek.streakDays ? `🔥 ${studentOfWeek.streakDays} күн` : '🏆 Чемпион'}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                            Азырынча тандалган студент жок.
                        </div>
                    )}
                </SectionShell>

                <div className="grid gap-8 lg:grid-cols-2">
                    <SectionShell
                        title="Weekly Top Students"
                        description="Жумалык упай жана прогресс боюнча алдыңкы студенттер."
                        action={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setWeeklyPage((p) => Math.max(1, p - 1))}
                                    disabled={weeklyPage === 1}
                                    className="px-3 py-1 rounded-full border text-sm disabled:opacity-50"
                                >
                                    ← Алдыңкысы
                                </button>
                                <button
                                    onClick={() => {
                                        const maxPage = Math.max(1, Math.ceil((weekly.total || 1) / (weekly.limit || 10)));
                                        setWeeklyPage((p) => Math.min(maxPage, p + 1));
                                    }}
                                    className="px-3 py-1 rounded-full border text-sm"
                                >
                                    Кийинки →
                                </button>
                            </div>
                        }
                    >
                        {weeklyLoading ? (
                            <div className="py-6 flex justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {weekly?.items?.map((item, idx) => (
                                    <LeaderRow key={item.studentId || idx} item={item} rank={idx + 1 + (weeklyPage - 1) * (weekly.limit || 10)} />
                                ))}
                            </div>
                        )}
                    </SectionShell>

                    <SectionShell
                        title="Fastest Progress"
                        description="Сабактарды жана тесттерди эң ылдам бүтүргөн студенттер."
                        action={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFastPage((p) => Math.max(1, p - 1))}
                                    disabled={fastPage === 1}
                                    className="px-3 py-1 rounded-full border text-sm disabled:opacity-50"
                                >
                                    ← Алдыңкысы
                                </button>
                                <button
                                    onClick={() => {
                                        const maxPage = Math.max(1, Math.ceil((fast.total || 1) / (fast.limit || 10)));
                                        setFastPage((p) => Math.min(maxPage, p + 1));
                                    }}
                                    className="px-3 py-1 rounded-full border text-sm"
                                >
                                    Кийинки →
                                </button>
                            </div>
                        }
                    >
                        {fastLoading ? (
                            <div className="py-6 flex justify-center">
                                <Loader fullScreen={false} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fast?.items?.map((item, idx) => (
                                    <LeaderRow key={item.studentId || idx} item={item} rank={idx + 1 + (fastPage - 1) * (fast.limit || 10)} />
                                ))}
                            </div>
                        )}
                    </SectionShell>
                </div>

                <SectionShell
                    title="Skill Leaderboards"
                    description="Ар бир тема боюнча прогрессти карап көрүңүз. Streak ≥ 3 — кошумча бейдж."
                    action={
                        <button
                            onClick={refreshSkillCatalog}
                            className="px-3 py-1 rounded-full border text-sm flex items-center gap-2"
                            disabled={skillCatalogLoading}
                        >
                            {skillCatalogLoading ? 'Жаңыртууда...' : 'Skills жаңыртуу'}
                        </button>
                    }
                >
                    {skillBoardsLoading ? (
                        <div className="py-6 flex justify-center">
                            <Loader fullScreen={false} />
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {skillBoards.map((board) => {
                                const items = skills[board.slug] || [];
                                return (
                                    <div
                                        key={board.slug}
                                        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1c1f24] p-5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="font-semibold">{board.label}</p>
                                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                Тема
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {items.length === 0 ? (
                                                <p className="text-sm text-gray-500">Маалымат азырынча жок.</p>
                                            ) : (
                                                items.slice(0, maxSkillItems || 5).map((item, idx) => (
                                                    <div
                                                        key={item.studentId || idx}
                                                        className={`flex items-center gap-3 p-2 rounded-xl ${
                                                            idx < 3 ? 'bg-orange-50/60 dark:bg-[#232936]' : 'bg-transparent'
                                                        }`}
                                                    >
                                                        <RankChip rank={idx + 1} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">{item.fullName}</p>
                                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                                {item.progressPercent ? `${item.progressPercent}%` : `${item.xp} XP`}
                                                                {item.streakDays >= 3 ? (
                                                                    <span className="text-amber-600">🔥 {item.streakDays}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SectionShell>
            </div>
        </div>
    );
};

export default LeaderboardPage;
