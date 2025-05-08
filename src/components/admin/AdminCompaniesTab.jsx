import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from '../../services/api';

const AdminCompaniesTab = () => {
    const [companies, setCompanies] = useState([]);
    const [form, setForm] = useState({ name: '', email: '' });
    const [editingId, setEditingId] = useState(null);

    const loadCompanies = async () => {
        try {
            const data = await fetchCompanies();
            setCompanies(data);
        } catch {
            toast.error('Компанияларды жүктөөдө ката кетти');
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await updateCompany(editingId, form);
                toast.success('Компания жаңыртылды');
            } else {
                await createCompany(form);
                toast.success('Жаңы компания кошулду');
            }
            setForm({ name: '', email: '' });
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
                <input
                    className="border p-2"
                    placeholder="Email (башкы байланыш)"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
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
                            <p className="text-sm text-gray-500">{company.email}</p>
                        </div>
                        <div className="space-x-2">
                            <button
                                className="text-yellow-600 hover:underline"
                                onClick={() => {
                                    setForm({ name: company.name, email: company.email });
                                    setEditingId(company.id);
                                }}
                            >Түзөтүү</button>
                            <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDelete(company.id)}
                            >Өчүрүү</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminCompaniesTab;
