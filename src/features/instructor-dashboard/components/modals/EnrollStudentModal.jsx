import Loader from '@shared/ui/Loader';

const EnrollStudentModal = ({
    offering,
    form,
    onChange,
    onClose,
    onSubmit,
    enrolling,
    students,
    loadingStudents,
    studentOptions,
    userSearch,
    onSearchChange,
    loadingUserOptions,
    showDropdown,
    setShowDropdown,
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
        <div className="rounded-3xl shadow-xl max-w-md w-full p-6 bg-white dark:bg-[#141619]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">Студент кошуу</p>
                    <h2 className="text-2xl font-semibold">{offering.course.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                        {offering.title || 'Offering'}
                    </p>
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
                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                        Студентти издөө жана тандоо
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => {
                                onSearchChange(e.target.value);
                                setShowDropdown(true);
                                onChange('userId', '');
                            }}
                            className="mt-1 w-full border rounded-2xl px-3 py-2"
                            placeholder="Аты же email (кеминде 2 тамга)"
                            onFocus={() => setShowDropdown(true)}
                        />

                        {showDropdown && studentOptions?.length > 0 && (
                            <div className="absolute mt-1 w-full border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-auto z-10 bg-white dark:bg-[#141619]">
                                {studentOptions.map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        className={`w-full text-left px-3 py-2 text-sm ${String(student.id) === form.userId
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        onClick={() => {
                                            onChange('userId', String(student.id));
                                            onSearchChange(student.name || student.email || '');
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <span className="font-medium">{student.name}</span>
                                        {student.email && (
                                            <span className="text-xs text-gray-500 dark:text-[#a6adba] ml-2">
                                                {student.email}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loadingUserOptions && <Loader fullScreen={false} />}

                    {!studentOptions?.length && userSearch.length >= 2 && !loadingUserOptions && (
                        <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-2">
                            Студент табылган жок.
                        </p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                        {form.userId
                            ? `Тандалган студент ID: ${form.userId}`
                            : 'Кеминде эки тамга издөө үчүн жазыңыз жана тизмеден тандаңыз.'}
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-[#a6adba]">
                        Скидка % (опция)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.discountPercentage}
                        onChange={(e) => onChange('discountPercentage', e.target.value)}
                        className="mt-1 w-full border rounded-2xl px-3 py-2"
                        placeholder="Мисалы: 10"
                    />
                </div>

                <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                    Offering ID: {offering.id}. Орундар:{' '}
                    {offering.capacity != null
                        ? `${offering.enrolledCount ?? 0}/${offering.capacity}`
                        : 'Чектелбеген'}
                </div>

                <div className="border rounded-2xl p-3">
                    <p className="text-sm font-medium mb-2">Азыркы студенттер</p>
                    {loadingStudents ? (
                        <Loader fullScreen={false} />
                    ) : students?.length ? (
                        <div className="space-y-2 max-h-40 overflow-auto">
                            {students.map((student) => (
                                <div key={student.id} className="text-sm">
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-[#a6adba]">
                                        {student.email}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-[#a6adba]">
                            Бул offeringде азырынча студент жок.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-full border text-sm"
                        onClick={onClose}
                        disabled={enrolling}
                    >
                        Жабуу
                    </button>

                    <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-green-600 text-white text-sm disabled:opacity-60"
                        disabled={enrolling}
                    >
                        {enrolling ? 'Кошууда...' : 'Студент кошуу'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default EnrollStudentModal;
