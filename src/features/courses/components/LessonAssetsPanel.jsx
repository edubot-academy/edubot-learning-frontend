const LessonAssetsPanel = ({
    kind,
    onVideoFile,
    videoExists,
    videoProgress,
    previewVideo,
    onPreviewVideoChange,
    previewLabel,
    onResourceFile,
    resourceExists,
    resourceProgress,
    resourceName,
    onResourceNameChange,
    resourceNameDisabled,
}) => {
    return (
        <details className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-[#1b1b1b]">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Файлдар жана материалдар
            </summary>
            <div className="space-y-3 px-3 pb-3 pt-1">
                {kind === 'video' && (
                    <>
                        <label className="mb-1 block font-medium">Видео жүктөө</label>
                        <div className="flex items-center justify-between gap-2">
                            <input
                                type="file"
                                accept="video/*"
                                className="mb-2 w-full"
                                onChange={(e) => onVideoFile(e.target.files?.[0])}
                            />
                            {videoExists && (
                                <span className="whitespace-nowrap text-xs text-blue-500">
                                    Видео файл бар
                                </span>
                            )}
                        </div>
                        {videoProgress > 0 && (
                            <>
                                <div className="mb-1 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className="h-full rounded bg-blue-600"
                                        style={{ width: `${videoProgress}%` }}
                                    ></div>
                                </div>
                                <p className="mb-2 text-xs text-gray-500 dark:text-[#a6adba]">
                                    {videoProgress}% жүктөлдү
                                </p>
                            </>
                        )}
                        <label className="mt-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={Boolean(previewVideo)}
                                onChange={(e) => onPreviewVideoChange(e.target.checked)}
                            />
                            {previewLabel}
                        </label>
                    </>
                )}

                <label className="mb-1 mt-1 block font-medium">Материал жүктөө (PDF, ZIP)</label>
                <div className="flex items-center justify-between gap-2">
                    <input
                        type="file"
                        accept=".pdf,.zip"
                        onChange={(e) => onResourceFile(e.target.files?.[0])}
                        className="mb-2 w-full"
                    />
                    {resourceExists && (
                        <span className="whitespace-nowrap text-xs text-purple-500">
                            Материал файл бар
                        </span>
                    )}
                </div>
                {resourceProgress > 0 && (
                    <>
                        <div className="mb-1 h-2 w-full rounded bg-gray-100">
                            <div
                                className="h-full rounded bg-purple-500 transition-all duration-200"
                                style={{ width: `${resourceProgress}%` }}
                            />
                        </div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-[#a6adba]">
                            {resourceProgress}% жүктөлдү
                        </p>
                    </>
                )}

                <label className="block text-sm font-medium">Материалдын аталышы</label>
                <input
                    type="text"
                    className="mb-2 w-full rounded border bg-white p-2 dark:bg-[#222222] dark:text-white"
                    value={resourceName || ''}
                    onChange={(e) => onResourceNameChange(e.target.value)}
                    placeholder="мисалы: Практикалык тапшырмалар.pdf"
                    disabled={resourceNameDisabled}
                />
                <p className="mb-1 text-xs text-gray-500">Бул аталыш студенттерге көрсөтүлөт.</p>
            </div>
        </details>
    );
};

export default LessonAssetsPanel;
