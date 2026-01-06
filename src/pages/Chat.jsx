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

  // 🔥 mobile state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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

  /* ================= COMPANION ================= */
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
      top: messagesRef.current.scrollHeight - 140,
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
      await sendInstructorChatMessage({
        content: optimistic.content,
        chatId: activeChat.id,
        courseId: activeChat.course.id,
        instructorId: activeChat.instructor.id,
      });

      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);
    } catch {
      toast.error("Ошибка отправки");
      setMessages((p) => p.filter((m) => !m.isOptimistic));
      setMessage(prev);
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
      const formData = new FormData();
      formData.append("chatId", activeChat.id);
      formData.append("courseId", activeChat.course.id);
      formData.append("instructorId", activeChat.instructor.id);
      formData.append("type", type);
      formData.append("file", file);

      await sendInstructorChatMessage(formData);
      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);
    } catch {
      toast.error("Ошибка отправки файла");
      setMessages((p) => p.filter((m) => !m.isOptimistic));
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
    <div className="h-[100dvh] md:h-[640px] p-3 md:p-6 flex flex-col md:flex-row gap-3">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          bg-white flex flex-col
          md:w-[50%]
          ${isMobileChatOpen ? "hidden md:flex" : "flex"}
        `}
      >
        <div className="px-6 py-4">
          <h2 className="text-3xl font-semibold">Chat</h2>
          <p className="text-lg text-gray-500">Recent Chats</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 px-3">
          {chats.map((chat) => {
            const companion =
              user.role === "instructor"
                ? chat.student
                : chat.instructor;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat);
                  setIsMobileChatOpen(true);
                }}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-xs">{chat.course.title}</p>
                <p className="font-medium text-sm">{companion.fullName}</p>
                <p className="text-xs text-sky-600">{chat.status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div
        className={`
          flex-1 bg-white border rounded-lg flex flex-col
          ${isMobileChatOpen ? "flex" : "hidden md:flex"}
        `}
      >
        {activeChat && (
          <>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <button
                onClick={() => setIsMobileChatOpen(false)}
                className="md:hidden text-xl"
              >
                ←
              </button>

              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div>
                <p className="font-medium text-sm">
                  {activeChatCompanion?.fullName}
                </p>
                <p className="text-xs text-sky-600">
                  {activeChat.status}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
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
                    <div
                      className={`
                        max-w-[260px] px-3 py-2 rounded-xl text-sm
                        ${m.isOptimistic ? "opacity-70" : ""}
                        ${isMe
                          ? "bg-white shadow rounded-br-sm"
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
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="border-t px-4 py-3 flex items-center gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setActionsOpen((p) => !p)}
                className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
              >
                <FaPlus />
              </button>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-10 px-4 rounded-full outline-none bg-gray-100"
                placeholder="Напишите сообщение"
              />

              <button
                onClick={sendMessage}
                className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center"
              >
                <img src={sendSvg} className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) =>
                  sendFile(e.target.files[0], "file")
                }
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  sendFile(e.target.files[0], "image")
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
