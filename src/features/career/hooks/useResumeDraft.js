import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '@app/providers';
import { createResumeDraft, generateResumeDraft, getResumeDraft } from '../api/resumeApi';
import {
    clearCareerDraftStorage,
    getOrCreateCareerSessionId,
    getSavedCareerDraftId,
    getSavedCareerFormData,
    saveCareerDraftId,
    saveCareerFormData,
} from '../utils/resumeDraftStorage';

export const DRAFT_STATUS = {
    IDLE:       'idle',
    CREATING:   'creating',
    GENERATING: 'generating',
    READY:      'ready',
    ERROR:      'error',
};

export const useResumeDraft = () => {
    const { user } = useContext(AuthContext);
    const [status, setStatus]   = useState(DRAFT_STATUS.IDLE);
    const [draft,  setDraft]    = useState(null);
    const [error,  setError]    = useState(null);

    useEffect(() => {
        setDraft(null);
        setStatus(DRAFT_STATUS.IDLE);
        setError(null);

        const draftId = getSavedCareerDraftId(user);
        if (!draftId) return;

        getResumeDraft(draftId)
            .then((d) => {
                if (d?.status === 'ready' || d?.status === 'claimed') {
                    setDraft(d);
                    setStatus(DRAFT_STATUS.READY);
                } else {
                    clearCareerDraftStorage(user);
                }
            })
            .catch(() => clearCareerDraftStorage(user));
    }, [user]);

    const generate = useCallback(async (formData, templateId = 'classic') => {
        setError(null);
        setStatus(DRAFT_STATUS.CREATING);

        // Persist form data so user doesn't lose work if generation fails
        saveCareerFormData(user, formData);

        try {
            const sessionId = getOrCreateCareerSessionId(user);
            const created = await createResumeDraft({ sessionId, input: formData, templateId });
            if (!created?.id) throw new Error('Draft creation failed');
            saveCareerDraftId(user, created.id);

            setStatus(DRAFT_STATUS.GENERATING);
            const generated = await generateResumeDraft(created.id);

            setDraft(generated);
            setStatus(DRAFT_STATUS.READY);
        } catch (err) {
            setError(err);
            setStatus(DRAFT_STATUS.ERROR);
        }
    }, [user]);

    const retry = useCallback(
        (formData, templateId) => {
            clearCareerDraftStorage(user);
            setDraft(null);
            generate(formData, templateId);
        },
        [generate, user],
    );

    const reset = useCallback(() => {
        clearCareerDraftStorage(user);
        setDraft(null);
        setStatus(DRAFT_STATUS.IDLE);
        setError(null);
    }, [user]);

    const getSavedFormData = useCallback(
        (options) => getSavedCareerFormData(user, options),
        [user],
    );

    return { status, draft, error, generate, retry, reset, getSavedFormData };
};
