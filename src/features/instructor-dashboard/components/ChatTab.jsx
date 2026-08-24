import { lazy, Suspense, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiClock, FiMessageCircle, FiSend } from 'react-icons/fi';
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    replyInstructorChatMessage,
    sendInstructorChatMessage,
} from '@features/instructorChat/api';
import {
    formatChatMessageTime,
    getChatStatusTone,
    getUnreadMessageCount,
    normalizeChatList,
} from '@features/instructorChat/utils/chatPresentation';
import Loader from '@shared/ui/Loader';
import { AuthContext } from '../../../context/AuthContext';
import { API_ERROR_CODES, getApiErrorCode, parseApiError } from '@shared/api/error';

const ChatWorkspace = lazy(() => import('@components/ui/ChatWorkspace'));
const CHAT_NOT_FOUND_CODES = new Set([
    API_ERROR_CODES.CHAT_NOT_FOUND,
    API_ERROR_CODES.INSTRUCTOR_CHAT_NOT_FOUND,
]);

const isChatNotFoundError = (error) => {
    return error?.response?.status === 404 && CHAT_NOT_FOUND_CODES.has(getApiErrorCode(error));
};

const ChatTab = () => {
    const { user } = useContext(AuthContext);
    const { i18n, t } = useTranslation();

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatCompanion, setActiveChatCompanion] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                setLoading(true);
                const res = await fetchInstructorChats({ role: user.role });
                const nextChats = normalizeChatList(res);
                setChats(nextChats);
                setActiveChat(nextChats[0] ?? null);
            } catch (error) {
                toast.error(parseApiError(error, t('instructorDashboard.chat.toasts.loadChatsError')).message);
            } finally {
                setLoading(false);
            }
        })();
    }, [t, user]);

    useEffect(() => {
        if (!activeChat?.id) return;

        (async () => {
            try {
                const res = await fetchInstructorChatMessages(activeChat.id);
                setMessages(res?.messages ?? []);
            } catch (error) {
                toast.error(parseApiError(error, t('instructorDashboard.chat.toasts.loadMessagesError')).message);
            }
        })();
    }, [activeChat?.id, t]);

    useEffect(() => {
        if (!activeChat) return;
        setActiveChatCompanion(activeChat.student ?? null);
    }, [activeChat, user?.role]);

    const sendMessage = async () => {
        if (!message.trim() || !activeChat || sending) return;

        const optimistic = {
            id: Date.now(),
            role: user.role,
            content: message,
            type: 'text',
            createdAt: new Date(),
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, optimistic]);
        const prevMessage = message;
        setMessage('');
        setActionsOpen(false);
        setSending(true);

        try {
            await replyInstructorChatMessage({
                chatId: activeChat.id,
                content: optimistic.content,
                type: 'text',
            });

            const res = await fetchInstructorChatMessages(activeChat.id);
            setMessages(res?.messages ?? []);
        } catch (error) {
            if (isChatNotFoundError(error)) {
                try {
                    await sendInstructorChatMessage({
                        content: optimistic.content,
                        courseId: activeChat.course?.id,
                        instructorId: activeChatCompanion?.id,
                    });

                    const refreshedChats = await fetchInstructorChats({ role: user.role });
                    const normalizedChats = normalizeChatList(refreshedChats);
                    setChats(normalizedChats);

                    const newChat = normalizedChats.find(
                        (chat) =>
                            chat.course?.id === activeChat.course?.id &&
                            chat.student?.id === activeChatCompanion?.id
                    );

                    if (!newChat) throw new Error(t('instructorDashboard.chat.errors.chatMissingAfterCreate'));

                    setActiveChat(newChat);
                    const msgs = await fetchInstructorChatMessages(newChat.id);
                    setMessages(msgs?.messages ?? []);
                } catch (createError) {
                    toast.error(
                        t('instructorDashboard.chat.toasts.createWithReason', {
                            reason: createError?.message || t('instructorDashboard.chat.errors.unknown'),
                        })
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                    setMessage(prevMessage);
                }
            } else {
                toast.error(parseApiError(error, t('instructorDashboard.chat.toasts.sendError')).message);
                setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                setMessage(prevMessage);
            }
        } finally {
            setSending(false);
        }
    };

    const sendFile = async (file, type) => {
        if (!file || !activeChat) return;

        const optimistic = {
            id: Date.now(),
            role: user.role,
            type,
            file,
            createdAt: new Date(),
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, optimistic]);
        setActionsOpen(false);

        try {
            await replyInstructorChatMessage({
                chatId: activeChat.id,
                type,
                file,
            });

            const res = await fetchInstructorChatMessages(activeChat.id);
            setMessages(res?.messages ?? []);
        } catch (error) {
            if (isChatNotFoundError(error)) {
                try {
                    await sendInstructorChatMessage({
                        content: t('instructorDashboard.chat.fileFallback', {
                            type: type === 'image'
                                ? t('instructorDashboard.chat.fileTypes.image')
                                : t('instructorDashboard.chat.fileTypes.file'),
                        }),
                        courseId: activeChat.course?.id,
                        instructorId: activeChatCompanion?.id,
                    });

                    const refreshedChats = await fetchInstructorChats({ role: user.role });
                    const normalizedChats = normalizeChatList(refreshedChats);
                    setChats(normalizedChats);

                    const newChat = normalizedChats.find(
                        (chat) =>
                            chat.course?.id === activeChat.course?.id &&
                            chat.student?.id === activeChatCompanion?.id
                    );

                    if (!newChat) throw new Error(t('instructorDashboard.chat.errors.chatMissingAfterCreate'));

                    setActiveChat(newChat);

                    await replyInstructorChatMessage({
                        chatId: newChat.id,
                        type,
                        file,
                    });

                    const msgs = await fetchInstructorChatMessages(newChat.id);
                    setMessages(msgs?.messages ?? []);
                } catch (createError) {
                    toast.error(
                        t('instructorDashboard.chat.toasts.fileWithReason', {
                            reason: createError?.message || t('instructorDashboard.chat.errors.unknown'),
                        })
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                }
            } else {
                toast.error(parseApiError(error, t('instructorDashboard.chat.toasts.fileUploadError')).message);
                setMessages((prev) => prev.filter((m) => !m.isOptimistic));
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = useCallback((createdAt) => {
        return formatChatMessageTime(createdAt, {
            language: i18n.language,
            t,
            translationBase: 'instructorDashboard.chat',
        });
    }, [i18n.language, t]);

    const filteredChats = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return chats.filter((chat) => {
            if (!normalized) return true;
            return [chat.student?.fullName, chat.course?.title, chat.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized));
        });
    }, [chats, query]);

    const chatItems = useMemo(
        () =>
            filteredChats.map((chat) => ({
                id: chat.id,
                title: chat.student?.fullName || t('instructorDashboard.chat.fallbacks.student'),
                subtitle: chat.course?.title || t('instructorDashboard.chat.fallbacks.course'),
                meta: formatMessageTime(chat.updatedAt),
                statusLabel: chat.status
                    ? t(`instructorDashboard.chat.statuses.${chat.status}`, { defaultValue: chat.status })
                    : t('instructorDashboard.chat.statuses.unknown'),
                statusTone: getChatStatusTone(chat.status),
                avatarText: chat.student?.fullName?.[0]?.toUpperCase(),
                ariaLabel: t('instructorDashboard.chat.chatAriaLabel', {
                    student: chat.student?.fullName || t('instructorDashboard.chat.fallbacks.student'),
                    course: chat.course?.title || t('instructorDashboard.chat.fallbacks.course'),
                }),
            })),
        [filteredChats, formatMessageTime, t]
    );

    const stats = useMemo(() => {
        const pending = getUnreadMessageCount(messages, user?.role);
        return [
            { label: t('instructorDashboard.chat.stats.chats'), value: chats.length, icon: FiMessageCircle },
            { label: t('instructorDashboard.chat.stats.messages'), value: messages.length, icon: FiSend, tone: 'blue' },
            { label: t('instructorDashboard.chat.stats.unread'), value: pending, icon: FiClock, tone: 'amber' },
        ];
    }, [chats.length, messages, t, user?.role]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <Suspense fallback={<Loader fullScreen={false} />}>
            <ChatWorkspace
                sidebarTitle={t('instructorDashboard.chat.sidebarTitle')}
                sidebarDescription={t('instructorDashboard.chat.sidebarDescription')}
                stats={stats}
                query={query}
                onQueryChange={setQuery}
                chatItems={chatItems}
                activeChatId={activeChat?.id || null}
                onSelectChat={(chatId) => setActiveChat(chats.find((item) => item.id === chatId) || null)}
                noChatsTitle={t('instructorDashboard.chat.empty.noChatsTitle')}
                noChatsSubtitle={t('instructorDashboard.chat.empty.noChatsSubtitle')}
                activeChatTitle={activeChatCompanion?.fullName || t('instructorDashboard.chat.fallbacks.student')}
                activeChatSubtitle={activeChat?.course?.title || t('instructorDashboard.chat.fallbacks.course')}
                activeStatusLabel={
                    activeChat?.status
                        ? t(`instructorDashboard.chat.statuses.${activeChat.status}`, {
                            defaultValue: activeChat.status,
                        })
                        : t('instructorDashboard.chat.statuses.unknown')
                }
                activeStatusTone={getChatStatusTone(activeChat?.status)}
                onBack={() => setActiveChat(null)}
                emptySelectionTitle={t('instructorDashboard.chat.empty.selectionTitle')}
                emptySelectionSubtitle={t('instructorDashboard.chat.empty.selectionSubtitle')}
                messages={messages}
                currentUserRole={user.role}
                formatMessageTime={formatMessageTime}
                message={message}
                onMessageChange={setMessage}
                onSendMessage={sendMessage}
                onKeyDown={handleKeyDown}
                sending={sending}
                actionsOpen={actionsOpen}
                onToggleActions={() => setActionsOpen((prev) => !prev)}
                onAttach={sendFile}
            />
        </Suspense>
    );
};

export default ChatTab;
