import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchContactMessages } from '@services/api';
import { isForbiddenError, parseApiError } from '@shared/api/error';
import { useTranslation } from 'react-i18next';

export const useAdminContactsDomain = () => {
    const { t } = useTranslation();
    const [contacts, setContacts] = useState([]);

    const loadContacts = useCallback(async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('adminContacts.toasts.loadError')).message);
            }
        }
    }, [t]);

    const removeContact = useCallback((contactId) => {
        setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    }, []);

    return {
        contacts,
        loadContacts,
        removeContact,
    };
};
