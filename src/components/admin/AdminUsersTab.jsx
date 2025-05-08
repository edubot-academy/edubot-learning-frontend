import React from 'react';
import { updateUserCompany } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsersTab = ({
    users,
    companies,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    totalPages,
    updateSearchParams,
    handleRoleChange,
    handleDeleteUser,
    handleApplyFilters,
}) => {
    const handleAssignCompany = async (userId, companyId) => {
        try {
            await updateUserCompany(userId, companyId);
            toast.success('Компания дайындалды');
        } catch {
            toast.error('Компания дайындоо катасы');
        }
    };
    console.log(users);
    console.log(companies);
    return (
        <div className="bg-white shadow rounded p-4">
            <h2 className="text-2xl font-semibold mb-4">Колдонуучулар</h2>

            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Ат же Email боюнча издөө"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
                <div className="flex flex-wrap gap-2 items-end">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">Бардык ролдор</option>
                        <option value="student">Студент</option>
                        <option value="instructor">Окутуучу</option>
                        <option value="sales">Сатуу</option>
                        <option value="sales.manager">Сатуу Менеджери</option>
                        <option value="sales.director">Сатуу Директору</option>
                        <option value="assistant">Ассистент</option>
                        <option value="company_owner">Компания ээси</option>
                        <option value="admin">Админ</option>
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                    <button
                        onClick={handleApplyFilters}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                        Фильтр
                    </button>
                    <button
                        onClick={() => {
                            setRoleFilter("");
                            setDateFrom("");
                            setDateTo("");
                            updateSearchParams({ role: "", dateFrom: "", dateTo: "", page: 1 });
                        }}
                        className="bg-gray-300 text-black px-4 py-1 rounded"
                    >
                        Тазалоо
                    </button>
                </div>
            </div>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Аты</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Роли</th>
                        <th className="p-2">Компания</th>
                        <th className="p-2">Катталган күнү</th>
                        <th className="p-2">Аракеттер</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="p-2">{user.fullName}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2 capitalize">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="sales">Sales</option>
                                    <option value="sales.manager">Sales Manager</option>
                                    <option value="sales.director">Sales Director</option>
                                    <option value="assistant">Assistant</option>
                                    <option value="company_owner">Company Owner</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className="p-2">
                                <select
                                    value={user.company?.name || ''}
                                    onChange={(e) => handleAssignCompany(user.id, e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">Компания тандаңыз</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="p-2">
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

            <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => updateSearchParams({ page: p })}
                        className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminUsersTab;
