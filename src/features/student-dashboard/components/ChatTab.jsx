import { useState, useEffect, useRef, useContext } from "react";
import {
  fetchInstructorChats,
  fetchInstructorChatMessages,
  sendInstructorChatMessage,
  replyInstructorChatMessage,
  fetchStudentCourses,
  fetchCourseDetails,
} from "@services/api";
import { AuthContext } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import sendSvg from "../../../assets/icons/send.svg";
import Loader from "@shared/ui/Loader";
import StudentEmptyState from "./StudentEmptyState.jsx";

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

  /* ================= LOAD CHATS ================= */
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchInstructorChats({ role: user.role });
        setChats(res ?? []);
        setActiveChat(res?.[0] ?? null);
      } catch {
        toast.error("Чатты жүктөөдө ката кетти");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ================= LOAD MESSAGES ================= */
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

  /* ================= COMPANION ================= */
  useEffect(() => {
    if (!activeChat) return;

    const companion = activeChat.instructor;
    setActiveChatCompanion(companion);
  }, [activeChat, user.role]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight - 140,
      behavior: "smooth",
    });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
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

    setMessages((p) => [...p, optimistic]);
    const prev = message;
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
      // Handle 404 "Chat not found" error specifically
      if (error.response?.status === 404 && error.response?.data?.message === "Chat not found") {
        try {
          // Try to create the chat first
          await sendInstructorChatMessage({
            content: optimistic.content,
            courseId: activeChat.course?.id,
            instructorId: activeChatCompanion?.id,
          });

          // Refresh chats to get the new chat
          const refreshedChats = await fetchInstructorChats({ role: user.role });
          setChats(refreshedChats ?? []);

          // Find the new chat and set it as active
          let newChat = refreshedChats?.find(c =>
            c.course?.id === activeChat.course?.id &&
            c.instructor?.id === activeChatCompanion?.id
          );

          // If course-based lookup fails, try instructor-based lookup
          if (!newChat && activeChatCompanion?.id) {
            newChat = refreshedChats?.find(c =>
              c.instructor?.id === activeChatCompanion?.id
            );
          }

          // If still not found, try by the original chat ID (in case it was updated)
          if (!newChat && activeChat.id) {
            newChat = refreshedChats?.find(c => c.id === activeChat.id);
          }

          if (newChat) {
            setActiveChat(newChat);
            const msgs = await fetchInstructorChatMessages(newChat.id);
            setMessages(msgs?.messages ?? []);
          } else {
            throw new Error("Чат түзүлгөн соң да табылган жок");
          }
        } catch (createError) {
          toast.error("Чатты түзүү мүмкүн болбоду: " + (createError.message || "Белгисиз ката"));
          setMessages((p) => p.filter((m) => !m.isOptimistic));
          setMessage(prev);
        }
      } else {
        toast.error("Жүктөө учурунда ката кетти");
        setMessages((p) => p.filter((m) => !m.isOptimistic));
        setMessage(prev);
      }
    } finally {
      setSending(false);
    }
  };

  /* ================= SEND FILE ================= */
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

    setMessages((p) => [...p, optimistic]);
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
      // Handle 404 "Chat not found" error specifically
      if (error.response?.status === 404 && error.response?.data?.message === "Chat not found") {
        try {
          // Try to create the chat first with text message
          await sendInstructorChatMessage({
            content: `📎 ${type === 'image' ? 'Сүрөт' : 'Файл'} жөнөтүлдү`,
            courseId: activeChat.course?.id,
            instructorId: activeChatCompanion?.id,
          });

          // Refresh chats to get the new chat
          const refreshedChats = await fetchInstructorChats({ role: user.role });
          setChats(refreshedChats ?? []);

          // Find the new chat and set it as active
          let newChat = refreshedChats?.find(c =>
            c.course?.id === activeChat.course?.id &&
            c.instructor?.id === activeChatCompanion?.id
          );

          // If course-based lookup fails, try instructor-based lookup
          if (!newChat && activeChatCompanion?.id) {
            newChat = refreshedChats?.find(c =>
              c.instructor?.id === activeChatCompanion?.id
            );
          }

          // If still not found, try by the original chat ID (in case it was updated)
          if (!newChat && activeChat.id) {
            newChat = refreshedChats?.find(c => c.id === activeChat.id);
          }

          if (newChat) {
            setActiveChat(newChat);
            await replyInstructorChatMessage({
              chatId: newChat.id,
              type,
              file,
            });
            const msgs = await fetchInstructorChatMessages(newChat.id);
            setMessages(msgs?.messages ?? []);
          } else {
            throw new Error("Чат түзүлгөн соң да табылган жок");
          }
        } catch (createError) {
          toast.error("Файлды жөнөтүү мүмкүн болбоду: " + (createError.message || "Белгисиз ката"));
          setMessages((p) => p.filter((m) => !m.isOptimistic));
        }
      } else {
        toast.error("Файлды жүктөөдө ката кетти");
        setMessages((p) => p.filter((m) => !m.isOptimistic));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ================= FORMAT DATE/TIME ================= */
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

    return date.toLocaleDateString('ky-KZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /* ================= NEW CHAT HANDLERS ================= */
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
    const courseId = courseItem.id || courseItem.courseId;
    let instructorId = getInstructorIdFromCourse(courseItem);
    try {
      setCreatingChat(true);
      if (!instructorId) {
        try {
          const details = await fetchCourseDetails(courseId);
          instructorId = getInstructorIdFromCourse(details);
        } catch (e) {
          // ignore, will error below if still missing
        }
      }
      if (!instructorId) {
        toast.error("Инструктор маалыматы жок");
        setCreatingChat(false);
        return;
      }
      const res = await sendInstructorChatMessage({
        content: text,
        courseId: courseItem.id || courseItem.courseId,
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
      setNewChatMessage("");
      setNewChatCourseId("");
      setNewChatOpen(false);
    } catch {
      toast.error("Чатты түзүү мүмкүн болбоду");
    } finally {
      setCreatingChat(false);
    }
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
        {/* Chats List */}
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
              const companion = chat.instructor;

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">{chat.course?.title || 'Course'}</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{companion.fullName}</p>
                  <p className="text-xs text-sky-600">{chat.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <StudentEmptyState
            title="Чат тандаңыз"
            description="Сүйлөшүү баштоо үчүн инструкторду тандаңыз же жаңы чат ачыңыз"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141619] rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] flex">
      {/* Chats List */}
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
            const companion = chat.instructor;

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer ${activeChat.id === chat.id ? "bg-gray-50 dark:bg-[#222222]" : ""
                  }`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{chat.course?.title || 'Course'}</p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{companion.fullName}</p>
                <p className="text-xs text-sky-600">{chat.status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-500 font-medium">
                {activeChatCompanion?.fullName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {activeChatCompanion?.fullName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeChat.course?.title || 'Course'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
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
                        : "bg-orange-500 text-white rounded-bl-sm"}
                    `}
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.url || URL.createObjectURL(m.file)}
                        className="rounded-lg"
                      />
                    ) : m.type === "file" ? (
                      <span>📎 {m.file?.name}</span>
                    ) : (
                      m.content
                    )}
                  </div>
                  {/* Timestamp */}
                  <p className={`text-xs mt-1 px-1 ${isMe ? "text-right text-gray-500 dark:text-gray-400" : "text-left text-orange-200"
                    }`}>
                    {formatMessageTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#141619]">
          <div className="relative">
            <button
              onClick={() => setActionsOpen((p) => !p)}
              className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
            >
              <FaPlus />
            </button>

            {/* Actions Menu */}
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
              <img src={sendSvg} className="w-4 h-4" />
            )}
          </button>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) sendFile(file, "file");
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) sendFile(file, "image");
            }}
          />
        </div>
      </div>

      {/* ================= NEW CHAT MODAL ================= */}
      {newChatOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#141619] rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
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
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {newChatCoursesLoading ? (
                <Loader fullScreen={false} />
              ) : newChatCourses.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Курстар табылган жок.
                </p>
              ) : (
                newChatCourses.map((courseItem) => {
                  const instructorName =
                    courseItem.instructor?.fullName || courseItem.instructorName || "Инструктор";
                  return (
                    <label
                      key={courseItem.id || courseItem.courseId}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${String(newChatCourseId) === String(courseItem.id || courseItem.courseId)
                        ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/40"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]"
                        }`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name="chat-course"
                        value={courseItem.id || courseItem.courseId}
                        checked={String(newChatCourseId) === String(courseItem.id || courseItem.courseId)}
                        onChange={() => setNewChatCourseId(courseItem.id || courseItem.courseId)}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {courseItem.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{instructorName}</p>
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
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] p-3 text-sm focus:border-orange-500 focus:outline-none"
                rows={3}
                placeholder="Салам! Суроом бар..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewChatOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-200"
              >
                Жабуу
              </button>
              <button
                type="button"
                disabled={creatingChat}
                onClick={handleCreateNewChat}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-60"
              >
                {creatingChat ? "Жөнөтүлүүдө..." : "Чат ачуу"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTab;
