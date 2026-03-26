import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { USERS_QUERY_KEYS } from '../utils/adminPanel.constants';
import { debounce } from '../utils/adminPanel.helpers';

export const useAdminUsersFilters = () => {
    const [searchParams] = useSearchParams();
    
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
    const usersSearchInitialized = useRef(false);

    // Update URL params when filters change
    const updateSearchParams = useCallback(
        (params) => {
            // This will be passed in from the parent component
            return params;
        },
        []
    );

    // Debounced search update
    const debouncedSearchUpdate = useCallback(
        debounce((searchValue) => {
            updateSearchParams({
                [USERS_QUERY_KEYS.search]: searchValue,
                [USERS_QUERY_KEYS.page]: searchValue ? 1 : usersPage,
            });
        }, 500),
        [usersPage, updateSearchParams]
    );

    // Handle search changes
    useEffect(() => {
        if (!usersSearchInitialized.current) {
            usersSearchInitialized.current = true;
            return;
        }

        if (search.length === 0 || search.length >= 3) {
            debouncedSearchUpdate(search);
        }

        return () => {
            debouncedSearchUpdate.cancel?.();
        };
    }, [search, debouncedSearchUpdate]);

    // Handle filter changes
    useEffect(() => {
        if (!usersFiltersInitialized.current) {
            usersFiltersInitialized.current = true;
            return;
        }

        updateSearchParams({
            [USERS_QUERY_KEYS.search]: search,
            [USERS_QUERY_KEYS.role]: roleFilter,
            [USERS_QUERY_KEYS.dateFrom]: dateFrom,
            [USERS_QUERY_KEYS.dateTo]: dateTo,
            [USERS_QUERY_KEYS.page]: usersPage,
        });
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
        usersSearchInitialized,
    };
};
