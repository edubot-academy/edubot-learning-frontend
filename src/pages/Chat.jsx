import { useState, useEffect, useRef, useContext } from "react";
import {
  fetchInstructorChats,
  fetchInstructorChatMessages,
  sendInstructorChatMessage,
} from "@services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { SlPicture } from "react-icons/sl";
import { CgFileDocument } from "react-icons/cg";
import sendSvg from "../assets/icons/send.svg";

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatCompanion, setActiveChatCompanion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
        toast.error("Ошибка загрузки чатов");
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
        toast.error("Ошибка загрузки сообщений");
      }
    })();
  }, [activeChat?.id]);

  /* ================= ACTIVE CHAT COMPANION ================= */
  useEffect(() => {
    if (!activeChat) return;

    const companion =
      user.role === "instructor"
        ? activeChat.student
        : activeChat.instructor;

    setActiveChatCompanion(companion);
  }, [activeChat, user.role]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight - 160,
      behavior: "smooth",
    });
  }, [messages]);

  /* ================= SEND TEXT ================= */
  const sendMessage = async () => {
    if (!message.trim() || !activeChat || sending) return;

    const optimistic = {
      id: Date.now(),
      role: user.role,
      content: message,
      createdAt: new Date(),
      type: "text",
      isOptimistic: true,
    };

    setMessages((p) => [...p, optimistic]);
    const originalMessage = message;
    setMessage("");
    setActionsOpen(false);
    setSending(true);

    try {
      await sendInstructorChatMessage({
        content: optimistic.content,
        chatId: activeChat.id,
        courseId: activeChat.course.id,
        instructorId: activeChat.instructor.id,
      });

      // Обновляем сообщения после отправки
      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);

    } catch {
      toast.error("Ошибка отправки");
      // Удаляем оптимистичное сообщение при ошибке
      setMessages((p) => p.filter(m => !m.isOptimistic));
      setMessage(originalMessage);
    } finally {
      setSending(false);
    }
  };

  /* ================= SEND FILE / IMAGE ================= */
  const sendFile = async (file, type) => {
    if (!file || !activeChat) return;

    const optimistic = {
      id: Date.now(),
      role: user.role,
      createdAt: new Date(),
      type,
      file,
      isOptimistic: true,
    };

    setMessages((p) => [...p, optimistic]);
    setActionsOpen(false);

    try {
      const formData = new FormData();
      formData.append("content", ""); // пустой текст для файла
      formData.append("chatId", activeChat.id);
      formData.append("courseId", activeChat.course.id);
      formData.append("instructorId", activeChat.instructor.id);
      formData.append("type", type);

      // Если это файл или изображение
      if (type === "image" || type === "file") {
        formData.append("file", file);
      }

      await sendInstructorChatMessage(formData);

      // Обновляем сообщения после отправки
      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);

    } catch {
      toast.error("Ошибка отправки файла");
      // Удаляем оптимистичное сообщение при ошибке
      setMessages((p) => p.filter(m => !m.isOptimistic));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Загрузка...</div>;
  }

  return (
    <div className="h-[640px] p-6 flex gap-3">
      {/* ================= SIDEBAR ================= */}
      <div className="w-[50%] bg-white flex flex-col">
        <div className="px-6 py-4">
          <h2 className="text-3xl font-semibold">Chat</h2>
          <p className="text-lg text-[#5A5F69]">Recent Chats</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const isActive = chat.id === activeChat?.id;
            const companion =
              user.role === "instructor"
                ? chat.student
                : chat.instructor;

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`px-6 py-4 cursor-pointer border rounded-lg transition relative
                ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {companion.avatar && (
                      <img src={companion.avatar} alt="" />
                    )}
                  </div>

                  {chat.status === "active" && (
                    <span className="w-3.5 h-3.5 bg-[#66C95B] border-2 border-white rounded-full absolute left-12 top-10" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{chat.course.title}</p>
                    <p className="font-medium text-sm truncate">
                      {companion.fullName}
                    </p>
                    <p className="text-xs text-[#0284C7]">{chat.status}</p>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex-1 bg-white border rounded-lg flex flex-col">
        {activeChat && (
          <>
            {/* HEADER */}
            <div className="px-6 py-4 border-b flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                {activeChatCompanion?.avatar && (
                  <img src={activeChatCompanion.avatar} alt="" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {activeChatCompanion?.fullName}
                </p>
                <p className="text-[11px] text-[#0284C7]">
                  {activeChat.status}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
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
                        className={`px-3 py-2 text-[13px] rounded-xl
                          ${m.isOptimistic ? 'opacity-70' : ''}
                          ${isMe
                            ? "bg-white shadow rounded-br-sm"
                            : "bg-orange-500 text-white rounded-bl-sm"
                          }`}
                      >
                        {m.type === "image" ? (
                          <img
                            src={m.url || URL.createObjectURL(m.file)}
                            className="rounded-lg max-w-[200px]"
                            alt=""
                          />
                        ) : m.type === "file" ? (
                          <span className="underline">
                            📎 {m.file?.name || 'Файл'}
                          </span>
                        ) : (
                          m.content
                        )}
                        {m.isOptimistic && (
                          <span className="ml-1 text-xs">(отправка...)</span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-400 mt-1 text-right">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="border-t px-6 py-4 flex items-center gap-3">
              <div className="relative text-[#EA580C]">
                <div
                  className={`absolute -top-24 left-1/2 -translate-x-1/2 grid gap-2 transition-all duration-300
                  ${actionsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-9 h-9 rounded-full bg-[#FFF7ED] shadow flex items-center justify-center"
                  >
                    <CgFileDocument />
                  </button>
                  <button
                    onClick={() => imageInputRef.current.click()}
                    className="w-9 h-9 rounded-full bg-[#FFF7ED] shadow flex items-center justify-center"
                  >
                    <SlPicture />
                  </button>
                </div>

                <button
                  onClick={() => setActionsOpen((p) => !p)}
                  className="w-9 h-9 rounded-full bg-[#FFF7ED] flex items-center justify-center"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-10 px-4 rounded-full focus:outline-none"
                placeholder="Напишите сообщение"
                disabled={sending}
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${message.trim() && !sending
                    ? "bg-gradient-to-t from-[#FF8C6E] to-[#E14219] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <img src={sendSvg} className="w-4 h-4" />
                )}
              </button>

              {/* hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => sendFile(e.target.files[0], "file")}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => sendFile(e.target.files[0], "image")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}