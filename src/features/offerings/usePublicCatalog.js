import { useEffect, useRef, useState } from 'react';
import { publicCatalog } from '@features/offerings/catalog';
import { toArray } from '@shared/api/response';

const DEFAULT_CATALOG_DATA = {
    items: [],
    totalPages: 1,
};

const isAbortError = (error) =>
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'AbortError';

export const usePublicCatalog = ({ page, q, limit = 20 }) => {
    const [data, setData] = useState(DEFAULT_CATALOG_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        const loadCatalog = async () => {
            setLoading(true);
            setError(null);

            try {
                const nextData = await publicCatalog({
                    page,
                    q,
                    limit,
                    signal: controller.signal,
                });

                if (requestIdRef.current !== requestId) return;

                setData({
                    ...nextData,
                    items: toArray(nextData),
                    totalPages: Math.max(1, Number(nextData?.totalPages || 1)),
                });
            } catch (loadError) {
                if (isAbortError(loadError) || requestIdRef.current !== requestId) return;

                console.error('Failed to load public catalog', loadError);
                setError(loadError);
                setData(DEFAULT_CATALOG_DATA);
            } finally {
                if (requestIdRef.current === requestId) {
                    setLoading(false);
                }
            }
        };

        loadCatalog();

        return () => {
            controller.abort();
        };
    }, [limit, page, q, refreshIndex]);

    return {
        data,
        error,
        loading,
        retry: () => setRefreshIndex((current) => current + 1),
    };
};
