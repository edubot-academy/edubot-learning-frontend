import { useState, useEffect, useCallback } from 'react';
import { createResumeDraft, generateResumeDraft, getResumeDraft } from '../api/resumeApi';

const SESSION_KEY = 'careerSessionId';
const DRAFT_KEY   = 'careerResumeDraftId';
const FORM_KEY    = 'careerResumeFormData';

const getOrCreateSessionId = () => {
    try {
        let id = localStorage.getItem(SESSION_KEY);
        if (!id) {
            id =
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
            localStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return Math.random().toString(36).slice(2);
    }
};

const safeParse = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const safeSave = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded */ }
};

const safeRemove = (key) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
};

export const DRAFT_STATUS = {
    IDLE:       'idle',
    CREATING:   'creating',
    GENERATING: 'generating',
    READY:      'ready',
    ERROR:      'error',
};

export const useResumeDraft = () => {
    const [status, setStatus]   = useState(DRAFT_STATUS.IDLE);
    const [draft,  setDraft]    = useState(null);
    const [error,  setError]    = useState(null);

    // On mount: restore a previously generated draft if its ID is in localStorage
    useEffect(() => {
        const draftId = localStorage.getItem(DRAFT_KEY);
        if (!draftId) return;

        getResumeDraft(draftId)
            .then((d) => {
                if (d?.status === 'ready' || d?.status === 'claimed') {
                    setDraft(d);
                    setStatus(DRAFT_STATUS.READY);
                } else {
                    safeRemove(DRAFT_KEY);
                }
            })
            .catch(() => safeRemove(DRAFT_KEY));
    }, []);

    const generate = useCallback(async (formData, templateId = 'classic') => {
        setError(null);
        setStatus(DRAFT_STATUS.CREATING);

        // Persist form data so user doesn't lose work if generation fails
        safeSave(FORM_KEY, formData);

        try {
            const sessionId = getOrCreateSessionId();
            const created = await createResumeDraft({ sessionId, input: formData, templateId });
            if (created?.id) localStorage.setItem(DRAFT_KEY, created.id);

            setStatus(DRAFT_STATUS.GENERATING);
            const generated = await generateResumeDraft(created.id);

            setDraft(generated);
            setStatus(DRAFT_STATUS.READY);
        } catch (err) {
            setError(err);
            setStatus(DRAFT_STATUS.ERROR);
        }
    }, []);

    const retry = useCallback(
        (formData, templateId) => {
            safeRemove(DRAFT_KEY);
            setDraft(null);
            generate(formData, templateId);
        },
        [generate],
    );

    const reset = useCallback(() => {
        safeRemove(DRAFT_KEY);
        setDraft(null);
        setStatus(DRAFT_STATUS.IDLE);
        setError(null);
    }, []);

    const getSavedFormData = useCallback(() => safeParse(FORM_KEY), []);

    return { status, draft, error, generate, retry, reset, getSavedFormData };
};
