import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../lib/utils';
import {
    deleteExternalResourceProgress,
    fetchMyExternalResourceProgress,
    upsertExternalResourceProgress,
} from '../api';

// ─── Anonymous (localStorage) helpers ────────────────────────────────────────

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

// ─── API response → internal shape ───────────────────────────────────────────

const normalizeApiEntry = (row) => ({
    status: row.status,
    notes: row.notes ?? '',
    checkedWeeks: (row.checklistProgress ?? []).filter((c) => c.done).map((c) => c.weekIndex),
    progressPercent: row.progressPercent ?? 0,
    savedAt: row.createdAt,
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    title: row.resource?.title ?? '',
    provider: row.resource?.provider ?? '',
    coverImageUrl: row.resource?.coverImageUrl ?? null,
    category: row.resource?.category ?? '',
    level: row.resource?.level ?? '',
    priceLabel: row.resource?.priceLabel ?? '',
});

const syncToApi = (slug, payload) => {
    upsertExternalResourceProgress(slug, payload).catch(() => {});
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useResourceProgress = (userId) => {
    const [store, setStore] = useState(() => (userId ? {} : readLocalStore()));
    // true while the initial API fetch is in flight for logged-in users
    const [progressLoading, setProgressLoading] = useState(!!userId);
    const userIdRef = useRef(userId);
    userIdRef.current = userId;

    // Stable debounced notes syncer — created once per hook instance
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

        // Merge any anonymous progress into the API before fetching server state
        const anonData = readLocalStore();
        const anonEntries = Object.entries(anonData);
        if (anonEntries.length > 0) {
            anonEntries.forEach(([slug, entry]) => {
                syncToApi(slug, { status: entry.status, notes: entry.notes || undefined });
            });
            writeLocalStore({});
        }

        fetchMyExternalResourceProgress()
            .then((data) => {
                const map = {};
                data.forEach((row) => {
                    if (row.resource?.slug) map[row.resource.slug] = normalizeApiEntry(row);
                });
                // Merge optimistic anon entries that may not yet be in the API response
                anonEntries.forEach(([slug, entry]) => {
                    if (!map[slug]) map[slug] = entry;
                });
                setStore(map);
            })
            .catch(() => {})
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
            // Compute next checked weeks and capture it for the API call
            let nextCheckedWeeks;
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
            // syncToApi called outside the updater — safe from double-invocation
            if (userIdRef.current) {
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
            // Debounced — fires once after the user stops typing (600ms)
            if (userIdRef.current) debouncedSyncNotes(slug, notes);
        },
        [mutate, debouncedSyncNotes],
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

    return {
        progressLoading,
        getEntry,
        getAllEntries,
        saveResource,
        startResource,
        completeResource,
        toggleWeek,
        updateNotes,
        removeResource,
    };
};

export default useResourceProgress;
