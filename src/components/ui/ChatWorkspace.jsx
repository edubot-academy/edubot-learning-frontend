import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    FiArrowLeft,
    FiClock,
    FiImage,
    FiMessageCircle,
    FiPaperclip,
    FiPlus,
    FiSearch,
    FiSend,
    FiUser,
} from 'react-icons/fi';
import { DashboardInsetPanel, DashboardMetricCard, EmptyState } from './dashboard';

const STATUS_PILL = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const ChatWorkspace = ({
    sidebarTitle = 'Сүйлөшүүлөр',
    sidebarDescription,
    sidebarAction,
    stats = [],
    query,
    onQueryChange,
    queryPlaceholder = 'Чат издөө',
    chatItems,
    activeChatId,
    onSelectChat,
    noChatsTitle,
    noChatsSubtitle,
    activeChatTitle,
    activeChatSubtitle,
    activeStatusLabel,
    activeStatusTone = 'default',
    onBack,
    emptySelectionTitle,
    emptySelectionSubtitle,
    messages,
    currentUserRole,
    formatMessageTime,
    message,
    onMessageChange,
    onSendMessage,
    onKeyDown,
    sending,
    actionsOpen,
    onToggleActions,
    onAttach,
    composerPlaceholder = 'Билдирүү жаз...',
}) => {
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const messagesRef = useRef(null);
    const [optimisticImageUrls, setOptimisticImageUrls] = useState({});

    useEffect(() => {
        const nextUrls = {};

        messages.forEach((item) => {
            if (item?.type === 'image' && !item?.url && item?.file) {
                nextUrls[item.id] = URL.createObjectURL(item.file);
            }
        });

        setOptimisticImageUrls(nextUrls);

        return () => {
            Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [messages]);

    const metricsGridClass =
        stats.length >= 3 ? 'grid-cols-3' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

    const sidebarContent = (
        <DashboardInsetPanel
            title={sidebarTitle}
            description={sidebarDescription}
            action={sidebarAction}
            className="h-full"
        >
            <div className="mt-4 space-y-4">
                {stats.length ? (
                    <div className={`grid gap-3 ${metricsGridClass}`}>
                        {stats.map((stat) => (
                            <DashboardMetricCard
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                                icon={stat.icon}
                                tone={stat.tone}
                                className="px-3 py-2.5"
                            />
                        ))}
                    </div>
                ) : null}

                <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder={queryPlaceholder}
                        className="dashboard-field dashboard-field-icon pl-10"
                    />
                </div>

                {chatItems.length === 0 ? (
                    <EmptyState
                        title={noChatsTitle}
                        subtitle={noChatsSubtitle}
                        icon={<FiMessageCircle className="h-8 w-8 text-edubot-orange" />}
                        className="py-8"
                    />
                ) : (
                    <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                        {chatItems.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`w-full rounded-3xl border p-4 text-left transition-all duration-300 ${
                                    activeChatId === chat.id
                                        ? 'border-edubot-orange bg-white shadow-edubot-card dark:border-edubot-soft dark:bg-slate-900'
                                        : 'border-edubot-line/80 bg-white/80 hover:-translate-y-0.5 hover:border-edubot-orange/40 hover:shadow-edubot-card dark:border-slate-700 dark:bg-slate-950'
                                }`}
                                role="option"
                                aria-selected={activeChatId === chat.id}
                                aria-label={chat.ariaLabel}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange dark:bg-slate-800 dark:text-edubot-soft">
                                        {chat.avatarText || <FiUser className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-semibold text-edubot-ink dark:text-white">
                                                {chat.title}
                                            </p>
                                            <span className="text-[11px] text-edubot-muted dark:text-slate-400">
                                                {chat.meta}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-edubot-muted dark:text-slate-400">
                                            {chat.subtitle}
                                        </p>
                                        {chat.statusLabel ? (
                                            <span
                                                className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                    STATUS_PILL[chat.statusTone] || STATUS_PILL.default
                                                }`}
                                            >
                                                {chat.statusLabel}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </DashboardInsetPanel>
    );

    if (!activeChatId) {
        return (
            <div className="space-y-4">
                {sidebarContent}
                <DashboardInsetPanel title="Чатты тандаңыз" description={emptySelectionSubtitle}>
                    <EmptyState
                        title={emptySelectionTitle}
                        subtitle={emptySelectionSubtitle}
                        icon={<FiMessageCircle className="h-8 w-8 text-edubot-orange" />}
                        className="py-10"
                    />
                </DashboardInsetPanel>
            </div>
        );
    }

    return (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
            <div className="hidden xl:block">{sidebarContent}</div>

            <DashboardInsetPanel
                title={activeChatTitle}
                description={activeChatSubtitle}
                action={
                    activeStatusLabel ? (
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                STATUS_PILL[activeStatusTone] || STATUS_PILL.default
                            }`}
                        >
                            {activeStatusLabel}
                        </span>
                    ) : null
                }
                className="h-auto self-start"
            >
                <div className="mt-4 flex flex-col">
                    {onBack ? (
                        <div className="mb-4 flex items-center gap-3 xl:hidden">
                            <button
                                onClick={onBack}
                                className="dashboard-button-secondary !px-3"
                                aria-label="Чаттарга кайтуу"
                            >
                                <FiArrowLeft className="h-4 w-4" />
                            </button>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-edubot-ink dark:text-white">
                                    {activeChatTitle}
                                </p>
                                <p className="truncate text-xs text-edubot-muted dark:text-slate-400">
                                    {activeChatSubtitle}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div
                        ref={messagesRef}
                        className="h-[280px] space-y-4 overflow-y-auto rounded-3xl border border-edubot-line/70 bg-edubot-surfaceAlt/35 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/70 md:h-[300px] xl:h-[320px]"
                        role="log"
                        aria-label="Чат билдирүүлөрү"
                    >
                        {messages.length === 0 ? (
                            <EmptyState
                                title="Баарлашууну баштаңыз"
                                subtitle="Бул чатка биринчи билдирүүнү жазыңыз."
                                icon={<FiMessageCircle className="h-8 w-8 text-edubot-orange" />}
                                className="py-10"
                            />
                        ) : (
                            messages.map((m) => {
                                const isMe = m.role === currentUserRole;

                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        role="article"
                                        aria-label={`${isMe ? 'Сиздин' : 'Алардын'} билдирүү: ${m.content || 'Файл'}`}
                                    >
                                        <div className="max-w-xs sm:max-w-md lg:max-w-lg">
                                            <div
                                                className={`rounded-3xl px-4 py-3 text-sm shadow-sm transition-all duration-200 ${
                                                    m.isOptimistic ? 'animate-pulse opacity-70' : ''
                                                } ${
                                                    isMe
                                                        ? 'rounded-br-md bg-edubot-orange text-white'
                                                        : 'rounded-bl-md border border-edubot-line/70 bg-white text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                                                }`}
                                            >
                                                {m.type === 'image' ? (
                                                    <img
                                                        src={m.url || optimisticImageUrls[m.id]}
                                                        alt="Чат сүрөтү"
                                                        className="h-auto max-w-full rounded-2xl"
                                                        loading="lazy"
                                                    />
                                                ) : m.type === 'file' ? (
                                                    <div className="flex items-center gap-2">
                                                        <FiPaperclip className="h-4 w-4" />
                                                        <span className="truncate">{m.file?.name || 'Файл'}</span>
                                                    </div>
                                                ) : (
                                                    <p className="break-words whitespace-pre-wrap">{m.content}</p>
                                                )}
                                            </div>

                                            <p
                                                className={`mt-1 px-2 text-xs ${
                                                    isMe
                                                        ? 'text-right text-edubot-muted dark:text-slate-400'
                                                        : 'text-left text-edubot-muted dark:text-slate-400'
                                                }`}
                                            >
                                                {formatMessageTime(m.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <footer className="mt-4 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                        <div className="flex items-end gap-3">
                            <div className="relative flex-shrink-0">
                                <button
                                    onClick={onToggleActions}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-edubot-surfaceAlt text-edubot-orange transition hover:scale-105 dark:bg-slate-800 dark:text-edubot-soft"
                                    type="button"
                                    aria-label="Файл кошуу"
                                    aria-expanded={actionsOpen}
                                    aria-controls="attachment-menu"
                                >
                                    <FiPlus className="h-4 w-4" />
                                </button>

                                {actionsOpen ? (
                                    <div
                                        id="attachment-menu"
                                        className="absolute bottom-14 left-0 z-10 min-w-[170px] overflow-hidden rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900"
                                        role="menu"
                                    >
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-edubot-ink transition hover:bg-edubot-surfaceAlt dark:text-slate-200 dark:hover:bg-slate-800"
                                            role="menuitem"
                                        >
                                            <FiPaperclip className="h-4 w-4 text-edubot-orange" />
                                            <span>Файл</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                imageInputRef.current?.click();
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-edubot-ink transition hover:bg-edubot-surfaceAlt dark:text-slate-200 dark:hover:bg-slate-800"
                                            role="menuitem"
                                        >
                                            <FiImage className="h-4 w-4 text-edubot-orange" />
                                            <span>Сүрөт</span>
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex-1">
                                <input
                                    value={message}
                                    onChange={(e) => onMessageChange(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    className="dashboard-field h-11 w-full rounded-2xl"
                                    placeholder={composerPlaceholder}
                                    disabled={sending}
                                    type="text"
                                    aria-label="Билдирүү киргизүү"
                                />
                            </div>

                            <button
                                onClick={onSendMessage}
                                disabled={!message.trim() || sending}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-edubot-orange text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                                type="submit"
                                aria-label="Билдирүү жөнөтүү"
                            >
                                {sending ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <FiSend className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <div className="hidden">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onAttach('file', file);
                                    e.target.value = '';
                                }}
                                aria-label="Файл тандао"
                            />
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onAttach('image', file);
                                    e.target.value = '';
                                }}
                                aria-label="Сүрөт тандао"
                            />
                        </div>
                    </footer>
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

ChatWorkspace.propTypes = {
    sidebarTitle: PropTypes.string,
    sidebarDescription: PropTypes.string,
    sidebarAction: PropTypes.node,
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            icon: PropTypes.elementType,
            tone: PropTypes.string,
        })
    ),
    query: PropTypes.string.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    queryPlaceholder: PropTypes.string,
    chatItems: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            subtitle: PropTypes.string,
            meta: PropTypes.string,
            statusLabel: PropTypes.string,
            statusTone: PropTypes.string,
            avatarText: PropTypes.node,
            ariaLabel: PropTypes.string,
        })
    ).isRequired,
    activeChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSelectChat: PropTypes.func.isRequired,
    noChatsTitle: PropTypes.string.isRequired,
    noChatsSubtitle: PropTypes.string.isRequired,
    activeChatTitle: PropTypes.string,
    activeChatSubtitle: PropTypes.string,
    activeStatusLabel: PropTypes.string,
    activeStatusTone: PropTypes.string,
    onBack: PropTypes.func,
    emptySelectionTitle: PropTypes.string.isRequired,
    emptySelectionSubtitle: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentUserRole: PropTypes.string.isRequired,
    formatMessageTime: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    onMessageChange: PropTypes.func.isRequired,
    onSendMessage: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    sending: PropTypes.bool.isRequired,
    actionsOpen: PropTypes.bool.isRequired,
    onToggleActions: PropTypes.func.isRequired,
    onAttach: PropTypes.func.isRequired,
    composerPlaceholder: PropTypes.string,
};

export default ChatWorkspace;
