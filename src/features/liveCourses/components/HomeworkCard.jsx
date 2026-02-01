import React from 'react';

const TEXT = {
    ky: {
        new: 'Жаңы тапшырма',
        dueSoon: 'Дедлайн жакындады',
        overdue: 'Мөөнөт өттү',
        status: 'Статус',
    },
    ru: {
        new: 'Новая задача',
        dueSoon: 'Срок близко',
        overdue: 'Просрочено',
        status: 'Статус',
    },
};

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    submitted: 'bg-blue-100 text-blue-700',
    needs_changes: 'bg-red-100 text-red-700',
    approved: 'bg-emerald-100 text-emerald-700',
};

const HomeworkCard = ({ homework, lang = 'ky' }) => {
    const copy = TEXT[lang] || TEXT.ky;
    if (!homework) return null;
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{copy[homework.tag] || copy.new}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{homework.title}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[homework.status] || 'bg-gray-100 text-gray-700'}`}>
                    {copy.status}: {homework.status}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{homework.description}</p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Дедлайн: {homework.dueDate || '—'}
            </div>
        </div>
    );
};

export default HomeworkCard;
