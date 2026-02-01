import React from 'react';

const TEXT = {
    ky: {
        header: 'Студенттер тизмеси',
        seats: 'Орун лимити',
        remove: 'Өчүрүү',
    },
    ru: {
        header: 'Список студентов',
        seats: 'Лимит мест',
        remove: 'Удалить',
    },
};

const RosterTable = ({ roster = [], seatUsage, onRemove, lang = 'ky' }) => {
    const copy = TEXT[lang] || TEXT.ky;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.header}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {copy.seats}: {seatUsage}
                </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <tr>
                            <th className="px-3 py-2">Аты-жөнү</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2 w-24 text-right"> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {roster.map((student) => (
                            <tr key={student.id} className="border-t border-gray-100 dark:border-gray-700">
                                <td className="px-3 py-2">{student.name || student.fullName || 'Студент'}</td>
                                <td className="px-3 py-2 text-gray-500">{student.email || '-'}</td>
                                <td className="px-3 py-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(student.id)}
                                        className="text-red-600 text-sm font-semibold"
                                    >
                                        {copy.remove}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {roster.length === 0 && (
                            <tr>
                                <td className="px-3 py-2 text-gray-500" colSpan={3}>
                                    Студенттер кошула элек
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RosterTable;
