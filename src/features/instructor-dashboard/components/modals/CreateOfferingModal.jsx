const CreateOfferingModal = ({ courses, form, onChange, onClose, onSubmit, creating, mode }) => {
    const modalityDescriptions = {
        ONLINE: 'Zoom же Google Meet аркылуу жандуу сабак.',
        OFFLINE: 'Офлайн тренинг – жайгашкан жерди көрсөтүңүз.',
        HYBRID: 'Онлайн жана офлайн аралаш формат.',
    };

    const scheduleBlocks = form.scheduleBlocks || [];

    const handleBlockChange = (index, field, value) => {
        const next = scheduleBlocks.map((block, idx) =>
            idx === index ? { ...block, [field]: value } : block
        );
        onChange('scheduleBlocks', next);
    };

    const handleBlockAdd = () => {
        onChange('scheduleBlocks', [...scheduleBlocks, { day: '', startTime: '', endTime: '' }]);
    };

    const handleBlockRemove = (index) => {
        onChange(
            'scheduleBlocks',
            scheduleBlocks.filter((_, idx) => idx !== index)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="rounded-3xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141619]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-400">
                            {mode === 'edit' ? 'Offering өзгөртүү' : 'Жаңы offering'}
                        </p>
                        <h2 className="text-2xl font-semibold">
                            {mode === 'edit' ? 'Offeringди өзгөртүү' : 'Курс сунушун түзүү'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 dark:text-[#a6adba] hover:text-gray-700"
                    >
                        Жабуу
                    </button>
                </div>

                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Курс
                            </label>
                            <select
                                value={form.courseId}
                                onChange={(e) => onChange('courseId', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                required
                            >
                                <option value="">Курс тандаңыз</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Offering аталышы (опция)
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => onChange('title', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: Жандуу интенсив 15-апрел"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Модалдуулук
                            </label>
                            <select
                                value={form.modality}
                                onChange={(e) => onChange('modality', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="ONLINE">Онлайн (Zoom/Meet)</option>
                                <option value="OFFLINE">Офлайн (жандуу)</option>
                                <option value="HYBRID">Гибрид</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                {modalityDescriptions[form.modality]}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Көрүнүү
                            </label>
                            <select
                                value={form.visibility}
                                onChange={(e) => onChange('visibility', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="PRIVATE">Жабык</option>
                                <option value="PUBLIC">Публичный (жалпы үчүн)</option>
                                <option value="UNLISTED">Сырткы шилтеме боюнча</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Башталышы
                            </label>
                            <input
                                type="datetime-local"
                                value={form.startAt}
                                onChange={(e) => onChange('startAt', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Аяктоосу
                            </label>
                            <input
                                type="datetime-local"
                                value={form.endAt}
                                onChange={(e) => onChange('endAt', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Статус
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => onChange('status', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                            >
                                <option value="DRAFT">Draft (жарыяланбаган)</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a6adba] mt-6">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(e) => onChange('isFeatured', e.target.checked)}
                            />
                            Featured offering катары белгилөө
                        </label>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                            Жайгашкан жери / Zoom шилтемеси / Расписаниеси
                        </label>
                        <textarea
                            value={form.scheduleNote}
                            onChange={(e) => onChange('scheduleNote', e.target.value)}
                            className="mt-1 w-full border rounded-2xl px-3 py-2 min-h-[100px]"
                            placeholder="Мисалы: Бишкек, Бизнес борбор 3-кабат. Же: Zoom — https://zoom.us/..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Даяр расписание блоктору
                            </label>
                            <button
                                type="button"
                                onClick={handleBlockAdd}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Блок кошуу
                            </button>
                        </div>

                        {scheduleBlocks.length ? (
                            <div className="mt-2 space-y-2">
                                {scheduleBlocks.map((block, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 gap-2 items-center border border-gray-100 rounded-2xl px-3 py-2"
                                    >
                                        <input
                                            type="text"
                                            className="col-span-4 border rounded-xl px-2 py-1 text-sm"
                                            placeholder="Күн (мисалы: Дүйшөмбү)"
                                            value={block.day}
                                            onChange={(e) => handleBlockChange(index, 'day', e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            className="col-span-3 border rounded-xl px-2 py-1 text-sm"
                                            value={block.startTime}
                                            onChange={(e) => handleBlockChange(index, 'startTime', e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            className="col-span-3 border rounded-xl px-2 py-1 text-sm"
                                            value={block.endTime}
                                            onChange={(e) => handleBlockChange(index, 'endTime', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="col-span-2 text-xs text-red-500"
                                            onClick={() => handleBlockRemove(index)}
                                        >
                                            Өчүрүү
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                Жума күндөрү жана убакыттарын кошуу үчүн "Блок кошуу" баскычын басыңыз.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Капасити (опция)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.capacity}
                                onChange={(e) => onChange('capacity', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: 25"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Бааны өзгөртүү (опция)
                            </label>
                            <input
                                type="text"
                                value={form.priceOverride}
                                onChange={(e) => onChange('priceOverride', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Мисалы: 4500 сом"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                                Компания ID (опция)
                            </label>
                            <input
                                type="text"
                                value={form.companyId}
                                onChange={(e) => onChange('companyId', e.target.value)}
                                className="mt-1 w-full border rounded-2xl px-3 py-2"
                                placeholder="Компания бириктирүү керек болсо"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-full border text-sm"
                            onClick={onClose}
                            disabled={creating}
                        >
                            Жабуу
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm disabled:opacity-60"
                            disabled={creating}
                        >
                            {creating
                                ? 'Сакталууда...'
                                : mode === 'edit'
                                    ? 'Өзгөртүүлөрдү сактоо'
                                    : 'Offering түзүү'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOfferingModal;
