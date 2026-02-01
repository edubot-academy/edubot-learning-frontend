import React from 'react';

const TEXT = {
    ky: {
        title: 'Кийинки сабак',
        location: 'Дарек',
        link: 'Шилтеме',
        time: 'Убактысы',
    },
    ru: {
        title: 'Ближайшее занятие',
        location: 'Адрес',
        link: 'Ссылка',
        time: 'Время',
    },
};

const UpcomingSessionCard = ({ session, lang = 'ky' }) => {
    const copy = TEXT[lang] || TEXT.ky;
    if (!session) return null;
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{copy.title}</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{session.title}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                    {session.status || 'scheduled'}
                </span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{copy.time}:</span>
                    <span>
                        {session.date} · {session.startTime} - {session.endTime} ({session.timezone || 'Asia/Bishkek'})
                    </span>
                </div>
                {session.location && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{copy.location}:</span>
                        <span>{session.location}</span>
                    </div>
                )}
                {session.meetingUrl && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{copy.link}:</span>
                        <a href={session.meetingUrl} className="text-emerald-600 underline" target="_blank" rel="noreferrer">
                            {session.meetingUrl}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingSessionCard;
