import React from 'react';
import SessionRowEditor from './SessionRowEditor';

const TEXT = {
    ky: {
        header: 'Сабактар тизмеси',
        add: 'Кошумча сабак кошуу',
        empty: 'Сабактар дагы түзүлө элек',
    },
    ru: {
        header: 'Список занятий',
        add: 'Добавить дополнительное занятие',
        empty: 'Занятий пока нет',
    },
};

const SessionList = ({
    sessions = [],
    onAdd,
    onChange,
    onCancel,
    onComplete,
    lang = 'ky',
}) => {
    const copy = TEXT[lang] || TEXT.ky;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.header}</h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                    {copy.add}
                </button>
            </div>
            {sessions.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{copy.empty}</div>
            )}
            <div className="space-y-3">
                {sessions.map((session) => (
                    <SessionRowEditor
                        key={session.id}
                        session={session}
                        onChange={onChange}
                        onCancel={onCancel}
                        onComplete={onComplete}
                        lang={lang}
                    />
                ))}
            </div>
        </div>
    );
};

export default SessionList;
