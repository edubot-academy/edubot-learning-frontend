import React from 'react';

const TEXT = {
    ky: {
        title: 'Тапшырманы жиберүү',
        notes: 'Комментарий',
        file: 'Файл',
        link: 'Шилтеме',
        submit: 'Жиберүү',
        cancel: 'Жабуу',
    },
    ru: {
        title: 'Отправить домашнее задание',
        notes: 'Комментарий',
        file: 'Файл',
        link: 'Ссылка',
        submit: 'Отправить',
        cancel: 'Закрыть',
    },
};

const SubmissionModal = ({ open, onClose, payload, setPayload, onSubmit, lang = 'ky' }) => {
    const copy = TEXT[lang] || TEXT.ky;
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#121212] p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">×</button>
                </div>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">{copy.notes}</label>
                        <textarea
                            value={payload.text}
                            onChange={(e) => setPayload((prev) => ({ ...prev, text: e.target.value }))}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-2"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">{copy.file}</label>
                        <input type="file" onChange={(e) => setPayload((prev) => ({ ...prev, file: e.target.files?.[0] }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">{copy.link}</label>
                        <input
                            value={payload.link}
                            onChange={(e) => setPayload((prev) => ({ ...prev, link: e.target.value }))}
                            placeholder="https://"
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-2"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700">
                        {copy.cancel}
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {copy.submit}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;
