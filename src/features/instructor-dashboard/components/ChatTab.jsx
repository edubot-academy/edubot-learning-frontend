import { useState, useEffect, useRef, useContext } from "react";
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    replyInstructorChatMessage,
    sendInstructorChatMessage,
    fetchInstructorCourses,
} from "@services/api";
import { AuthContext } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import sendSvg from "../../../assets/icons/send.svg";
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
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatMessage, setNewChatMessage] = useState("");
    const [newChatCourseId, setNewChatCourseId] = useState("");
    const [newChatLoading, setNewChatLoading] = useState(false);
    const [newChatCourses, setNewChatCourses] = useState([]);
    const [newChatCoursesLoading, setNewChatCoursesLoading] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);

    const messagesRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

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

    const handleNewChatOpen = () => {
        setNewChatOpen(true);

        if (!newChatCourses.length && !newChatCoursesLoading) {
            setNewChatCoursesLoading(true);

            fetchInstructorCourses({ status: "approved" })
                .then((res) => {
                    const items = Array.isArray(res?.items) ? res.items : res || [];
                    setNewChatCourses(items);
                })
                .catch(() => {
                    toast.error("Курстарды жүктөө мүмкүн болбоду");
                })
                .finally(() => setNewChatCoursesLoading(false));
        }
    };

    const handleCreateNewChat = async () => {
        if (!newChatCourseId) {
            toast.error("Курс тандаңыз");
            return;
        }

        const text = newChatMessage.trim();
        if (!text) {
            toast.error("Билдирүү жазыңыз");
            return;
        }

        const courseItem = newChatCourses.find(
            (c) => String(c.id || c.courseId) === String(newChatCourseId)
        );

        if (!courseItem) {
            toast.error("Курс табылган жок");
            return;
        }

        try {
            setCreatingChat(true);

            const res = await sendInstructorChatMessage({
                content: text,
                courseId: courseItem.id || courseItem.courseId,
            });

            const refreshed = await fetchInstructorChats({ role: user.role });
            const normalizedChats = Array.isArray(refreshed) ? refreshed : [];
            setChats(normalizedChats);

            const newId = res?.chat?.id || res?.chatId;
            const found = normalizedChats.find((chat) => chat.id === newId);

            if (found) {
                setActiveChat(found);
                const msgs = await fetchInstructorChatMessages(found.id);
                setMessages(msgs?.messages ?? []);
            }

            setNewChatMessage("");
            setNewChatCourseId("");
            setNewChatOpen(false);
        } catch {
            toast.error("Чатты түзүү мүмкүн болбоду");
        } finally {
            setCreatingChat(false);
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
            <div className="bg-white dark:bg-[#141619] rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] flex">
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
        <div className="bg-white dark:bg-[#141619] rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] flex">
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-lg text-gray-500 dark:text-gray-400">Recent Chats</p>
                        <button
                            type="button"
                            onClick={handleNewChatOpen}
                            className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
                        >
                            Жаңы чат
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 px-3">
                    {chats.map((chat) => {
                        const companion = chat.student;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer ${activeChat.id === chat.id ? "bg-gray-50 dark:bg-[#222222]" : ""
                                    }`}
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

            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-500 font-medium">
                                {activeChatCompanion?.fullName?.[0]?.toUpperCase() || "?"}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {activeChatCompanion?.fullName || "Student"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activeChat.course?.title || "Course"}
                            </p>
                        </div>
                    </div>
                </div>

                <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.map((m) => {
                        const isMe = m.role === user.role;

                        return (
                            <div
                                key={m.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className="max-w-[260px]">
                                    <div
                                        className={`
                      px-3 py-2 rounded-xl text-sm
                      ${m.isOptimistic ? "opacity-70" : ""}
                      ${isMe
                                                ? "bg-white dark:bg-[#222222] shadow rounded-br-sm"
                                                : "bg-orange-500 text-white rounded-bl-sm"
                                            }
                    `}
                                    >
                                        {m.type === "image" ? (
                                            <img
                                                src={m.url || URL.createObjectURL(m.file)}
                                                alt="chat attachment"
                                                className="rounded-lg"
                                            />
                                        ) : m.type === "file" ? (
                                            <span>📎 {m.file?.name || "Файл"}</span>
                                        ) : (
                                            m.content
                                        )}
                                    </div>

                                    <p
                                        className={`text-xs mt-1 px-1 ${isMe
                                            ? "text-right text-gray-500 dark:text-gray-400"
                                            : "text-left text-orange-200"
                                            }`}
                                    >
                                        {formatMessageTime(m.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t px-4 py-3 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#141619]">
                    <div className="relative">
                        <button
                            onClick={() => setActionsOpen((prev) => !prev)}
                            className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
                        >
                            <FaPlus />
                        </button>

                        {actionsOpen && (
                            <div className="absolute bottom-12 left-0 bg-white dark:bg-[#222222] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <button
                                    onClick={() => {
                                        fileInputRef.current?.click();
                                        setActionsOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    📎 Файл
                                </button>
                                <button
                                    onClick={() => {
                                        imageInputRef.current?.click();
                                        setActionsOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    🖼️ Сүрөт
                                </button>
                            </div>
                        )}
                    </div>

                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-10 px-4 rounded-full outline-none text-black dark:text-white bg-white dark:bg-[#222222]"
                        placeholder="Баарлашууну баштаныз"
                        disabled={sending}
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!message.trim() || sending}
                        className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <img src={sendSvg} alt="send" className="w-4 h-4" />
                        )}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) sendFile(file, "file");
                            e.target.value = "";
                        }}
                    />

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) sendFile(file, "image");
                            e.target.value = "";
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatTab;