import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { USERS_QUERY_KEYS } from '../utils/adminPanel.constants';

const FILTER_SYNC_DELAY_MS = 500;

export const useAdminUsersFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize from URL params
    const initialSearch = searchParams.get(USERS_QUERY_KEYS.search) || '';
    const initialRole = searchParams.get(USERS_QUERY_KEYS.role) || '';
    const initialDateFrom = searchParams.get(USERS_QUERY_KEYS.dateFrom) || '';
    const initialDateTo = searchParams.get(USERS_QUERY_KEYS.dateTo) || '';
    const initialPage = Number(searchParams.get(USERS_QUERY_KEYS.page) || searchParams.get('page')) || 1;

    const [search, setSearch] = useState(initialSearch);
    const [roleFilter, setRoleFilter] = useState(initialRole);
    const [dateFrom, setDateFrom] = useState(initialDateFrom);
    const [dateTo, setDateTo] = useState(initialDateTo);
    const [usersPage, setUsersPage] = useState(initialPage);

    const usersFiltersInitialized = useRef(false);

    // Update URL params when filters change
    const updateSearchParams = useCallback(
        (params) => {
            setSearchParams(
                (prev) => {
                    const updated = new URLSearchParams(prev);
                    Object.entries(params).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            updated.set(key, value);
                        } else {
                            updated.delete(key);
                        }
                    });
                    return updated;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    // Handle filter changes. Search is the only debounced/gated filter, so keep
    // URL writes centralized here to avoid immediate 1-2 character query sync.
    useEffect(() => {
        if (!usersFiltersInitialized.current) {
            usersFiltersInitialized.current = true;
            return;
        }

        const timeoutId = setTimeout(() => {
            const normalizedSearch = search.trim();
            const shouldSyncSearch = normalizedSearch.length === 0 || normalizedSearch.length >= 3;

            updateSearchParams({
                [USERS_QUERY_KEYS.search]: shouldSyncSearch ? normalizedSearch : undefined,
                [USERS_QUERY_KEYS.role]: roleFilter,
                [USERS_QUERY_KEYS.dateFrom]: dateFrom,
                [USERS_QUERY_KEYS.dateTo]: dateTo,
                [USERS_QUERY_KEYS.page]: usersPage,
            });
        }, FILTER_SYNC_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [search, roleFilter, dateFrom, dateTo, usersPage, updateSearchParams]);

    const handleUsersPageChange = useCallback(
        (nextPage) => {
            if (nextPage < 1) return;
            setUsersPage(nextPage);
        },
        []
    );

    return {
        // State
        search,
        roleFilter,
        dateFrom,
        dateTo,
        usersPage,
        
        // Setters
        setSearch,
        setRoleFilter,
        setDateFrom,
        setDateTo,
        setUsersPage,
        
        // Actions
        handleUsersPageChange,
        updateSearchParams,
        
        // Refs for initialization tracking
        usersFiltersInitialized,
    };
};
