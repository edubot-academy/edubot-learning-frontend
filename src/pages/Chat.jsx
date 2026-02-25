import { useState, useEffect, useRef, useContext } from "react";
import {
  fetchInstructorChats,
  fetchInstructorChatMessages,
  sendInstructorChatMessage,
  replyInstructorChatMessage,
  fetchStudentCourses,
  fetchCourseDetails,
} from "@services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import sendSvg from "../assets/icons/send.svg";
import Loader from "@shared/ui/Loader";

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
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [newChatCourseId, setNewChatCourseId] = useState("");
  const [newChatLoading, setNewChatLoading] = useState(false);
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
      await replyInstructorChatMessage({
        chatId: activeChat.id,
        content: optimistic.content,
        type: "text",
      });

      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);
    } catch {
      toast.error("Жүктөө учурунда ката кетти");
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
      await replyInstructorChatMessage({
        chatId: activeChat.id,
        type,
        file,
      });
      const res = await fetchInstructorChatMessages(activeChat.id);
      setMessages(res?.messages ?? []);
    } catch {
      toast.error("Файлды жүктөөдө ката кетти");
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
    return <Loader fullScreen />;
  }

  return (
    <div className="h-[100dvh] md:h-[640px] p-3 md:p-6 flex flex-col md:flex-row gap-3">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
        bg-white dark:bg-[#141619] flex flex-col
          md:w-[50%]
          ${isMobileChatOpen ? "hidden md:flex" : "flex"}
        `}
      >
        <div className="px-6 py-4">
          <h2 className="text-3xl font-semibold">Chat</h2>
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg text-gray-500">Recent Chats</p>
            {user?.role === "student" && (
              <button
                type="button"
                onClick={() => {
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
                }}
                className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
              >
                Жаңы чат
              </button>
            )}
          </div>
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
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer"
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
          flex-1 bg-white dark:bg-[#141619] border rounded-lg flex flex-col
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
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="border-t px-4 py-3 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#141619]">
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
                className="flex-1 h-10 px-4 rounded-full outline-none text-black dark:text-white bg-white dark:bg-[#222222]"
                placeholder="Баарлашууну баштаныз"
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

      {/* ================= NEW CHAT MODAL ================= */}
      {newChatOpen && user?.role === "student" && (
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
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                        String(newChatCourseId) === String(courseItem.id || courseItem.courseId)
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 dark:border-gray-700"
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">{instructorName}</p>
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
                onClick={async () => {
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
                      setIsMobileChatOpen(true);
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
                }}
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
}
