import React from 'react';

const TEXT = {
    ky: {
        title: 'Катышуу',
        present: 'Катышты',
        absent: 'Келген жок',
        late: 'Кечиккен',
    },
    ru: {
        title: 'Посещаемость',
        present: 'Присутствовал',
        absent: 'Отсутствовал',
        late: 'Опоздал',
    },
};

const Bar = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const AttendanceSummary = ({ stats = {}, lang = 'ky' }) => {
    const copy = TEXT[lang] || TEXT.ky;
    const { present = 0, absent = 0, late = 0 } = stats;
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.title}</h3>
            <Bar label={copy.present} value={present} color="bg-emerald-500" />
            <Bar label={copy.late} value={late} color="bg-amber-500" />
            <Bar label={copy.absent} value={absent} color="bg-red-500" />
        </div>
    );
};

export default AttendanceSummary;
