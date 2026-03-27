import { useState, useEffect, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiMessageCircle, FiPlus, FiSend } from 'react-icons/fi';
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    sendInstructorChatMessage,
    replyInstructorChatMessage,
    fetchStudentCourses,
    fetchCourseDetails,
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

    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatMessage, setNewChatMessage] = useState('');
    const [newChatCourseId, setNewChatCourseId] = useState('');
    const [newChatCourses, setNewChatCourses] = useState([]);
    const [newChatCoursesLoading, setNewChatCoursesLoading] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);

    const getInstructorIdFromCourse = (courseItem) => {
        if (!courseItem) return null;
        return (
            courseItem.instructor?.id ||
            courseItem.instructorId ||
            courseItem.instructor?.userId ||
            courseItem.instructor?.user?.id ||
            courseItem.instructorUserId ||
            courseItem.userId ||
            courseItem.ownerId
        );
    };

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
        setActiveChatCompanion(activeChat.instructor ?? null);
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
        const prev = message;
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
                    setChats(refreshedChats ?? []);

                    let newChat = refreshedChats?.find(
                        (c) =>
                            c.course?.id === activeChat.course?.id &&
                            c.instructor?.id === activeChatCompanion?.id
                    );
                    if (!newChat && activeChatCompanion?.id) {
                        newChat = refreshedChats?.find((c) => c.instructor?.id === activeChatCompanion?.id);
                    }
                    if (!newChat && activeChat.id) {
                        newChat = refreshedChats?.find((c) => c.id === activeChat.id);
                    }

                    if (newChat) {
                        setActiveChat(newChat);
                        const msgs = await fetchInstructorChatMessages(newChat.id);
                        setMessages(msgs?.messages ?? []);
                    } else {
                        throw new Error('Чат түзүлгөн соң да табылган жок');
                    }
                } catch (createError) {
                    toast.error(
                        `Чатты түзүү мүмкүн болбоду: ${createError.message || 'Белгисиз ката'}`
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                    setMessage(prev);
                }
            } else {
                toast.error('Жүктөө учурунда ката кетти');
                setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                setMessage(prev);
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
                    setChats(refreshedChats ?? []);

                    let newChat = refreshedChats?.find(
                        (c) =>
                            c.course?.id === activeChat.course?.id &&
                            c.instructor?.id === activeChatCompanion?.id
                    );
                    if (!newChat && activeChatCompanion?.id) {
                        newChat = refreshedChats?.find((c) => c.instructor?.id === activeChatCompanion?.id);
                    }
                    if (!newChat && activeChat.id) {
                        newChat = refreshedChats?.find((c) => c.id === activeChat.id);
                    }

                    if (newChat) {
                        setActiveChat(newChat);
                        await replyInstructorChatMessage({ chatId: newChat.id, type, file });
                        const msgs = await fetchInstructorChatMessages(newChat.id);
                        setMessages(msgs?.messages ?? []);
                    } else {
                        throw new Error('Чат түзүлгөн соң да табылган жок');
                    }
                } catch (createError) {
                    toast.error(
                        `Файлды жөнөтүү мүмкүн болбоду: ${createError.message || 'Белгисиз ката'}`
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

    const handleNewChatOpen = () => {
        setNewChatOpen(true);
        if (!newChatCourses.length && !newChatCoursesLoading) {
            setNewChatCoursesLoading(true);
            fetchStudentCourses(user.id)
                .then((res) => {
                    const items = Array.isArray(res?.items) ? res.items : res || [];
                    setNewChatCourses(items);
                })
                .catch(() => {
                    toast.error('Курстарды жүктөө мүмкүн болбоду');
                })
                .finally(() => setNewChatCoursesLoading(false));
        }
    };

    const handleCreateNewChat = async () => {
        if (!newChatCourseId) {
            toast.error('Курс тандаңыз');
            return;
        }
        const text = newChatMessage.trim();
        if (!text) {
            toast.error('Билдирүү жазыңыз');
            return;
        }
        const courseItem = newChatCourses.find(
            (c) => String(c.id || c.courseId) === String(newChatCourseId)
        );
        if (!courseItem) {
            toast.error('Курс табылган жок');
            return;
        }
        const courseId = courseItem.id || courseItem.courseId;
        let instructorId = getInstructorIdFromCourse(courseItem);
        try {
            setCreatingChat(true);
            if (!instructorId) {
                try {
                    const details = await fetchCourseDetails(courseId);
                    instructorId = getInstructorIdFromCourse(details);
                } catch {
                    // ignore
                }
            }
            if (!instructorId) {
                toast.error('Инструктор маалыматы жок');
                setCreatingChat(false);
                return;
            }
            const res = await sendInstructorChatMessage({
                content: text,
                courseId,
                instructorId,
            });
            const refreshed = await fetchInstructorChats({ role: user.role });
            setChats(refreshed || []);
            const newId = res?.chat?.id || res?.chatId;
            const found = (refreshed || []).find((c) => c.id === newId);
            if (found) {
                setActiveChat(found);
                const msgs = await fetchInstructorChatMessages(found.id);
                setMessages(msgs?.messages ?? []);
            }
            setNewChatMessage('');
            setNewChatCourseId('');
            setNewChatOpen(false);
        } catch {
            toast.error('Чатты түзүү мүмкүн болбоду');
        } finally {
            setCreatingChat(false);
        }
    };

    const filteredChats = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return chats.filter((chat) => {
            if (!normalized) return true;
            return [chat.instructor?.fullName, chat.course?.title, chat.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized));
        });
    }, [chats, query]);

    const chatItems = useMemo(
        () =>
            filteredChats.map((chat) => ({
                id: chat.id,
                title: chat.instructor?.fullName || 'Инструктор',
                subtitle: chat.course?.title || 'Курс',
                meta: formatMessageTime(chat.updatedAt),
                statusLabel: chat.status,
                statusTone: chat.status === 'active' ? 'active' : 'default',
                avatarText: chat.instructor?.fullName?.[0]?.toUpperCase(),
                ariaLabel: `${chat.instructor?.fullName || 'Инструктор'} - ${chat.course?.title || 'Курс'} чаты`,
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
        <>
            <ChatWorkspace
                sidebarTitle="Сүйлөшүүлөр"
                sidebarDescription="Инструкторлор менен болгон активдүү чаттарыңызды ушул жерден башкарыңыз."
                sidebarAction={
                    <button
                        type="button"
                        onClick={handleNewChatOpen}
                        className="dashboard-button-secondary !px-3"
                    >
                        <FiPlus className="h-4 w-4" />
                        Жаңы чат
                    </button>
                }
                stats={stats}
                query={query}
                onQueryChange={setQuery}
                chatItems={chatItems}
                activeChatId={activeChat?.id || null}
                onSelectChat={(chatId) => setActiveChat(chats.find((item) => item.id === chatId) || null)}
                noChatsTitle="Чат табылган жок"
                noChatsSubtitle="Жаңы чат ачып көрүңүз же издөө суроосун өзгөртүңүз."
                activeChatTitle={activeChatCompanion?.fullName || 'Инструктор'}
                activeChatSubtitle={activeChat?.course?.title || 'Курс'}
                activeStatusLabel={activeChat?.status || 'Белгисиз'}
                activeStatusTone={activeChat?.status === 'active' ? 'active' : 'default'}
                onBack={() => setActiveChat(null)}
                emptySelectionTitle="Сүйлөшүү тандалган жок"
                emptySelectionSubtitle="Сол жактагы тизмеден инструкторду тандасаңыз, баарлашуу ушул жерде ачылат."
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
                composerPlaceholder="Баарлашууну баштаңыз"
            />

            {newChatOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-[#141619]">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Инструктор менен чат ачуу
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Курсту тандап, биринчи билдирүү жазыңыз.
                                </p>
                            </div>
                            <button
                                onClick={() => setNewChatOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                            {newChatCoursesLoading ? (
                                <Loader fullScreen={false} />
                            ) : newChatCourses.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Курстар табылган жок.
                                </p>
                            ) : (
                                newChatCourses.map((courseItem) => {
                                    const instructorName =
                                        courseItem.instructor?.fullName ||
                                        courseItem.instructorName ||
                                        'Инструктор';
                                    return (
                                        <label
                                            key={courseItem.id || courseItem.courseId}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                                                String(newChatCourseId) ===
                                                String(courseItem.id || courseItem.courseId)
                                                    ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/40'
                                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1e1e]'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                className="mt-1"
                                                name="chat-course"
                                                value={courseItem.id || courseItem.courseId}
                                                checked={
                                                    String(newChatCourseId) ===
                                                    String(courseItem.id || courseItem.courseId)
                                                }
                                                onChange={() =>
                                                    setNewChatCourseId(courseItem.id || courseItem.courseId)
                                                }
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {courseItem.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                                    {instructorName}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 dark:text-gray-300">Билдирүү</label>
                            <textarea
                                value={newChatMessage}
                                onChange={(e) => setNewChatMessage(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-[#222222]"
                                rows={3}
                                placeholder="Салам! Суроом бар..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setNewChatOpen(false)}
                                className="rounded-lg border px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
                            >
                                Жабуу
                            </button>
                            <button
                                type="button"
                                disabled={creatingChat}
                                onClick={handleCreateNewChat}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white disabled:opacity-60"
                            >
                                {creatingChat ? 'Жөнөтүлүүдө...' : 'Чат ачуу'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default ChatTab;
