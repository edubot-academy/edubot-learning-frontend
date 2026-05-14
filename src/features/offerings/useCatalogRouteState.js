import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SEARCH_DEBOUNCE_MS = 400;

const parseCatalogPage = (value) => {
    const parsed = Number(value || 1);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

export const useCatalogRouteState = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';
    const page = parseCatalogPage(searchParams.get('page'));
    const [q, setQ] = useState(queryFromUrl);

    useEffect(() => {
        setQ((current) => (current === queryFromUrl ? current : queryFromUrl));
    }, [queryFromUrl]);

    useEffect(() => {
        if (q === queryFromUrl) return undefined;

        const timeoutId = setTimeout(() => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    const nextQuery = q.trim();

                    if (nextQuery) {
                        next.set('q', nextQuery);
                    } else {
                        next.delete('q');
                    }

                    next.set('page', '1');
                    return next;
                },
                { replace: true }
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [q, queryFromUrl, setSearchParams]);

    const setPage = useCallback(
        (nextPage) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                const nextQuery = q.trim();

                if (nextQuery) {
                    next.set('q', nextQuery);
                } else {
                    next.delete('q');
                }

                next.set('page', String(parseCatalogPage(nextPage)));
                return next;
            });
        },
        [q, setSearchParams]
    );

    return {
        catalogQuery: queryFromUrl,
        page,
        q,
        setPage,
        setQ,
    };
};
