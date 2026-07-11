import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const getResultKey = (item) =>
    item.type === 'external' ? `ext-${item.slug}` : item.id;

const getResultPath = (item) =>
    item.type === 'external' ? `/resources/${item.slug}` : `/courses/${item.id}`;

const SearchResults = ({
    dropdownClassName,
    errorClassName,
    itemClassName,
    noResultsClassName,
    results,
    searchError,
    searchLoading,
    onSelect,
}) => {
    const { t } = useTranslation();

    if (searchLoading) {
        return (
            <div className={noResultsClassName}>
                {t('common.searching')}
            </div>
        );
    }

    if (searchError) {
        return (
            <div className={errorClassName}>
                {searchError}
            </div>
        );
    }

    if (!results.length) {
        return (
            <div className={noResultsClassName}>
                {t('common.noResults')}
            </div>
        );
    }

    return (
        <div className={dropdownClassName}>
            {results.map((item) => (
                <button
                    key={getResultKey(item)}
                    onClick={() => onSelect(item)}
                    className={itemClassName}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {item.title}
                        </span>
                        {item.type === 'external' && (
                            <span className="shrink-0 text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                                {item.provider}
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 line-clamp-1">
                            {item.description}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};

const DESKTOP_CLASSES = {
    container:
        'relative flex items-center border rounded hover:border-[#F06743] flex-1 max-w-xs ml-6 border-[#7B818C] dark:border-[#2A2E35] bg-white dark:bg-[#1A1A1A] overflow-visible min-w-48',
    resultsWrapper:
        'absolute top-full left-0 right-0 mt-2 max-w-xs w-full bg-white dark:bg-[#141619] border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900 z-50 max-h-64 overflow-y-auto',
    dropdown: '',
    item: 'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0',
    message: 'px-4 py-3 text-sm text-gray-500 dark:text-gray-400',
    error: 'px-4 py-3 text-sm text-red-600 dark:text-red-300',
};

const MOBILE_CLASSES = {
    container: 'mt-3',
    inputWrapper:
        'relative flex items-center border rounded border-[#7B818C] dark:border-gray-600 bg-white dark:bg-gray-800 overflow-visible',
    resultsWrapper: 'absolute left-0 right-0 mt-1 mx-4 z-50',
    dropdown:
        'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded max-h-64 overflow-y-auto',
    item: 'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
    message:
        'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded p-4 text-sm text-gray-500 dark:text-gray-400',
    error:
        'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded p-4 text-sm text-red-600 dark:text-red-300',
};

const CourseSearchBox = ({
    id,
    mode = 'desktop',
    onResultSelect,
    searchState,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const classes = mode === 'mobile' ? MOBILE_CLASSES : DESKTOP_CLASSES;
    const {
        resetSearch,
        results,
        search,
        searchError,
        searchLoading,
        setSearch,
        setShowDropdown,
        showDropdown,
    } = searchState;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest?.('[data-course-search]')) return;
            setShowDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowDropdown]);

    const handleSelect = (item) => {
        navigate(getResultPath(item));
        resetSearch();
        if (onResultSelect) onResultSelect(item);
    };

    const input = (
        <>
            <IoSearch className="w-5 h-5 ml-2 text-[#7B818C] dark:text-gray-300" />
            <input
                type="text"
                placeholder={t('common.search')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => search.length >= 2 && setShowDropdown(true)}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setShowDropdown(false);
                    }
                }}
                aria-label={t('common.searchCourses')}
                aria-expanded={showDropdown}
                aria-controls={id}
                className="px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#EA580C] dark:focus:ring-[#F97316] bg-transparent w-full text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
        </>
    );

    return (
        <div className={classes.container} data-course-search ref={containerRef}>
            {mode === 'mobile' ? (
                <div className={classes.inputWrapper}>{input}</div>
            ) : (
                input
            )}

            {showDropdown && (
                <div id={id} className={classes.resultsWrapper}>
                    <SearchResults
                        dropdownClassName={classes.dropdown}
                        errorClassName={classes.error}
                        itemClassName={classes.item}
                        noResultsClassName={classes.message}
                        results={results}
                        searchError={searchError}
                        searchLoading={searchLoading}
                        onSelect={handleSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default CourseSearchBox;
