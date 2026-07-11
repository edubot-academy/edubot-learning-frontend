import {
    getJsonStorageItem,
    removeStorageItem,
    setJsonStorageItem,
} from '@shared/utils/storage';

const DRAFT_COURSE_STORAGE_KEY = 'draftCourse';

export const loadDraftCourse = () => getJsonStorageItem(DRAFT_COURSE_STORAGE_KEY, null);

export const saveDraftCourse = (draft) => {
    setJsonStorageItem(DRAFT_COURSE_STORAGE_KEY, draft);
};

export const clearDraftCourse = () => {
    removeStorageItem(DRAFT_COURSE_STORAGE_KEY);
};
