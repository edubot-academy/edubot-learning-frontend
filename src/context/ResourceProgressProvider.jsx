import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import ResourceProgressContext from './ResourceProgressContext';
import { debounce } from '../lib/utils';
import {
    deleteExternalResourceProgress,
    fetchMyExternalResourceProgress,
    upsertExternalResourceProgress,
} from '../features/externalResources/api';
import { resolveLabel } from '../features/externalResources/data/externalResources';

const ANON_KEY = 'ext_res_v1_anon';

const readLocalStore = () => {
    try {
        const raw = localStorage.getItem(ANON_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const writeLocalStore = (data) => {
    try {
        localStorage.setItem(ANON_KEY, JSON.stringify(data));
    } catch {}
};

const normalizeApiEntry = (row) => ({
    status: row.status,
    notes: row.notes ?? '',
    checkedWeeks: (row.checklistProgress ?? []).filter((c) => c.done).map((c) => c.weekIndex),
    progressPercent: row.progressPercent ?? 0,
    certificateUrl: row.certificateUrl ?? null,
    aiStudyPlan: row.aiStudyPlan ?? null,
    aiCache: row.aiCache ?? { plans: {}, tasks: {}, explanations: {} },
    savedAt: row.createdAt,
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    title: row.resource?.title ?? '',
    provider: row.resource?.provider ?? '',
    coverImageUrl: row.resource?.coverImageUrl ?? null,
    category: row.resource?.category ?? '',
    level: row.resource?.level ?? '',
    priceLabel: resolveLabel(row.resource?.priceLabel) ?? '',
});

const syncToApi = (slug, payload) => {
    upsertExternalResourceProgress(slug, payload).catch(() => {});
};

export const ResourceProgressProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const userId = user?.id ?? null;

    const [store, setStore] = useState(() => (userId ? {} : readLocalStore()));
    const [progressLoading, setProgressLoading] = useState(!!userId);
    const userIdRef = useRef(userId);
    userIdRef.current = userId;

    const debouncedSyncNotes = useRef(
        debounce((slug, notes) => syncToApi(slug, { notes }), 600),
    ).current;

    useEffect(() => {
        if (!userId) {
            setStore(readLocalStore());
            setProgressLoading(false);
            return;
        }

        setProgressLoading(true);

        const anonData = readLocalStore();
        const anonEntries = Object.entries(anonData);

        // Collect sync promises so we can wait for all of them before clearing
        // localStorage — fire-and-forget via syncToApi would clear too early.
        const syncSettled = anonEntries.length > 0
            ? Promise.allSettled(
                anonEntries.map(([slug, entry]) =>
                    upsertExternalResourceProgress(slug, {
                        status: entry.status,
                        notes: entry.notes || undefined,
                    }).catch(() => {})
                )
            )
            : Promise.resolve();

        fetchMyExternalResourceProgress()
            .then((data) => {
                const apiMap = {};
                data.forEach((row) => {
                    if (row.resource?.slug) apiMap[row.resource.slug] = normalizeApiEntry(row);
                });
                // Use functional update so any optimistic mutations that occurred
                // during the fetch (e.g. saveResource from postLogin) are preserved.
                setStore((prevStore) => {
                    const merged = { ...apiMap };
                    Object.entries(prevStore).forEach(([slug, entry]) => {
                        if (!merged[slug]) merged[slug] = entry;
                    });
                    return merged;
                });
                // Clear localStorage only after all sync POSTs have settled so a
                // page reload between launch and settlement doesn't lose anon entries.
                if (anonEntries.length > 0) {
                    syncSettled.then(() => writeLocalStore({}));
                }
            })
            .catch(() => {
                // API unreachable — keep anon entries visible so the user doesn't lose
                // their in-session progress. localStorage is intentionally not cleared.
                const fallbackMap = {};
                anonEntries.forEach(([slug, entry]) => { fallbackMap[slug] = entry; });
                if (Object.keys(fallbackMap).length > 0) setStore(fallbackMap);
            })
            .finally(() => setProgressLoading(false));
    }, [userId]);

    const mutate = useCallback((updater) => {
        setStore((prev) => {
            const next = updater(prev);
            if (!userIdRef.current) writeLocalStore(next);
            return next;
        });
    }, []);

    const getEntry = useCallback((slug) => store[slug] ?? null, [store]);

    const getAllEntries = useCallback(
        () => Object.entries(store).map(([slug, entry]) => ({ slug, ...entry })),
        [store],
    );

    const saveResource = useCallback(
        (slug, meta = {}) => {
            mutate((prev) => {
                if (prev[slug]) return prev;
                return {
                    ...prev,
                    [slug]: {
                        status: 'saved',
                        notes: '',
                        checkedWeeks: [],
                        savedAt: new Date().toISOString(),
                        startedAt: null,
                        completedAt: null,
                        ...meta,
                    },
                };
            });
            if (userIdRef.current) syncToApi(slug, { status: 'saved' });
        },
        [mutate],
    );

    const startResource = useCallback(
        (slug, meta = {}) => {
            mutate((prev) => ({
                ...prev,
                [slug]: {
                    status: 'started',
                    notes: prev[slug]?.notes ?? '',
                    checkedWeeks: prev[slug]?.checkedWeeks ?? [],
                    savedAt: prev[slug]?.savedAt ?? new Date().toISOString(),
                    startedAt: prev[slug]?.startedAt ?? new Date().toISOString(),
                    completedAt: null,
                    ...meta,
                },
            }));
            if (userIdRef.current) syncToApi(slug, { status: 'started' });
        },
        [mutate],
    );

    const completeResource = useCallback(
        (slug) => {
            mutate((prev) => ({
                ...prev,
                [slug]: {
                    ...(prev[slug] ?? {}),
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                },
            }));
            if (userIdRef.current) syncToApi(slug, { status: 'completed' });
        },
        [mutate],
    );

    const toggleWeek = useCallback(
        (slug, weekNum) => {
            // Compute nextCheckedWeeks inside the mutate updater (from prev) so two
            // rapid toggles on different weeks each see the latest committed state
            // rather than both reading the same stale store closure.
            let nextCheckedWeeks = null;
            mutate((prev) => {
                const entry = prev[slug] ?? {
                    status: 'started',
                    notes: '',
                    checkedWeeks: [],
                    savedAt: new Date().toISOString(),
                    startedAt: new Date().toISOString(),
                    completedAt: null,
                };
                const checked = entry.checkedWeeks ?? [];
                nextCheckedWeeks = checked.includes(weekNum)
                    ? checked.filter((w) => w !== weekNum)
                    : [...checked, weekNum];
                return { ...prev, [slug]: { ...entry, checkedWeeks: nextCheckedWeeks } };
            });
            if (userIdRef.current && nextCheckedWeeks !== null) {
                syncToApi(slug, {
                    checklistProgress: nextCheckedWeeks.map((w) => ({ weekIndex: w, done: true })),
                });
            }
        },
        [mutate],
    );

    const updateNotes = useCallback(
        (slug, notes) => {
            mutate((prev) => ({
                ...prev,
                [slug]: {
                    ...(prev[slug] ?? {
                        status: 'started',
                        checkedWeeks: [],
                        savedAt: new Date().toISOString(),
                        startedAt: new Date().toISOString(),
                        completedAt: null,
                    }),
                    notes,
                },
            }));
            if (userIdRef.current) debouncedSyncNotes(slug, notes);
        },
        [mutate, debouncedSyncNotes],
    );

    const saveAiContent = useCallback(
        (slug, type, topicKey, content) => {
            mutate((prev) => {
                const entry = prev[slug] ?? { status: 'saved', notes: '', checkedWeeks: [] };
                const prevCache = entry.aiCache ?? { plans: {}, tasks: {}, explanations: {} };
                const nextCache = {
                    ...prevCache,
                    [type]: { ...(prevCache[type] ?? {}), [topicKey]: content },
                };
                return { ...prev, [slug]: { ...entry, aiCache: nextCache } };
            });
            if (userIdRef.current) {
                syncToApi(slug, { aiCache: { [type]: { [topicKey]: content } } });
            }
        },
        [mutate],
    );

    const removeResource = useCallback(
        (slug) => {
            mutate((prev) => {
                const next = { ...prev };
                delete next[slug];
                return next;
            });
            if (userIdRef.current) {
                deleteExternalResourceProgress(slug).catch(() => {});
            }
        },
        [mutate],
    );

    const setCertificateUrl = useCallback(
        (slug, certificateUrl) => {
            mutate((prev) => ({
                ...prev,
                [slug]: {
                    ...(prev[slug] ?? { status: 'completed', notes: '', checkedWeeks: [] }),
                    certificateUrl,
                },
            }));
        },
        [mutate],
    );

    return (
        <ResourceProgressContext.Provider
            value={{
                progressLoading,
                getEntry,
                getAllEntries,
                saveResource,
                startResource,
                completeResource,
                toggleWeek,
                updateNotes,
                removeResource,
                setCertificateUrl,
                saveAiContent,
            }}
        >
            {children}
        </ResourceProgressContext.Provider>
    );
};

export default ResourceProgressProvider;
