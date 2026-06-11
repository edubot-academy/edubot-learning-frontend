import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import { claimResumeDraft } from '../api/resumeApi';
import { parseCareerIntent, getCareerRedirectPath } from '../utils/careerIntent';

export const INTENT_STATUS = {
    IDLE:      'idle',
    CLAIMING:  'claiming',
    DONE:      'done',
    ERROR:     'error',
};

/**
 * Parses a career intent from the current URL search params or location state,
 * claims the draft if authenticated, and returns the resolved intent.
 *
 * Mount this on CareerDashboardPage or any post-signup landing page.
 */
export const useCareerIntent = ({ autoProcess = true } = {}) => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { user }  = useContext(AuthContext);

    // Intent can arrive via URL search (authenticated redirect) or location.state (post-signup)
    const parsed = useMemo(
        () =>
            parseCareerIntent(location.search)
            ?? (location.state?.intent
                ? { intent: location.state.intent, draftId: location.state.draftId, jobId: location.state.jobId }
                : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [location.search, location.state?.intent, location.state?.draftId, location.state?.jobId],
    );

    const [status,      setStatus]      = useState(INTENT_STATUS.IDLE);
    const [claimedDraftId, setClaimedId] = useState(null);
    const [error,       setError]       = useState(null);

    const process = useCallback(async () => {
        if (!parsed || !user) return;

        const { draftId, jobId } = parsed;

        if (draftId) {
            setStatus(INTENT_STATUS.CLAIMING);
            try {
                await claimResumeDraft(draftId);
                setClaimedId(draftId);
            } catch (e) {
                const code = e?.response?.status ?? e?.status;
                if (code === 409 || code === 410) {
                    // Non-fatal — draft already claimed or expired
                } else {
                    setError(e);
                    setStatus(INTENT_STATUS.ERROR);
                    return;
                }
            }
        }

        const redirectPath = getCareerRedirectPath(parsed);
        setStatus(INTENT_STATUS.DONE);

        // Only navigate away if we are on /career (the landing page after signup)
        if (redirectPath !== '/career' && location.pathname === '/career') {
            navigate(redirectPath, { replace: true });
        }
    }, [parsed, user, location.pathname, navigate]);

    useEffect(() => {
        if (autoProcess && parsed && user && status === INTENT_STATUS.IDLE) {
            process();
        }
    }, [autoProcess, parsed, user, status, process]);

    return {
        intent:        parsed?.intent ?? null,
        draftId:       parsed?.draftId ?? null,
        jobId:         parsed?.jobId  ?? null,
        claimedDraftId,
        status,
        error,
        hasIntent:     !!parsed,
        process,
    };
};
