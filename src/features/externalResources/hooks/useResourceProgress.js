import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_PREFIX = 'ext_res_v1_';

const getKey = (userId) => `${STORAGE_KEY_PREFIX}${userId ?? 'anon'}`;

const readStore = (userId) => {
    try {
        const raw = localStorage.getItem(getKey(userId));
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const writeStore = (userId, data) => {
    try {
        localStorage.setItem(getKey(userId), JSON.stringify(data));
    } catch {
        // storage quota exceeded — silently ignore
    }
};

const useResourceProgress = (userId) => {
    const [store, setStore] = useState(() => readStore(userId));

    // Re-read when userId changes (login/logout)
    useEffect(() => {
        setStore(readStore(userId));
    }, [userId]);

    const mutate = useCallback(
        (updater) => {
            setStore((prev) => {
                const next = updater(prev);
                writeStore(userId, next);
                return next;
            });
        },
        [userId]
    );

    const getEntry = useCallback((slug) => store[slug] ?? null, [store]);

    const getAllEntries = useCallback(
        () =>
            Object.entries(store).map(([slug, entry]) => ({ slug, ...entry })),
        [store]
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
        },
        [mutate]
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
        },
        [mutate]
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
        },
        [mutate]
    );

    const toggleWeek = useCallback(
        (slug, weekNum) => {
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
                const next = checked.includes(weekNum)
                    ? checked.filter((w) => w !== weekNum)
                    : [...checked, weekNum];
                return { ...prev, [slug]: { ...entry, checkedWeeks: next } };
            });
        },
        [mutate]
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
        },
        [mutate]
    );

    const removeResource = useCallback(
        (slug) => {
            mutate((prev) => {
                const next = { ...prev };
                delete next[slug];
                return next;
            });
        },
        [mutate]
    );

    return {
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
