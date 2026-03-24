const AdminUsersTab = ({
    users,
    usersPage,
    usersTotalPages,
    usersTotal,
    search,
    roleFilter,
    dateFrom,
    dateTo,
    setSearch,
    setRoleFilter,
    setDateFrom,
    setDateTo,
    handleRoleChange,
    handleDeleteUser,
    handleUsersPageChange,
    renderUserPageButtons
}) => {
    return (
        <div className="bg-white dark:bg-black shadow rounded p-4">
            <h2 className="text-2xl font-semibold mb-4">Колдонуучулар</h2>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Ат же Email боюнча издөө"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                />
                <div className="flex flex-wrap gap-2 items-end">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                    >
                        <option value="">Бардык ролдор</option>
                        <option value="student">Студент</option>
                        <option value="instructor">Окутуучу</option>
                        <option value="assistant">Ассистент</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                    />
                </div>
            </div>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Аты</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Роль</th>
                        <th className="p-2">Аракеттер</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="p-2">{user.fullName}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2 flex gap-2">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="border px-2 py-1 rounded dark:bg-black dark:text-[#E8ECF3]"
                                >
                                    <option value="student">Студент</option>
                                    <option value="instructor">Окутуучу</option>
                                    <option value="assistant">Ассистент</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Өчүрүү
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                    Баракча {usersPage} / {usersTotalPages} · Бардыгы: {usersTotal}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleUsersPageChange(usersPage - 1)}
                        disabled={usersPage <= 1}
                        className="px-3 py-2 rounded border text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Алдыңкы
                    </button>
                    <div className="flex items-center gap-1">{renderUserPageButtons()}</div>
                    <button
                        type="button"
                        onClick={() => handleUsersPageChange(usersPage + 1)}
                        disabled={usersPage >= usersTotalPages}
                        className="px-3 py-2 rounded border text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Кийинки
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersTab;
