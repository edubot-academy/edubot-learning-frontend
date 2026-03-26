import { useState, useEffect, useRef, useContext } from "react";
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    replyInstructorChatMessage,
    sendInstructorChatMessage,
} from "@services/api";
import { AuthContext } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import Loader from "@shared/ui/Loader";
import InstructorEmptyState from "./InstructorEmptyState.jsx";

const ChatTab = () => {
    const { user } = useContext(AuthContext);

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatCompanion, setActiveChatCompanion] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);

    const messagesRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const messageInputRef = useRef(null);

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
                toast.error("Чатты жүктөөдө ката кетти");
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
                toast.error("Баарлашууну жүктөөдө ката кетти");
            }
        })();
    }, [activeChat?.id]);

    useEffect(() => {
        if (!activeChat) return;
        const companion = activeChat.student ?? null;
        setActiveChatCompanion(companion);
    }, [activeChat, user?.role]);

    useEffect(() => {
        if (!messagesRef.current) return;

        messagesRef.current.scrollTo({
            top: messagesRef.current.scrollHeight - 140,
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = async () => {
        if (!message.trim() || !activeChat || sending) return;

        const optimistic = {
            id: Date.now(),
            role: user.role,
            content: message,
            type: "text",
            createdAt: new Date(),
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, optimistic]);
        const prevMessage = message;
        setMessage("");
        setActionsOpen(false);
        setSending(true);

        try {
            await replyInstructorChatMessage({
                chatId: activeChat.id,
                content: optimistic.content,
                type: "text",
            });

            const res = await fetchInstructorChatMessages(activeChat.id);
            setMessages(res?.messages ?? []);
        } catch (error) {
            if (
                error?.response?.status === 404 &&
                error?.response?.data?.message === "Chat not found"
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

                    if (!newChat) {
                        throw new Error("Чат түзүлгөн соң да табылган жок");
                    }

                    setActiveChat(newChat);
                    const msgs = await fetchInstructorChatMessages(newChat.id);
                    setMessages(msgs?.messages ?? []);
                } catch (createError) {
                    toast.error(
                        "Чатты түзүү мүмкүн болбоду: " +
                        (createError?.message || "Белгисиз ката")
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                    setMessage(prevMessage);
                }
            } else {
                toast.error("Жүктөө учурунда ката кетти");
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
                error?.response?.data?.message === "Chat not found"
            ) {
                try {
                    await sendInstructorChatMessage({
                        content: `📎 ${type === "image" ? "Сүрөт" : "Файл"} жөнөтүлдү`,
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

                    if (!newChat) {
                        throw new Error("Чат түзүлгөн соң да табылган жок");
                    }

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
                        "Файлды жөнөтүү мүмкүн болбоду: " +
                        (createError?.message || "Белгисиз ката")
                    );
                    setMessages((prev) => prev.filter((m) => !m.isOptimistic));
                }
            } else {
                toast.error("Файлды жүктөөдө ката кетти");
                setMessages((prev) => prev.filter((m) => !m.isOptimistic));
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = (createdAt) => {
        if (!createdAt) return "";

        const date = new Date(createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "азыр";
        if (diffMins < 60) return `${diffMins} мүнөт мурун`;
        if (diffHours < 24) return `${diffHours} саат мурун`;
        if (diffDays < 7) return `${diffDays} күн мурун`;

        return date.toLocaleDateString("ky-KZ", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader />
            </div>
        );
    }

    if (!activeChat) {
        return (
            <div className="bg-white dark:bg-[#141619] rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] md:h-[600px] flex flex-col md:flex">
                {/* Chat List - Always visible on mobile, sidebar on desktop */}
                <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-lg text-gray-500 dark:text-gray-400">Recent Chats</p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 px-3">
                        {chats.map((chat) => {
                            const companion = chat.student;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat)}
                                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer"
                                >
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {chat.course?.title || "Course"}
                                    </p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                                        {companion?.fullName || "Student"}
                                    </p>
                                    <p className="text-xs text-sky-600">{chat.status}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <InstructorEmptyState
                        title="Чат тандаңыз"
                        description="Сүйлөшүү баштоо үчүн студентти тандаңыз"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#141619] rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col md:flex-row">
            {/* Chat Sidebar - Desktop Only */}
            <aside className="hidden md:flex md:flex-col md:w-80 md:border-r md:border-gray-200 md:dark:border-gray-700">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg text-gray-500 dark:text-gray-400">Recent Chats</h2>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Азыр чаттар жок</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {chats.map((chat) => {
                                const companion = chat.student;
                                const isActive = activeChat?.id === chat.id;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat)}
                                        className={`w-full text-left p-4 border rounded-lg cursor-pointer ${isActive
                                            ? 'bg-gray-50 dark:bg-[#222222]'
                                            : 'hover:bg-gray-50 dark:hover:bg-[#222222]'
                                            }`}
                                        role="option"
                                        aria-selected={isActive}
                                        aria-label={`${companion?.fullName || 'Студент'} - ${chat.course?.title || 'Курс'} чаты`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-orange-500 font-medium text-sm">
                                                    {companion?.fullName?.[0]?.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                        {companion?.fullName || "Студент"}
                                                    </p>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                        {formatMessageTime(chat.updatedAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                                    {chat.course?.title || "Курс"}
                                                </p>
                                                {chat.status && (
                                                    <div className="mt-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${chat.status === 'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {chat.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Chat Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <button
                    onClick={() => setActiveChat(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Чаттарга кайтуу"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                            {activeChatCompanion?.fullName?.[0]?.toUpperCase() || "?"}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {activeChatCompanion?.fullName || "Студент"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {activeChat.course?.title || "Курс"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-h-0">
                {/* Desktop Chat Header */}
                <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-500 font-medium">
                                {activeChatCompanion?.fullName?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {activeChatCompanion?.fullName || "Студент"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activeChat.course?.title || "Курс"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activeChat.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {activeChat.status || 'Белгисиз'}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesRef}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                    role="log"
                    aria-label="Чат билдирүүлөрү"
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">💬</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Баарлашууну баштаңыз</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Биринчи билдирүүңүздү жөнөтүңүз</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => {
                                const isMe = m.role === user.role;

                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                                        role="article"
                                        aria-label={`${isMe ? 'Сиздин' : 'Алардын'} билдирүү: ${m.content || 'Файл'}`}
                                    >
                                        <div className="max-w-xs sm:max-w-md lg:max-w-lg">
                                            <div
                                                className={`
                            px-3 py-2 rounded-xl text-sm transition-all duration-200
                            ${m.isOptimistic ? "opacity-70 animate-pulse" : ""}
                            ${isMe
                                                        ? "bg-white dark:bg-[#222222] shadow rounded-br-sm text-gray-900 dark:text-white"
                                                        : "bg-orange-500 text-white rounded-bl-sm"
                                                    }
                            `}
                                            >
                                                {m.type === "image" ? (
                                                    <img
                                                        src={m.url || URL.createObjectURL(m.file)}
                                                        alt="Чат сүрөтү"
                                                        className="rounded-lg max-w-full h-auto"
                                                        loading="lazy"
                                                    />
                                                ) : m.type === "file" ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">📎</span>
                                                        <span className="truncate">{m.file?.name || "Файл"}</span>
                                                    </div>
                                                ) : (
                                                    <p className="break-words">{m.content}</p>
                                                )}
                                            </div>

                                            <p
                                                className={`text-xs mt-1 px-2 opacity-70 transition-opacity duration-200 ${isMe
                                                    ? "text-right text-gray-500 dark:text-gray-400"
                                                    : "text-left text-gray-500 dark:text-gray-400"
                                                    }`}
                                            >
                                                {formatMessageTime(m.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <footer className="border-t px-4 py-3 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#141619]">
                    <div className="flex items-end gap-3 w-full">
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setActionsOpen((prev) => !prev)}
                                className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
                                type="button"
                                aria-label="Файл кошуу"
                                aria-expanded={actionsOpen}
                                aria-controls="attachment-menu"
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>

                            {actionsOpen && (
                                <div
                                    id="attachment-menu"
                                    className="absolute bottom-12 left-0 bg-white dark:bg-[#222222] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10 min-w-[150px]"
                                    role="menu"
                                >
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setActionsOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                        role="menuitem"
                                    >
                                        <span className="text-lg">📎</span>
                                        <span>Файл</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            imageInputRef.current?.click();
                                            setActionsOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                        role="menuitem"
                                    >
                                        <span className="text-lg">🖼️</span>
                                        <span>Сүрөт</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <input
                                ref={messageInputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-10 px-4 rounded-full outline-none text-black dark:text-white bg-white dark:bg-[#222222]"
                                placeholder="Билдирүү жаз..."
                                disabled={sending}
                                type="text"
                                aria-label="Билдирүү киргизүү"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (message.trim()) {
                                    sendMessage();
                                }
                            }}
                            disabled={!message.trim() || sending}
                            className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            aria-label="Билдирүү жөнөтүү"
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="hidden">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) sendFile(file, "file");
                                e.target.value = "";
                            }}
                            aria-label="Файл тандао"
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) sendFile(file, "image");
                                e.target.value = "";
                            }}
                            aria-label="Сүрөт тандао"
                        />
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ChatTab;
