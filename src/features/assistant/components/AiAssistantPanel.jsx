import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchCourseAiPrompts,
    fetchCourseAiChats,
    createCourseAiChat,
    deleteAiChat,
    fetchAiChatMessages,
    sendAiChatMessage,
} from '@services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiMoreHorizontal, FiPaperclip, FiMic } from 'react-icons/fi';
import Loader from '@shared/ui/Loader';
import ConfirmationModal from '@shared/ui/ConfirmationModal';
import { parseApiError } from '@shared/api/error';

const formatTime = (dateString, language = 'ky') => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const locale = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'ky-KG';
        return date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
};

const EmptyState = ({ loading }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center text-gray-500 text-sm py-8">
            {loading
                ? <Loader fullScreen={false} />
                : t('assistantPanel.empty.noQuestions')}
        </div>
    );
};
EmptyState.propTypes = {
    loading: PropTypes.bool,
};

const sortChats = (items = []) =>
    [...items].sort(
        (a, b) =>
            new Date(b.lastMessageAt || b.updatedAt || 0).getTime() -
            new Date(a.lastMessageAt || a.updatedAt || 0).getTime()
    );

const AiAssistantPanel = ({ courseId, languageCode = 'ru' }) => {
    const { t, i18n } = useTranslation();
    const [prompts, setPrompts] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const activeChat = useMemo(
        () => chats.find((chat) => chat.id === activeChatId),
        [chats, activeChatId]
    );

    const loadPrompts = useCallback(async () => {
        try {
            const data = await fetchCourseAiPrompts(courseId);
            setPrompts(data || []);
        } catch (error) {
            console.error(error);
        }
    }, [courseId]);

    const loadMessages = useCallback(async (chatId) => {
        if (!chatId) return;
        setLoadingMessages(true);
        try {
            const data = await fetchAiChatMessages(chatId);
            setMessages(data || []);
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, t('assistantPanel.toasts.messagesLoadFailed')).message);
        } finally {
            setLoadingMessages(false);
        }
    }, [t]);

    const handleCreateChat = useCallback(
        async (silent = false) => {
            try {
                const newChat = await createCourseAiChat(courseId, { language: languageCode });
                setChats((prev) => sortChats([newChat, ...prev]));
                setActiveChatId(newChat.id);
                setMessages([]);
                if (!silent) {
                    toast.success(t('assistantPanel.toasts.chatCreated'));
                }
            } catch (error) {
                console.error(error);
                toast.error(parseApiError(error, t('assistantPanel.toasts.chatCreateFailed')).message);
            } finally {
                setMenuOpen(false);
            }
        },
        [courseId, languageCode, t]
    );

    const loadChats = useCallback(async () => {
        setLoadingChats(true);
        try {
            const data = await fetchCourseAiChats(courseId);
            const sortedData = sortChats(data || []);
            setChats(sortedData);
            if (sortedData.length) {
                const firstChat = sortedData[0];
                setActiveChatId(firstChat.id);
                await loadMessages(firstChat.id);
            } else {
                await handleCreateChat(true);
            }
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, t('assistantPanel.toasts.chatsLoadFailed')).message);
        } finally {
            setLoadingChats(false);
        }
    }, [courseId, handleCreateChat, loadMessages, t]);

    useEffect(() => {
        loadPrompts();
    }, [loadPrompts]);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const handleDeleteChat = () => {
        if (!activeChatId) return;
        setDeleteConfirmOpen(true);
        setMenuOpen(false);
    };

    const confirmDeleteChat = async () => {
        if (!activeChatId) return;

        try {
            await deleteAiChat(activeChatId);
            const remaining = chats.filter((chat) => chat.id !== activeChatId);
            setChats(remaining);
            setMessages([]);
            if (remaining.length > 0) {
                const nextChat = remaining[0];
                setActiveChatId(nextChat.id);
                await loadMessages(nextChat.id);
            } else {
                setActiveChatId(null);
                await handleCreateChat(true);
            }
            toast.success(t('assistantPanel.toasts.chatDeleted'));
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, t('assistantPanel.toasts.chatDeleteFailed')).message);
        } finally {
            setMenuOpen(false);
            setDeleteConfirmOpen(false);
        }
    };

    const handleSend = async (messageOverride) => {
        const message = typeof messageOverride === 'string' ? messageOverride : inputValue;
        const trimmed = message.trim();
        if (!trimmed || !activeChatId) return;
        setSending(true);
        if (!messageOverride) {
            setInputValue('');
        }
        try {
            await sendAiChatMessage(activeChatId, { content: trimmed });
            await loadMessages(activeChatId);
            setChats((prev) =>
                sortChats(
                    prev.map((chat) =>
                        chat.id === activeChatId
                            ? {
                                  ...chat,
                                  lastMessageAt: new Date().toISOString(),
                              }
                            : chat
                    )
                )
            );
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error, t('assistantPanel.toasts.sendFailed')).message);
            if (!messageOverride) {
                setInputValue(trimmed);
            }
        } finally {
            setSending(false);
        }
    };

    const handleSelectPrompt = (text) => {
        handleSend(text);
    };

    const renderMessages = () => {
        if (loadingMessages) return <EmptyState loading />;
        if (!messages.length) return <EmptyState loading={false} />;

        return (
            <div className="space-y-3 px-2 min-h-[220px]">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                                message.role === 'user'
                                    ? 'bg-gradient-to-r from-orange-200 to-orange-100 text-gray-900 rounded-br-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}
                        >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <span className="block text-[11px] text-gray-500 mt-1 text-right">
                                {formatTime(message.createdAt, i18n.language)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
        <div className="bg-white border border-gray-200 rounded-[28px] shadow-sm p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-6 right-6 z-10">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label={t('assistantPanel.actions.openMenu')}
                        className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 bg-white shadow-sm"
                    >
                    <FiMoreHorizontal size={20} />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-10">
                        <button
                            type="button"
                            onClick={() => handleCreateChat(false)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                            {t('assistantPanel.actions.newChat')}
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteChat}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500"
                            disabled={!activeChatId}
                        >
                            {t('assistantPanel.actions.deleteChat')}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">{t('assistantPanel.hero.eyebrow')}</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        <span className="text-[#FF6B00]">{t('assistantPanel.hero.brand')}</span> {t('assistantPanel.hero.titleSuffix')}
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                        {t('assistantPanel.hero.description')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center py-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#FF8008] to-[#FF4B1F] shadow-inner" />
                <p className="mt-4 text-sm text-gray-500">
                    {t('assistantPanel.chat.label', {
                        title: activeChat?.title || t('assistantPanel.chat.untitled'),
                    })}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#FF6B00]">
                    {t('assistantPanel.chat.greeting')}
                </p>
            </div>

            {loadingChats && (
                <Loader fullScreen={false} />
            )}

            <div className="border border-gray-200 rounded-3xl p-4 bg-white space-y-4">
                {renderMessages()}
                {prompts.length > 0 && (
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
                            {t('assistantPanel.prompts.title')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {prompts.map((prompt) => (
                                <button
                                    key={prompt.id || prompt.text}
                                    type="button"
                                    onClick={() => handleSelectPrompt(prompt.text)}
                                    className="px-4 py-2 rounded-full border border-gray-200 text-xs text-gray-700 hover:bg-gray-100 transition"
                                >
                                    {prompt.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="space-y-3">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('assistantPanel.input.placeholder')}
                        className="w-full border border-gray-200 rounded-2xl bg-white px-4 py-3 text-sm text-gray-900 shadow-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#FFB37C]"
                        rows={3}
                    />
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800"
                                title={t('assistantPanel.input.attachFile')}
                                aria-label={t('assistantPanel.input.attachFile')}
                            >
                                <FiPaperclip />
                            </button>
                            <button
                                type="button"
                                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800"
                                title={t('assistantPanel.input.voiceInputSoon')}
                                aria-label={t('assistantPanel.input.voiceInputSoon')}
                            >
                                <FiMic />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || !inputValue.trim()}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF7E21] to-[#FF5F3D] text-white text-sm font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {sending ? t('assistantPanel.input.sending') : t('assistantPanel.input.send')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmationModal
            isOpen={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDeleteChat}
            title={t('assistantPanel.deleteModal.title')}
            message={t('assistantPanel.deleteModal.message')}
            confirmLabel={t('assistantPanel.deleteModal.confirm')}
            cancelLabel={t('common.cancel')}
            confirmVariant="danger"
        />
        </>
    );
};

export default AiAssistantPanel;

AiAssistantPanel.propTypes = {
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    languageCode: PropTypes.string,
};
