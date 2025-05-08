// management/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
    getSalesUsers,
    createSalesUser,
    updateSalesUser,
    deleteSalesUser,
    getSalesStudents,
} from '../../services/api'
import toast from 'react-hot-toast';

export const ManagerDashboard = () => {
    const [sales, setSales] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [salesList, studentsList] = await Promise.all([
                getSalesUsers(),
                getSalesStudents(),
            ]);
            setSales(salesList);
            setStudents(studentsList);
        } catch {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async () => {
        if (editingId) {
            await handleUpdateSales(editingId, form);
        } else {
            await handleCreateSales(form);
        }
        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
        setEditingId(null);
    };

    const handleCreateSales = async (data) => {
        try {
            await createSalesUser(data);
            toast.success('Сатуу менеджери кошулду');
            loadData();
        } catch {
            toast.error('Ката: кошуу мүмкүн болбоду');
        }
    };

    const handleUpdateSales = async (id, data) => {
        try {
            await updateSalesUser(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch {
            toast.error('Жаңыртуу ишке ашкан жок');
        }
    };

    const handleDeleteSales = async (id) => {
        try {
            await deleteSalesUser(id);
            toast.success('Сатуу менеджери өчүрүлдү');
            loadData();
        } catch {
            toast.error('Өчүрүүдө ката кетти');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold">Менеджер панелинен башкаруу</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Сатуу менеджерин кошуу / өзгөртүү</h3>
                <div className="grid grid-cols-2 gap-2">
                    <input className="border p-2" placeholder="Толук аты" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    <input className="border p-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input className="border p-2" placeholder="Телефон номери" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                    <input className="border p-2" placeholder="Сырсөз" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? 'Өзгөртүү' : 'Кошуу'}</button>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Сатуу командасы</h3>
                <ul className="space-y-2">
                    {sales.map(s => (
                        <li key={s.id} className="flex items-center justify-between border p-2">
                            <span>{s.fullName} - {s.email}</span>
                            <div className="space-x-2">
                                <button onClick={() => { setForm(s); setEditingId(s.id); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Түзөтүү</button>
                                <button onClick={() => handleDeleteSales(s.id)} className="px-2 py-1 bg-red-600 text-white rounded">Өчүрүү</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Сатуу командасы каттаган студенттер</h3>
                <ul className="list-disc pl-5">
                    {students.map(s => (
                        <li key={s.id}>{s.fullName} - {s.email}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default ManagerDashboard;
