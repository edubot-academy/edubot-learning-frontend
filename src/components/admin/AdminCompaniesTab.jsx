import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    fetchCompanies,
    fetchUsers,
    createCompany,
    updateCompany,
    deleteCompany
} from '../../services/api';

const AdminCompaniesTab = () => {
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', ownerId: '' });
    const [editingId, setEditingId] = useState(null);

    const loadCompanies = async () => {
        try {
            const res = await fetchCompanies();
            setCompanies(res.data);
        } catch {
            toast.error('Компанияларды жүктөөдө ката кетти');
        }
    };

    const loadUsers = async () => {
        try {
            const res = await fetchUsers({});
            setUsers(res.data);
        } catch {
            toast.error('Колдонуучуларды жүктөө катасы');
        }
    };

    useEffect(() => {
        loadCompanies();
        loadUsers();
    }, []);

    const handleSubmit = async () => {
        try {
            const payload = {
                name: form.name,
                description: form.description,
                ownerId: form.ownerId ? parseInt(form.ownerId) : undefined,
            };

            if (editingId) {
                await updateCompany(editingId, payload);
                toast.success('Компания жаңыртылды');
            } else {
                await createCompany(payload);
                toast.success('Жаңы компания кошулду');
            }

            setForm({ name: '', description: '', ownerId: '' });
            setEditingId(null);
            loadCompanies();
        } catch {
            toast.error('Сактоо катасы');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Компанияны өчүрүүнү каалайсызбы?')) return;
        try {
            await deleteCompany(id);
            toast.success('Компания өчүрүлдү');
            loadCompanies();
        } catch {
            toast.error('Өчүрүү катасы');
        }
    };

    return (
        <div className="bg-white shadow rounded p-4">
            <h2 className="text-2xl font-bold mb-4">Компаниялар</h2>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <input
                    className="border p-2"
                    placeholder="Компаниянын аталышы"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                    className="border p-2"
                    placeholder="Компаниянын толук маалыматы"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <select
                    className="border p-2 col-span-2"
                    value={form.ownerId}
                    onChange={e => setForm({ ...form, ownerId: e.target.value })}
                >
                    <option value="">Компания ээси (тандаңыз)</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                        </option>
                    ))}
                </select>
                <button
                    className="col-span-2 bg-blue-600 text-white py-2 rounded"
                    onClick={handleSubmit}
                >
                    {editingId ? 'Жаңыртуу' : 'Кошуу'}
                </button>
            </div>

            <ul className="space-y-2">
                {companies.map((company) => (
                    <li key={company.id} className="border p-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-gray-500">{company.description}</p>
                            {company.owners && company.owners.length > 0 && (
                                <p className="text-sm text-green-700 mt-1">
                                    Ээлери: {company.owners.map(o => o.fullName).join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="space-x-2">
                            <button
                                className="text-yellow-600 hover:underline"
                                onClick={() => {
                                    setForm({
                                        name: company.name,
                                        description: company.description,
                                        ownerId: company.owners?.[0]?.id || '',
                                    });
                                    setEditingId(company.id);
                                }}
                            >
                                Түзөтүү
                            </button>
                            <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDelete(company.id)}
                            >
                                Өчүрүү
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminCompaniesTab;
