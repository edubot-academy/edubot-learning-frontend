import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchContactMessages } from '@services/api';
import { isForbiddenError } from '@shared/api/error';

export const useAdminContactsDomain = () => {
    const [contacts, setContacts] = useState([]);

    const loadContacts = useCallback(async () => {
        try {
            const res = await fetchContactMessages();
            setContacts(res || []);
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error('Байланыш каттарын жүктөөдө ката кетти');
            }
        }
    }, []);

    const removeContact = useCallback((contactId) => {
        setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    }, []);

    return {
        contacts,
        loadContacts,
        removeContact,
    };
};
