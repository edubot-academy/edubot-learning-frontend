const findUserRank = (items, user) => {
    if (!user || !Array.isArray(items)) return null;
    const userId = Number(user.id);
    const normalizedName = String(user.fullName || user.name || '').trim().toLowerCase();

    const index = items.findIndex((item) => {
        const sameId = userId && Number(item?.studentId) === userId;
        const sameName =
            normalizedName &&
            String(item?.fullName || item?.name || '')
                .trim()
                .toLowerCase() === normalizedName;
        return sameId || sameName;
    });

    return index >= 0 ? index + 1 : null;
};

export const buildLeaderboardSnapshot = ({
    items = [],
    user = null,
    xp = 0,
    streakDays = 0,
    badges = [],
    label = 'Weekly board',
    t = (key, values = {}) => {
        const fallback = {
            'public.leaderboard.snapshot.strongStreak': `Strong streak: ${values.count} days`,
            'public.leaderboard.snapshot.newBadge': `New badge: ${values.title}`,
            'public.leaderboard.snapshot.visibleInBoard': `You are visible in ${values.label}`,
            'public.leaderboard.snapshot.noRank': 'No exact rank found yet',
        };
        return fallback[key] || key;
    },
}) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    const rank = findUserRank(normalizedItems, user);
    const currentXp = Number(xp || 0);
    const previousEntry = rank && rank > 1 ? normalizedItems[rank - 2] : null;
    const nextTargetEntry = previousEntry || normalizedItems[normalizedItems.length - 1] || null;
    const targetGap = nextTargetEntry
        ? Math.max(0, Number(nextTargetEntry.xp || 0) - currentXp + (rank && rank > 1 ? 1 : 40))
        : 120;

    const nearYou = rank
        ? normalizedItems.slice(Math.max(0, rank - 3), Math.min(normalizedItems.length, rank + 2))
        : normalizedItems.slice(0, 5);

    const percentile = normalizedItems.length
        ? Math.max(5, Math.round(((normalizedItems.length - ((rank || normalizedItems.length) - 1)) / normalizedItems.length) * 100))
        : null;

    const momentum = [
        streakDays >= 5 ? t('public.leaderboard.snapshot.strongStreak', { count: streakDays }) : null,
        badges[0]?.title ? t('public.leaderboard.snapshot.newBadge', { title: badges[0].title }) : null,
        rank
            ? t('public.leaderboard.snapshot.visibleInBoard', { label })
            : t('public.leaderboard.snapshot.noRank'),
    ].filter(Boolean);

    return {
        rank,
        percentile,
        nearYou,
        targetGap,
        nextTargetEntry,
        momentum,
    };
};
