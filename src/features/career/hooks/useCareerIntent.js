import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import { claimResumeDraft } from '../api/resumeApi';
import { CAREER_ROUTES } from '../constants/careerRoutes';
import { parseCareerIntent, getCareerRedirectPath } from '../utils/careerIntent';
import { hasSavedCareerFormData } from '../utils/resumeDraftStorage';

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
        [location.search, location.state?.intent, location.state?.draftId, location.state?.jobId],
    );

    const [status,      setStatus]      = useState(INTENT_STATUS.IDLE);
    const [claimedDraftId, setClaimedId] = useState(null);
    const [claimedResumeId, setClaimedResumeId] = useState(null);
    const [error,       setError]       = useState(null);
    const [result,      setResult]      = useState(null);

    // Ref avoids including claimedResumeId in useCallback deps (prevents double-fire)
    const claimedResumeIdRef = useRef(null);

    const process = useCallback(async () => {
        if (!parsed || !user) return;

        const { draftId } = parsed;
        let nextResumeId = claimedResumeIdRef.current;

        if (draftId) {
            setStatus(INTENT_STATUS.CLAIMING);
            try {
                const claimedResume = await claimResumeDraft(draftId);
                claimedResumeIdRef.current = claimedResume?.id ?? null;
                setClaimedId(draftId);
                setClaimedResumeId(claimedResume?.id ?? null);
                nextResumeId = claimedResume?.id ?? null;
            } catch (e) {
                const code = e?.response?.status ?? e?.status;
                if (code === 410) {
                    const recoveryState = {
                        type: 'draft_expired',
                        intent: parsed.intent,
                        draftId,
                        hasRecoveredFormData: hasSavedCareerFormData(user, { allowGuestFallback: true }),
                    };
                    setResult(recoveryState);
                    setStatus(INTENT_STATUS.DONE);
                    navigate(CAREER_ROUTES.PUBLIC_BUILDER, {
                        replace: true,
                        state: { careerRecovery: recoveryState },
                    });
                    return;
                }

                if (code === 409) {
                    // Non-fatal — draft already claimed elsewhere or no longer claimable
                } else {
                    setError(e);
                    setStatus(INTENT_STATUS.ERROR);
                    return;
                }
            }
        }

        const redirectPath = getCareerRedirectPath({
            ...parsed,
            resumeId: nextResumeId,
        });
        const successResult = {
            type: 'claim_success',
            intent: parsed.intent,
            draftId: draftId ?? null,
            resumeId: nextResumeId,
            nextPath: redirectPath,
        };

        setResult(successResult);
        setStatus(INTENT_STATUS.DONE);

        // Always replace-navigate to strip intent params from the URL;
        // navigate to redirectPath (may be a sub-route or dashboard)
        navigate(redirectPath, {
            replace: true,
            state: { careerIntentResult: successResult },
        });
    }, [parsed, user, navigate]);

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
        claimedResumeId,
        status,
        error,
        result,
        hasIntent:     !!parsed,
        process,
    };
};
