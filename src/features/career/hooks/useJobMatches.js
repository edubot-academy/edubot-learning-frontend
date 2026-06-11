import { useState, useEffect, useCallback } from 'react';
import { getJobMatchesByDraft } from '../api/jobMatchApi';

export const JOB_MATCH_STATUS = {
    IDLE:    'idle',
    LOADING: 'loading',
    READY:   'ready',
    ERROR:   'error',
};

export const useJobMatches = (draftId) => {
    const [status,  setStatus]  = useState(JOB_MATCH_STATUS.IDLE);
    const [matches, setMatches] = useState([]);
    const [error,   setError]   = useState(null);

    const fetch = useCallback(async (id) => {
        if (!id) return;
        setStatus(JOB_MATCH_STATUS.LOADING);
        setError(null);
        try {
            const data = await getJobMatchesByDraft(id);
            setMatches(Array.isArray(data) ? data : (data?.matches ?? []));
            setStatus(JOB_MATCH_STATUS.READY);
        } catch (err) {
            setError(err);
            setStatus(JOB_MATCH_STATUS.ERROR);
        }
    }, []);

    useEffect(() => {
        if (draftId) fetch(draftId);
        else {
            setStatus(JOB_MATCH_STATUS.IDLE);
            setMatches([]);
        }
    }, [draftId, fetch]);

    const refetch = useCallback(() => fetch(draftId), [fetch, draftId]);
    return { status, matches, error, refetch };
};
