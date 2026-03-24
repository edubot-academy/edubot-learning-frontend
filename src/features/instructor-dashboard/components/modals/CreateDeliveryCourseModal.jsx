const CreateDeliveryCourseModal = ({
    deliveryCourse,
    onDeliveryCourseChange,
    onCloseDeliveryModal,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    deliveryCategories,
}) => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-edubot-dark dark:text-white">
                    Оффлайн / Онлайн түз эфир курс түзүү
                </h3>
                <button
                    type="button"
                    onClick={onCloseDeliveryModal}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Жабуу
                </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm mb-1">Курс түрү</label>
                    <select
                        name="courseType"
                        value={deliveryCourse.courseType}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    >
                        <option value="offline">Оффлайн</option>
                        <option value="online_live">Онлайн түз эфир</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Сабак тили</label>
                    <select
                        name="languageCode"
                        value={deliveryCourse.languageCode}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    >
                        <option value="ky">Кыргызча</option>
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Курс аталышы</label>
                    <input
                        name="title"
                        value={deliveryCourse.title}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Сүрөттөмө</label>
                    <textarea
                        name="description"
                        value={deliveryCourse.description}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Категория</label>
                    <select
                        name="categoryId"
                        value={deliveryCourse.categoryId}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    >
                        <option value="">Тандаңыз</option>
                        {deliveryCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Баасы (сом)</label>
                    <input
                        name="price"
                        type="number"
                        min="0"
                        value={deliveryCourse.price}
                        onChange={onDeliveryCourseChange}
                        className="w-full border p-2 rounded bg-white dark:bg-[#222222] dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCloseDeliveryModal}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                >
                    Жокко чыгаруу
                </button>
                <button
                    type="button"
                    onClick={onCreateDeliveryCourse}
                    disabled={creatingDeliveryCourse}
                    className="px-4 py-2 rounded bg-edubot-teal text-white disabled:opacity-60"
                >
                    {creatingDeliveryCourse ? 'Түзүлүүдө...' : 'Түзүү'}
                </button>
            </div>
        </div>
    </div>
);

export default CreateDeliveryCourseModal;
