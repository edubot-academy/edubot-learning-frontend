import { useEffect, useRef, useState } from "react";
import {
  fetchInstructorChats,
  fetchInstructorChatMessages,
  sendInstructorChatMessage,
  replyInstructorChatMessage,
} from "@services/api";
import { FaPlus } from "react-icons/fa6";
import sendSvg from "../../assets/icons/send.svg";

export default function InstructorChat({ course }) {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
        console.error("Ошибка загрузки чата", e);
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
        console.error("Ошибка загрузки сообщений");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeChat?.id]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight - 140,
      behavior: "smooth",
    });
  }, [messages]);

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!message.trim()) return;

    const content = message;
    setMessage("");

    const optimistic = {
      id: Date.now(),
      senderRole: "student",
      content,
      createdAt: new Date(),
    };

    setMessages((p) => [...p, optimistic]);

    try {
      if (activeChat?.id) {
        await replyInstructorChatMessage({
          chatId: activeChat.id,
          content,
        });
        return;
      }

      await sendInstructorChatMessage({
        content,
        courseId: course.id,
        instructorId: course.instructor.id,
      });
    } catch {
      console.error("Ошибка отправки");
    }
  };

  return (
    <div className="w-full h-[640px] bg-white rounded-2xl shadow border flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 border-b flex items-center gap-3">
        <img
          src={course.instructor.avatarUrl}
          className="w-10 h-10 rounded-full object-cover"
          alt=""
        />
        <div>
          <p className="font-medium text-sm">
            {course.instructor.fullName}
          </p>
          <p className="text-[11px] text-[#0284C7]">
            печатает...
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
            Загрузка сообщений...
          </p>
        )}

        {messages.map((m) => {
          const isMe = m.senderRole === "student";

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[260px]">
                <div
                  className={`px-3 py-2 text-[13px] leading-snug rounded-xl
                    ${
                      isMe
                        ? "bg-white text-gray-900 rounded-br-sm shadow"
                        : "bg-[#F97316] text-white rounded-bl-sm"
                    }`}
                >
                  {m.content}
                </div>

                <div
                  className={`text-[10px] mt-1 text-gray-400
                    ${isMe ? "text-right" : "ml-1"}`}
                >
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
        <button className="w-9 h-9 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
          <FaPlus className="w-4 h-4" />
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Напишите сообщение"
          className="flex-1 h-10 px-4 rounded-full text-sm focus:outline-none bg-transparent"
        />

        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-gradient-to-t from-[#FF8C6E] to-[#E14219] flex items-center justify-center"
        >
          <img src={sendSvg} className="w-4 h-4" alt="" />
        </button>
      </div>
    </div>
  );
}
