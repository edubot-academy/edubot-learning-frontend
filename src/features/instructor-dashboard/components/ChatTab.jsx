import { useState, useEffect, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiMessageCircle, FiSend } from 'react-icons/fi';
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    replyInstructorChatMessage,
    sendInstructorChatMessage,
} from '@services/api';
import Loader from '@shared/ui/Loader';
import ChatWorkspace from '@components/ui/ChatWorkspace';
import { AuthContext } from '../../../context/AuthContext';

const ChatTab = () => {
    const { user } = useContext(AuthContext);

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
                const nextChats = Array.isArray(res) ? res : [];
                setChats(nextChats);
                setActiveChat(nextChats[0] ?? null);
            } catch {
                toast.error('Чатты жүктөөдө ката кетти');
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    useEffect(() => {
        if (!activeChat?.id) return;

        (async () => {
            try {
                const res = await fetchInstructorChatMessages(activeChat.id);
                setMessages(res?.messages ?? []);
            } catch {
                toast.error('Баарлашууну жүктөөдө ката кетти');
            }
        })();
    }, [activeChat?.id]);

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
            if (
                error?.response?.status === 404 &&
                error?.response?.data?.message === 'Chat not found'
            ) {
                try {
                    await sendInstructorChatMessage({
                        content: optimistic.content,
                        courseId: activeChat.course?.id,
                        instructorId: activeChatCompanion?.id,
                    });

                    const refreshedChats = await fetchInstructorChats({ role: user.role });
                    const normalizedChats = Array.isArray(refreshedChats) ? refreshedChats : [];
                    setChats(normalizedChats);

                    const newChat = normalizedChats.find(
                        (chat) =>
                            chat.course?.id === activeChat.course?.id &&
                            chat.student?.id === activeChatCompanion?.id
                    );

                    if (!newChat) throw new Error('Чат түзүлгөн соң да табылган жок');

                    setActiveChat(newChat);
                    const msgs = await fetchInstructorChatMessages(newChat.id);
                    setMessages(msgs?.messages ?? []);
                } catch (createError) {
                    toast.error(
                        `Чатты түзүү мүмкүн болбоду: ${createError?.message || 'Белгисиз ката'}`
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                    setMessage(prevMessage);
                }
            } else {
                toast.error('Жүктөө учурунда ката кетти');
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
            if (
                error?.response?.status === 404 &&
                error?.response?.data?.message === 'Chat not found'
            ) {
                try {
                    await sendInstructorChatMessage({
                        content: `📎 ${type === 'image' ? 'Сүрөт' : 'Файл'} жөнөтүлдү`,
                        courseId: activeChat.course?.id,
                        instructorId: activeChatCompanion?.id,
                    });

                    const refreshedChats = await fetchInstructorChats({ role: user.role });
                    const normalizedChats = Array.isArray(refreshedChats) ? refreshedChats : [];
                    setChats(normalizedChats);

                    const newChat = normalizedChats.find(
                        (chat) =>
                            chat.course?.id === activeChat.course?.id &&
                            chat.student?.id === activeChatCompanion?.id
                    );

                    if (!newChat) throw new Error('Чат түзүлгөн соң да табылган жок');

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
                        `Файлды жөнөтүү мүмкүн болбоду: ${createError?.message || 'Белгисиз ката'}`
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                }
            } else {
                toast.error('Файлды жүктөөдө ката кетти');
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

    const formatMessageTime = (createdAt) => {
        if (!createdAt) return '';
        const date = new Date(createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'азыр';
        if (diffMins < 60) return `${diffMins} мүнөт мурун`;
        if (diffHours < 24) return `${diffHours} саат мурун`;
        if (diffDays < 7) return `${diffDays} күн мурун`;

        return date.toLocaleDateString('ky-KZ', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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
                title: chat.student?.fullName || 'Студент',
                subtitle: chat.course?.title || 'Курс',
                meta: formatMessageTime(chat.updatedAt),
                statusLabel: chat.status,
                statusTone: chat.status === 'active' ? 'active' : 'default',
                avatarText: chat.student?.fullName?.[0]?.toUpperCase(),
                ariaLabel: `${chat.student?.fullName || 'Студент'} - ${chat.course?.title || 'Курс'} чаты`,
            })),
        [filteredChats]
    );

    const stats = useMemo(() => {
        const pending = messages.filter((item) => item.role !== user?.role && !item.isRead).length;
        return [
            { label: 'Чаттар', value: chats.length, icon: FiMessageCircle },
            { label: 'Билдирүүлөр', value: messages.length, icon: FiSend, tone: 'blue' },
            { label: 'Окулбаган', value: pending, icon: FiClock, tone: 'amber' },
        ];
    }, [chats.length, messages, user?.role]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <ChatWorkspace
            sidebarTitle="Сүйлөшүүлөр"
            sidebarDescription="Курс жана студент боюнча активдүү чаттарды ушул жерден тандаңыз."
            stats={stats}
            query={query}
            onQueryChange={setQuery}
            chatItems={chatItems}
            activeChatId={activeChat?.id || null}
            onSelectChat={(chatId) => setActiveChat(chats.find((item) => item.id === chatId) || null)}
            noChatsTitle="Чат табылган жок"
            noChatsSubtitle="Издөө суроосун өзгөртүп көрүңүз же студент менен жаңы сүйлөшүүнү күтүңүз."
            activeChatTitle={activeChatCompanion?.fullName || 'Студент'}
            activeChatSubtitle={activeChat?.course?.title || 'Курс'}
            activeStatusLabel={activeChat?.status || 'Белгисиз'}
            activeStatusTone={activeChat?.status === 'active' ? 'active' : 'default'}
            onBack={() => setActiveChat(null)}
            emptySelectionTitle="Сүйлөшүү тандалган жок"
            emptySelectionSubtitle="Сол жактагы тизмеден студентти тандасаңыз, баарлашуу ушул жерде ачылат."
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
    );
};

export default ChatTab;
