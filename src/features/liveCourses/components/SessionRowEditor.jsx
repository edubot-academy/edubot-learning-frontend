import React from 'react';

const TEXT = {
    ky: {
        topic: 'Тема',
        date: 'Дата',
        start: 'Башталышы',
        end: 'Аягы',
        cancel: 'Жокко чыгаруу',
        reschedule: 'Кайра пландоо',
        status: 'Статус',
        markDone: 'Бүткөн деп белгилөө',
    },
    ru: {
        topic: 'Тема',
        date: 'Дата',
        start: 'Начало',
        end: 'Окончание',
        cancel: 'Отменить',
        reschedule: 'Перепланировать',
        status: 'Статус',
        markDone: 'Отметить завершенным',
    },
};

const STATUS_COLORS = {
    scheduled: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
};

const SessionRowEditor = ({
    session,
    onChange,
    onCancel,
    onComplete,
    onRelease,
    releaseLoading = false,
    lang = 'ky',
}) => {
    const copy = TEXT[lang] || TEXT.ky;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-[#1c1c1c]">
            <div className="lg:col-span-2 flex flex-col gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">{copy.topic}</label>
                <input
                    value={session.title}
                    onChange={(e) => onChange(session.id, { title: e.target.value })}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                />
                <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${STATUS_COLORS[session.status] || 'bg-gray-100 text-gray-700'}`}>
                        {copy.status}: {session.status}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">{copy.date}</label>
                <input
                    type="date"
                    value={session.date}
                    onChange={(e) => onChange(session.id, { date: e.target.value })}
                    className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">{copy.start}</label>
                <input
                    type="time"
                    value={session.startTime}
                    onChange={(e) => onChange(session.id, { startTime: e.target.value })}
                    className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">{copy.end}</label>
                <input
                    type="time"
                    value={session.endTime}
                    onChange={(e) => onChange(session.id, { endTime: e.target.value })}
                    className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] p-2 text-sm"
                />
            </div>
            <div className="lg:col-span-5 col-span-1 flex flex-row flex-wrap lg:flex-nowrap gap-2 justify-start lg:justify-end items-center w-full">
                <button
                    type="button"
                    onClick={() => onComplete && onComplete(session.id)}
                    className="px-3 py-2 rounded bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 whitespace-nowrap shrink-0"
                >
                    {copy.markDone}
                </button>
                <button
                    type="button"
                    onClick={() => onRelease && onRelease(session.id)}
                    disabled={releaseLoading}
                    className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap shrink-0 disabled:opacity-60"
                >
                    {releaseLoading ? '...' : lang === 'ru' ? 'Выпустить Д/З' : 'Тапшырма чыгаруу'}
                </button>
                <button
                    type="button"
                    onClick={() => onChange(session.id, { status: 'scheduled' })}
                    className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap shrink-0"
                >
                    {copy.reschedule}
                </button>
                <button
                    type="button"
                    onClick={() => onCancel(session.id)}
                    className="px-3 py-2 rounded bg-red-100 text-red-700 text-sm hover:bg-red-200 whitespace-nowrap shrink-0"
                >
                    {copy.cancel}
                </button>
            </div>
        </div>
    );
};

export default SessionRowEditor;
