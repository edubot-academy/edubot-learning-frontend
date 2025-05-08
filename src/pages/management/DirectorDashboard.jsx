import React, { useEffect, useState } from 'react';
import {
    getManagers,
    createManager,
    updateManager,
    deleteManager,
    getDirectorStudents,
} from '../../services/api';
import toast from 'react-hot-toast';

export const DirectorDashboard = () => {
    const [managers, setManagers] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mgrs, studs] = await Promise.all([
                getManagers(),
                getDirectorStudents(),
            ]);
            setManagers(mgrs);
            setStudents(studs);
        } catch (err) {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async () => {
        if (editingId) {
            await handleUpdateManager(editingId, form);
        } else {
            await handleCreateManager(form);
        }
        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
        setEditingId(null);
    };

    const handleCreateManager = async (data) => {
        try {
            await createManager(data);
            toast.success('Менеджер ийгиликтүү кошулду');
            loadData();
        } catch {
            toast.error('Менеджерди кошууда ката кетти');
        }
    };

    const handleUpdateManager = async (id, data) => {
        try {
            await updateManager(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch {
            toast.error('Жаңыртуу учурунда ката кетти');
        }
    };

    const handleDeleteManager = async (id) => {
        try {
            await deleteManager(id);
            toast.success('Менеджер өчүрүлдү');
            loadData();
        } catch {
            toast.error('Өчүрүү учурунда ката кетти');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold">Директордун башкаруу панели</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Менеджер кошуу / өзгөртүү</h3>
                <div className="grid grid-cols-2 gap-2">
                    <input className="border p-2" placeholder="Толук аты" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    <input className="border p-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input className="border p-2" placeholder="Телефон номери" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                    <input className="border p-2" placeholder="Сырсөз" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? 'Өзгөртүү' : 'Кошуу'} Менеджер</button>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Менеджерлер тизмеси</h3>
                <ul className="space-y-2">
                    {managers.map(m => (
                        <li key={m.id} className="flex items-center justify-between border p-2">
                            <span>{m.fullName} - {m.email}</span>
                            <div className="space-x-2">
                                <button onClick={() => { setForm(m); setEditingId(m.id); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Түзөтүү</button>
                                <button onClick={() => handleDeleteManager(m.id)} className="px-2 py-1 bg-red-600 text-white rounded">Өчүрүү</button>
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

export default DirectorDashboard;
