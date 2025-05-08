// management/CompanyOwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
    getCompanyTeam,
    getCompanyStudents,
    getDirectors,
    createDirector,
    updateDirector,
    deleteDirector,
} from '../../services/api';
import toast from 'react-hot-toast';

export const CompanyOwnerDashboard = () => {
    const [directors, setDirectors] = useState([]);
    const [students, setStudents] = useState([]);
    const [team, setTeam] = useState([]);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dir, stu, staff] = await Promise.all([
                getDirectors(),
                getCompanyStudents(),
                getCompanyTeam(),
            ]);
            setDirectors(dir);
            setStudents(stu);
            setTeam(staff);
        } catch (error) {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async () => {
        if (editingId) {
            await handleUpdateDirector(editingId, form);
        } else {
            await handleCreateDirector(form);
        }
        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
        setEditingId(null);
    };

    const handleCreateDirector = async (data) => {
        try {
            await createDirector(data);
            toast.success('Директор кошулду');
            loadData();
        } catch (err) {
            toast.error('Директорду кошууда ката кетти');
        }
    };

    const handleUpdateDirector = async (id, data) => {
        try {
            await updateDirector(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch (err) {
            toast.error('Жаңыртуу учурунда ката кетти');
        }
    };

    const handleDeleteDirector = async (id) => {
        try {
            await deleteDirector(id);
            toast.success('Директор өчүрүлдү');
            loadData();
        } catch (err) {
            toast.error('Өчүрүүдө ката кетти');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold">Компания ээсинин башкаруу панели</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Директор кошуу / өзгөртүү</h3>
                <div className="grid grid-cols-2 gap-2">
                    <input className="border p-2" placeholder="Толук аты" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    <input className="border p-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <input className="border p-2" placeholder="Телефон номери" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                    <input className="border p-2" placeholder="Сырсөз" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? 'Өзгөртүү' : 'Кошуу'} Директор</button>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Директорлор тизмеси</h3>
                <ul className="space-y-2">
                    {directors.map(d => (
                        <li key={d.id} className="flex items-center justify-between border p-2">
                            <span>{d.fullName} - {d.email}</span>
                            <div className="space-x-2">
                                <button onClick={() => { setForm(d); setEditingId(d.id); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Түзөтүү</button>
                                <button onClick={() => handleDeleteDirector(d.id)} className="px-2 py-1 bg-red-600 text-white rounded">Өчүрүү</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Компаниядагы студенттер</h3>
                <ul className="list-disc pl-5">
                    {students.map(s => (
                        <li key={s.id}>{s.fullName} - {s.email}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Команда мүчөлөрү</h3>
                <ul className="list-disc pl-5">
                    {team.map(t => (
                        <li key={t.id}>{t.fullName} - {t.role}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default CompanyOwnerDashboard;
