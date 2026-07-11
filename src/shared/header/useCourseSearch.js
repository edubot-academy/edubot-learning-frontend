import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchCourses } from '@features/search/api';
import { toArray } from '@shared/api/response';

export const useCourseSearch = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const searchRequestIdRef = useRef(0);

    useEffect(() => {
        const query = search.trim();
        const requestId = searchRequestIdRef.current + 1;
        searchRequestIdRef.current = requestId;

        if (query.length < 2) {
            setResults([]);
            setShowDropdown(false);
            setSearchLoading(false);
            setSearchError('');
            return undefined;
        }

        setSearchLoading(true);
        setSearchError('');
        const timeoutId = setTimeout(async () => {
            try {
                const data = await searchCourses(query);
                if (searchRequestIdRef.current !== requestId) return;
                setResults(toArray(data));
                setShowDropdown(true);
            } catch {
                if (searchRequestIdRef.current !== requestId) return;
                setResults([]);
                setSearchError(t('common.searchUnavailable'));
                setShowDropdown(true);
            } finally {
                if (searchRequestIdRef.current === requestId) {
                    setSearchLoading(false);
                }
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, t]);

    const resetSearch = () => {
        setSearch('');
        setShowDropdown(false);
    };

    return {
        resetSearch,
        results,
        search,
        searchError,
        searchLoading,
        setSearch,
        setShowDropdown,
        showDropdown,
    };
};
