import { useContext, useEffect, useRef, useState } from "react";
import {
  fetchInstructorChats,
  fetchInstructorChatMessages,
  sendInstructorChatMessage,
} from "@services/api";
import { FaPlus } from "react-icons/fa6";
import { SlPicture } from "react-icons/sl";
import { CgFileDocument } from "react-icons/cg";
import sendSvg from "../../assets/icons/send.svg";
import { AuthContext } from "@app/providers";

export default function InstructorChat({ course }) {
  const { user } = useContext(AuthContext);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const messagesRef = useRef(null);

  /* ================= LOAD CHAT FOR COURSE ================= */
  useEffect(() => {
    if (!course?.id) return;

    (async () => {
      try {
        const chats = await fetchInstructorChats({ role: "student" });

        const chatForCourse = chats.find(
          (c) => c.course?.id === course.id
        );

        if (chatForCourse) {
          setActiveChat(chatForCourse);
        } else {
          setActiveChat(null);
        }
      } catch (e) {
        console.error("Баарлашууну жүктөөдө ката кетти", e);
      }
    })();
  }, [course]);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!activeChat?.id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchInstructorChatMessages(activeChat.id);
        setMessages(res?.messages ?? []);
      } catch {
        console.error("Билдирүүлөрдү жүктөөдө ката кетти");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeChat?.id]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    if (!messagesRef.current || loading) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) return;

    // Оптимистичное обновление
    const optimisticMessage = {
      id: Date.now(),
      role: user.role,
      content: trimmedMessage,
      createdAt: new Date().toISOString(),
      type: "text",
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessage("");
    setSending(true);

    try {
      const payload = {
        content: trimmedMessage,
        courseId: course.id,
        instructorId: course.instructor.id,
      };

      // Если чат уже существует, добавляем chatId
      if (activeChat?.id) {
        payload.chatId = activeChat.id;
      }

      const response = await sendInstructorChatMessage(payload);

      // Если это новый чат, обновляем активный чат
      if (!activeChat?.id && response?.chat) {
        setActiveChat(response.chat);
      } else if (!activeChat?.id && response?.chatId) {
        // Загружаем обновленный список чатов
        const chats = await fetchInstructorChats({ role: "student" });
        const newChat = chats.find(c => c.id === response.chatId);
        if (newChat) {
          setActiveChat(newChat);
        }
      }

      // После успешной отправки загружаем обновленные сообщения
      const chatId = activeChat?.id || response?.chatId;
      if (chatId) {
        const res = await fetchInstructorChatMessages(chatId);
        setMessages(res?.messages ?? []);
      }

    } catch (error) {
      console.error("Жүктөөдө ката кетти", error);

      // Удаляем оптимистичное сообщение при ошибке
      setMessages((prev) => prev.filter(m => !m.isOptimistic));
      setMessage(trimmedMessage);

    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow border flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 border-b flex items-center gap-3">
        <img
          src={course.instructor.avatar}
          className="w-10 h-10 rounded-full object-cover"
          alt={course.instructor.fullName}
        />
        <div>
          <p className="font-medium text-sm">
            {course.instructor.fullName}
          </p>
          <p className="text-[11px] text-[#0284C7]">
            {activeChat?.status}
          </p>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
      >
        {loading && (
          <p className="text-center text-xs text-gray-400">
            Билдирүү жүктөлүүдө...
          </p>
        )}

        {!loading && messages.length === 0 && activeChat?.id && (
          <p className="text-center text-xs text-gray-400">
            Билдирүү жок. Баарлашууну баштаныз!
          </p>
        )}

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

      {/* ================= INPUT ================= */}
      <div className="border-t px-4 py-3 flex items-center gap-3">
        <div className="relative text-[#EA580C]">
          <div
            className={`absolute -top-24 left-1/2 -translate-x-1/2 grid gap-2 transition-all duration-300
                  ${actionsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <button
              className="w-9 h-9 rounded-full bg-[#FFF7ED] shadow flex items-center justify-center"
            >
              <CgFileDocument />
            </button>
            <button
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
          placeholder="Билдирүү жазыңыз"
          className="flex-1 h-10 px-4 rounded-full text-sm focus:outline-none bg-transparent"
        />

        <button
          onClick={handleSend}
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
            <img src={sendSvg} className="w-4 h-4" alt="" />
          )}
        </button>
      </div>
    </div>
  );
}