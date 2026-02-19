
import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
    fetchInstructorChats,
    fetchInstructorChatMessages,
    sendInstructorChatMessage,
} from '@services/api';
import { FaPlus } from 'react-icons/fa6';
import { SlPicture } from 'react-icons/sl';
import { CgFileDocument } from 'react-icons/cg';
import sendSvg from '../../assets/icons/send.svg';
import { AuthContext } from '@app/providers';
import Loader from '@shared/ui/Loader';

export default function InstructorChat({ course, onClose }) {
    const { user } = useContext(AuthContext);

    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);

    const messagesRef = useRef(null);
    const actionsRef = useRef(null);

    // Закрытие actions при клике вне них
    useEffect(() => {
        const handleClickOutsideActions = (event) => {
            if (actionsOpen && actionsRef.current && !actionsRef.current.contains(event.target)) {
                const plusButton = document.querySelector('button[onClick*="setActionsOpen"]');
                if (plusButton && !plusButton.contains(event.target)) {
                    setActionsOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutsideActions);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideActions);
        };
    }, [actionsOpen]);

    /* ================= LOAD CHAT FOR COURSE ================= */
    useEffect(() => {
        if (!course?.id || !user) return;

        (async () => {
            try {
                const chats = await fetchInstructorChats({ role: 'student' });
                const chatForCourse = chats.find((c) => c.course?.id === course.id);

                if (chatForCourse) {
                    setActiveChat(chatForCourse);
                } else {
                    setActiveChat(null);
                }
            } catch (e) {
                console.error('Баарлашууну жүктөөдө ката кетти', e);
            }
        })();
    }, [course, user]);

    /* ================= LOAD MESSAGES ================= */
    useEffect(() => {
        if (!activeChat?.id) return;

        (async () => {
            setLoading(true);
            try {
                const res = await fetchInstructorChatMessages(activeChat.id);
                setMessages(res?.messages ?? []);
            } catch {
                console.error('Билдирүүлөрдү жүктөөдө ката кетти');
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
            behavior: 'smooth',
        });
    }, [messages, loading]);

    /* ================= SEND MESSAGE ================= */
    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || sending || !user) return;

        const optimisticMessage = {
            id: Date.now(),
            role: user.role,
            content: trimmedMessage,
            createdAt: new Date().toISOString(),
            type: 'text',
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setMessage('');
        setSending(true);

        try {
            const payload = {
                content: trimmedMessage,
                courseId: course.id,
                instructorId: course.instructor.id,
            };

            if (activeChat?.id) {
                payload.chatId = activeChat.id;
            }

            const response = await sendInstructorChatMessage(payload);

            if (!activeChat?.id && response?.chat) {
                setActiveChat(response.chat);
            } else if (!activeChat?.id && response?.chatId) {
                const chats = await fetchInstructorChats({ role: 'student' });
                const newChat = chats.find((c) => c.id === response.chatId);
                if (newChat) {
                    setActiveChat(newChat);
                }
            }

            const chatId = activeChat?.id || response?.chatId;
            if (chatId) {
                const res = await fetchInstructorChatMessages(chatId);
                setMessages(res?.messages ?? []);
            }
        } catch (error) {
            console.error('Жүктөөдө ката кетти', error);
            setMessages((prev) => prev.filter((m) => !m.isOptimistic));
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

    // УБЕДИТЕСЬ, что у вас есть все необходимые данные!
    if (!course || !course.instructor) {
        return (
            <div className="w-full max-w-md h-[70vh] max-h-[500px] bg-white dark:bg-[#222222] rounded-xl shadow-xl border flex flex-col mx-auto">
                <div className="p-4 text-center text-gray-500">
                    Курс маалыматы жүктөлө элек...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md h-[70vh] max-h-[500px] bg-white dark:bg-[#222222] rounded-xl shadow-xl border flex flex-col mx-auto mt-12">
            {/* ================= HEADER ================= */}
            <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img
                        src={course.instructor.avatarUrl || '/default-avatar.png'}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-gray-300"
                        alt={course.instructor.fullName || 'Инструктор'}
                        onError={(e) => {
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                    <div>
                        <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                            {course.instructor.fullName || 'Инструктор'}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#0284C7]">
                            {activeChat?.status || 'Онлайн'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* ================= MESSAGES ================= */}
            <div 
                ref={messagesRef} 
                className="flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 space-y-3 bg-gray-50 dark:bg-[#1A1A1A]"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                       <Loader fullScreen={false} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#EA580C]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Баарлашууну баштаңыз
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Инструкторго биринчи билдирүүңүздү жөнөтүңүз
                        </p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = m.role === user?.role;

                        return (
                            <div
                                key={m.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="max-w-[70%] sm:max-w-[280px]">
                                    <div
                                        className={`px-3 py-2 text-[13px] sm:text-[14px] rounded-xl ${
                                            isMe
                                                ? 'bg-[#F3F4F6] border border-gray-300 rounded-br-sm text-gray-900'
                                                : 'bg-[#EA580C] text-white rounded-bl-sm'
                                        }`}
                                    >
                                        {m.type === 'image' ? (
                                            <img
                                                src={m.url}
                                                className="rounded-lg max-w-full"
                                                alt="Сүрөт"
                                            />
                                        ) : m.type === 'file' ? (
                                            <span className="underline flex items-center gap-1">
                                                📎 {m.file?.name || 'Файл'}
                                            </span>
                                        ) : (
                                            m.content
                                        )}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-gray-500 mt-1 text-right">
                                        {new Date(m.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ================= INPUT AREA ================= */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 sm:px-4 sm:py-3">
                {/* Actions panel */}
                <div className="relative mb-2 sm:mb-3" ref={actionsRef}>
                    <div
                        className={`absolute bottom-full left-0 mb-1 sm:mb-2 flex gap-1 sm:gap-2 transition-all duration-300 ${
                            actionsOpen 
                                ? 'opacity-100 visible transform translate-y-0' 
                                : 'opacity-0 invisible transform translate-y-2'
                        }`}
                    >
                        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF7ED] shadow flex items-center justify-center hover:bg-[#FED7AA] transition-colors">
                            <CgFileDocument className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF7ED] shadow flex items-center justify-center hover:bg-[#FED7AA] transition-colors">
                            <SlPicture className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Input field and send button */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setActionsOpen(!actionsOpen)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center hover:bg-[#FED7AA] transition-colors"
                    >
                        <FaPlus className="w-3 h-3 sm:w-4 sm:h-4 text-[#EA580C]" />
                    </button>
                    
                    <div className="flex-1 relative">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Билдирүү жазыңыз..."
                            className="w-full h-8 sm:h-10 px-3 sm:px-4 rounded-full text-xs sm:text-sm focus:outline-none bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#EA580C] transition-colors"
                        />
                    </div>
                    
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            message.trim() && !sending
                                ? 'bg-gradient-to-t from-[#FF8C6E] to-[#E14219] hover:opacity-90 cursor-pointer'
                                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        }`}
                    >
                        {sending ? (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <img src={sendSvg} className="w-3 h-3 sm:w-4 sm:h-4" alt="Жөнөтүү" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
