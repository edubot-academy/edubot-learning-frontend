import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchUsers } from '@features/users/api';

export const useRoster = (seatLimit = 0) => {
    const [roster, setRoster] = useState([]);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useMemo(() => query.trim(), [query]);

    useEffect(() => {
        const handle = setTimeout(async () => {
            if (!debouncedQuery) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const response = await fetchUsers({ search: debouncedQuery });
                const data = Array.isArray(response?.data) ? response.data : response || [];
                setResults(data);
            } catch (error) {
                console.error('Failed to search students', error);
                toast.error('Студенттерди издөө мүмкүн болбоду');
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(handle);
    }, [debouncedQuery]);

    const addStudent = (student) => {
        if (!student?.id) return;
        if (seatLimit && roster.length >= seatLimit) {
            toast.error('Орундардын чеги толду');
            return;
        }
        setRoster((prev) => {
            if (prev.some((s) => s.id === student.id)) return prev;
            return [...prev, student];
        });
    };

    const removeStudent = (id) => {
        setRoster((prev) => prev.filter((s) => s.id !== id));
    };

    return {
        roster,
        addStudent,
        removeStudent,
        query,
        setQuery,
        results,
        loading,
        seatUsage: `${roster.length}${seatLimit ? `/${seatLimit}` : ''}`,
    };
};

export default useRoster;
